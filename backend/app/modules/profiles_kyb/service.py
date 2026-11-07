from datetime import datetime, timezone
from decimal import Decimal
import json
import logging
import os
from pathlib import Path
from typing import Any, Optional
from uuid import UUID, uuid4

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Header,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.mailer import send_email_async
from app.core.security import generate_secure_token, hash_token
from app.modules.auth_rbac.service import (
    CurrentUser,
    get_current_user,
    get_me_payload,
    require_role,
    require_verified_org,
)
from app.modules.notifications.service import notify

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Profiles & KYB"])

# Ensure docs directory exists
os.makedirs(settings.KYB_DOCS_DIR, exist_ok=True)


# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class ProfileUpdateRequest(BaseModel):
    # General / Shared
    legal_name: Optional[str] = None
    tax_id: Optional[str] = None  # 9 digits
    contact_phone: Optional[str] = None  # +998...
    address_text: Optional[str] = None
    lat: Optional[Decimal] = None
    lng: Optional[Decimal] = None
    bank_iban: Optional[str] = None
    daily_capacity_liters: Optional[Decimal] = None

    # Farmer specific
    cattle_headcount: Optional[int] = None
    cooling_tank_capacity_liters: Optional[Decimal] = None

    # Industry specific
    signatory_name: Optional[str] = None
    silo_capacity_liters: Optional[Decimal] = None
    intake_from: Optional[str] = None  # HH:MM
    intake_to: Optional[str] = None  # HH:MM
    confirm_quality_matrix: Optional[bool] = None

    # Bank specific
    license_number: Optional[str] = None
    contact_person: Optional[str] = None
    settlement_account: Optional[str] = None
    default_factoring_fee_pct: Optional[Decimal] = None
    max_tenor_days: Optional[int] = None
    webhook_url: Optional[str] = None


class RejectRequest(BaseModel):
    reason: str = Field(min_length=10)


class SuspendRequest(BaseModel):
    reason: str = Field(min_length=5)


class BankInviteRequest(BaseModel):
    org_name: str = Field(min_length=2, max_length=255)
    officer_name: str = Field(min_length=2, max_length=150)
    officer_email: EmailStr


class AddTeamMemberRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: Optional[str] = None
    sub_role: str = Field(pattern="^(DRIVER|LAB_TECH|GATE_RECEIVER)$")


# -----------------------------------------------------------------------------
# Helper: Write Immutable Audit Log (Rule 03 & Section 5.1)
# -----------------------------------------------------------------------------
async def write_audit_log(
    db: AsyncSession,
    actor_user_id: Optional[UUID],
    action: str,
    entity_type: str,
    entity_id: UUID,
    details: dict[str, Any],
) -> None:
    # Convert all Decimals to string to enforce: "decimals stored as strings, never floats"
    clean_details = {}
    for k, v in details.items():
        if isinstance(v, Decimal):
            clean_details[k] = str(v)
        else:
            clean_details[k] = v

    stmt = text(
        """
        INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details, created_at)
        VALUES (:actor, :action, :entity_type, :entity_id, :details, NOW())
        """
    )
    await db.execute(
        stmt,
        {
            "actor": actor_user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": json.dumps(clean_details),
        },
    )


# =============================================================================
# 1. PROFILE ENDPOINTS (/api/v1/profile)
# =============================================================================
@router.get("/profile")
async def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Query complete profile and return
    stmt = text(
        """
        SELECT o.id, o.role, o.legal_name, o.tax_id, o.kyb_status, o.kyb_review_note,
               o.address_text, o.contact_phone, o.daily_capacity_liters, o.trust_score,
               o.approved_credit_limit, o.bank_iban,
               ST_Y(o.location::geometry) AS lat, ST_X(o.location::geometry) AS lng,
               fp.cattle_headcount, fp.cooling_tank_capacity_liters,
               ip.signatory_name, ip.silo_capacity_liters, ip.intake_from, ip.intake_to,
               ip.std_fat_pct, ip.std_snf_pct, ip.alpha_fat_coeff, ip.beta_snf_coeff,
               ip.max_temp_optimal_c, ip.max_temp_reject_c, ip.max_acidity_turner,
               ip.matrix_confirmed_at,
               bp.license_number, bp.contact_person, bp.settlement_account,
               bp.default_factoring_fee_pct, bp.max_tenor_days, bp.webhook_url
        FROM organizations o
        LEFT JOIN farm_profiles fp ON fp.organization_id = o.id
        LEFT JOIN industry_profiles ip ON ip.organization_id = o.id
        LEFT JOIN bank_profiles bp ON bp.organization_id = o.id
        WHERE o.id = :org_id
        """
    )
    res = await db.execute(stmt, {"org_id": current_user.organization_id})
    row = res.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Fetch documents
    docs_res = await db.execute(
        text("SELECT doc_type, original_filename, size_bytes, uploaded_at FROM kyb_documents WHERE organization_id = :org_id"),
        {"org_id": current_user.organization_id},
    )
    docs = [dict(d) for d in docs_res.mappings().all()]

    me_payload = await get_me_payload(db, current_user)

    data = dict(row)
    data["documents"] = docs
    data["completion"] = me_payload["completion"]
    return data


@router.put("/profile")
@router.put("/profile/{section}")
async def update_profile(
    data: ProfileUpdateRequest,
    section: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Section 5.2 Access Gate Matrix:
    # Editable in INCOMPLETE and REJECTED.
    # In VERIFIED: sensitive fields (legal_name, tax_id, bank_iban, location) locked.
    # In SUBMITTED or SUSPENDED: read-only -> 409
    if current_user.kyb_status in ("SUBMITTED", "SUSPENDED"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Profile is read-only while in {current_user.kyb_status} status",
        )

    is_verified = (current_user.kyb_status == "VERIFIED")

    # Validation: Tax ID format (9 digits)
    if data.tax_id:
        tax_id_clean = data.tax_id.strip()
        if not (len(tax_id_clean) == 9 and tax_id_clean.isdigit()):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Tax ID (STIR/INN) must be exactly 9 digits",
            )
        # Check uniqueness across platform
        dup = await db.execute(
            text("SELECT id FROM organizations WHERE tax_id = :tax_id AND id != :org_id"),
            {"tax_id": tax_id_clean, "org_id": current_user.organization_id},
        )
        if dup.first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tax ID already registered to another organization",
            )

    # Validation: Phone format
    if data.contact_phone:
        phone_clean = data.contact_phone.strip()
        if not phone_clean.startswith("+998"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Phone number must be in Uzbekistan format (+998XXXXXXXXX)",
            )

    # Validation: Location must fall inside Uzbekistan bounds (lat ~37 to 46, lng ~56 to 74)
    if data.lat is not None and data.lng is not None:
        if not (Decimal("36.5") <= data.lat <= Decimal("46.0") and Decimal("55.0") <= data.lng <= Decimal("74.0")):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="GPS location pin must fall inside Uzbekistan territory",
            )

    # 1. Update organizations table
    org_updates = []
    org_params: dict[str, Any] = {"org_id": current_user.organization_id}

    if not is_verified:
        if data.legal_name is not None:
            org_updates.append("legal_name = :legal_name")
            org_params["legal_name"] = data.legal_name.strip()
        if data.tax_id is not None:
            org_updates.append("tax_id = :tax_id")
            org_params["tax_id"] = data.tax_id.strip()
        if data.bank_iban is not None:
            org_updates.append("bank_iban = :bank_iban")
            org_params["bank_iban"] = data.bank_iban.strip()
        if data.lat is not None and data.lng is not None:
            org_updates.append("location = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography")
            org_params["lat"] = float(data.lat)
            org_params["lng"] = float(data.lng)

    # Non-sensitive fields always editable
    if data.address_text is not None:
        org_updates.append("address_text = :address_text")
        org_params["address_text"] = data.address_text.strip()
    if data.contact_phone is not None:
        org_updates.append("contact_phone = :contact_phone")
        org_params["contact_phone"] = data.contact_phone.strip()
    if data.daily_capacity_liters is not None:
        org_updates.append("daily_capacity_liters = :daily_capacity")
        org_params["daily_capacity"] = data.daily_capacity_liters

    if org_updates:
        sql = f"UPDATE organizations SET {', '.join(org_updates)} WHERE id = :org_id"
        await db.execute(text(sql), org_params)

    # 2. Update role-specific profile table
    if current_user.role == "FARMER":
        farm_updates = []
        farm_params: dict[str, Any] = {"org_id": current_user.organization_id}
        if data.cattle_headcount is not None:
            farm_updates.append("cattle_headcount = :cattle")
            farm_params["cattle"] = data.cattle_headcount
        if data.cooling_tank_capacity_liters is not None:
            farm_updates.append("cooling_tank_capacity_liters = :tank")
            farm_params["tank"] = data.cooling_tank_capacity_liters

        if farm_updates:
            farm_updates.append("updated_at = NOW()")
            await db.execute(
                text(f"UPDATE farm_profiles SET {', '.join(farm_updates)} WHERE organization_id = :org_id"),
                farm_params,
            )

    elif current_user.role == "INDUSTRY":
        ind_updates = []
        ind_params: dict[str, Any] = {"org_id": current_user.organization_id}
        if data.signatory_name is not None:
            ind_updates.append("signatory_name = :sig")
            ind_params["sig"] = data.signatory_name.strip()
        if data.silo_capacity_liters is not None:
            ind_updates.append("silo_capacity_liters = :silo")
            ind_params["silo"] = data.silo_capacity_liters
        if data.intake_from is not None:
            ind_updates.append("intake_from = :in_from::time")
            ind_params["in_from"] = data.intake_from
        if data.intake_to is not None:
            ind_updates.append("intake_to = :in_to::time")
            ind_params["in_to"] = data.intake_to
        if data.confirm_quality_matrix:
            ind_updates.append("matrix_confirmed_at = NOW()")

        if ind_updates:
            ind_updates.append("updated_at = NOW()")
            await db.execute(
                text(f"UPDATE industry_profiles SET {', '.join(ind_updates)} WHERE organization_id = :org_id"),
                ind_params,
            )

    elif current_user.role == "BANK":
        bank_updates = []
        bank_params: dict[str, Any] = {"org_id": current_user.organization_id}
        if data.license_number is not None:
            bank_updates.append("license_number = :lic")
            bank_params["lic"] = data.license_number.strip()
        if data.contact_person is not None:
            bank_updates.append("contact_person = :cp")
            bank_params["cp"] = data.contact_person.strip()
        if data.settlement_account is not None:
            bank_updates.append("settlement_account = :sa")
            bank_params["sa"] = data.settlement_account.strip()
        if data.default_factoring_fee_pct is not None:
            bank_updates.append("default_factoring_fee_pct = :fee")
            bank_params["fee"] = data.default_factoring_fee_pct
        if data.max_tenor_days is not None:
            bank_updates.append("max_tenor_days = :tenor")
            bank_params["tenor"] = data.max_tenor_days
        if data.webhook_url is not None:
            bank_updates.append("webhook_url = :webhook")
            bank_params["webhook"] = data.webhook_url.strip()

        if bank_updates:
            bank_updates.append("updated_at = NOW()")
            await db.execute(
                text(f"UPDATE bank_profiles SET {', '.join(bank_updates)} WHERE organization_id = :org_id"),
                bank_params,
            )

    await db.commit()
    return {"status": "saved"}


# -----------------------------------------------------------------------------
# Document Uploads & Management (Section 5.3 & 10)
# -----------------------------------------------------------------------------
@router.post("/profile/documents")
async def upload_document(
    doc_type: str,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    valid_types = {
        "REGISTRATION_CERT", "TAX_CERT", "VET_CERT", "SANITARY_PERMIT", "BANK_LICENSE"
    }
    if doc_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid doc_type")

    if current_user.kyb_status in ("SUBMITTED", "SUSPENDED"):
        raise HTTPException(status_code=409, detail="Documents cannot be changed during review")

    # Read bytes and check size (<= 5MB)
    content = await file.read()
    if len(content) > 5242880:
        raise HTTPException(status_code=413, detail="File size exceeds maximum allowed 5 MB")

    # Verify magic bytes: PDF (%PDF), PNG (\x89PNG), JPG (\xff\xd8\xff)
    mime_type = file.content_type or "application/octet-stream"
    if content.startswith(b"%PDF"):
        mime_type = "application/pdf"
    elif content.startswith(b"\x89PNG\r\n\x1a\n"):
        mime_type = "image/png"
    elif content.startswith(b"\xff\xd8\xff"):
        mime_type = "image/jpeg"
    else:
        raise HTTPException(status_code=415, detail="Unsupported file format. Must be PDF, JPG or PNG.")

    # Save to disk
    ext = Path(file.filename or "doc").suffix or ".bin"
    doc_id = uuid4()
    filename = f"{current_user.organization_id}_{doc_type}_{doc_id}{ext}"
    filepath = os.path.join(settings.KYB_DOCS_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    # Upsert in database
    stmt = text(
        """
        INSERT INTO kyb_documents (
            id, organization_id, doc_type, storage_path, original_filename,
            mime_type, size_bytes, uploaded_by, uploaded_at
        ) VALUES (
            :id, :org_id, :doc_type, :storage_path, :orig_name,
            :mime, :size, :uploaded_by, NOW()
        )
        ON CONFLICT (organization_id, doc_type) DO UPDATE SET
            storage_path = EXCLUDED.storage_path,
            original_filename = EXCLUDED.original_filename,
            mime_type = EXCLUDED.mime_type,
            size_bytes = EXCLUDED.size_bytes,
            uploaded_by = EXCLUDED.uploaded_by,
            uploaded_at = NOW()
        """
    )
    await db.execute(
        stmt,
        {
            "id": doc_id,
            "org_id": current_user.organization_id,
            "doc_type": doc_type,
            "storage_path": filepath,
            "orig_name": file.filename or "uploaded_document",
            "mime": mime_type,
            "size": len(content),
            "uploaded_by": current_user.id,
        },
    )
    await db.commit()

    return {"status": "uploaded", "doc_type": doc_type, "filename": file.filename}


@router.delete("/profile/documents/{doc_type}")
async def delete_document(
    doc_type: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    if current_user.kyb_status in ("SUBMITTED", "SUSPENDED"):
        raise HTTPException(status_code=409, detail="Documents cannot be deleted during review")

    res = await db.execute(
        text("SELECT storage_path FROM kyb_documents WHERE organization_id = :org_id AND doc_type = :doc_type"),
        {"org_id": current_user.organization_id, "doc_type": doc_type},
    )
    row = res.first()
    if row and os.path.exists(row[0]):
        try:
            os.remove(row[0])
        except Exception:
            pass

    await db.execute(
        text("DELETE FROM kyb_documents WHERE organization_id = :org_id AND doc_type = :doc_type"),
        {"org_id": current_user.organization_id, "doc_type": doc_type},
    )
    await db.commit()
    return {"status": "deleted"}


# -----------------------------------------------------------------------------
# Submit Profile for Admin KYB Review (Section 5.1 & 10)
# -----------------------------------------------------------------------------
@router.post("/profile/submit")
async def submit_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Section 5.4: 'Submit for review' enabled only at 100% with a verified email
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="EMAIL_NOT_VERIFIED",
        )

    me_payload = await get_me_payload(db, current_user)
    if me_payload["completion"]["percent"] < 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "PROFILE_INCOMPLETE",
                "missing_fields": me_payload["completion"]["missing"],
            },
        )

    # Valid transitions: INCOMPLETE -> SUBMITTED or REJECTED -> SUBMITTED
    if current_user.kyb_status not in ("INCOMPLETE", "REJECTED"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot submit profile from current status {current_user.kyb_status}",
        )

    # Transition with SELECT ... FOR UPDATE NOWAIT
    res = await db.execute(
        text("SELECT id FROM organizations WHERE id = :org_id FOR UPDATE NOWAIT"),
        {"org_id": current_user.organization_id},
    )
    if not res.first():
        raise HTTPException(status_code=404, detail="Organization not found")

    await db.execute(
        text(
            """
            UPDATE organizations
            SET kyb_status = 'SUBMITTED',
                kyb_submitted_at = NOW(),
                kyb_review_note = NULL
            WHERE id = :org_id
            """
        ),
        {"org_id": current_user.organization_id},
    )

    await write_audit_log(
        db,
        actor_user_id=current_user.id,
        action="KYB_SUBMITTED",
        entity_type="ORGANIZATION",
        entity_id=current_user.organization_id,
        details={"status": "SUBMITTED"},
    )

    await db.commit()
    return {"status": "SUBMITTED", "message": "Profile submitted for Admin KYB review"}


# =============================================================================
# 2. ADMIN KYB REVIEW CONSOLE (/api/v1/admin/kyb/*)
# =============================================================================
@router.get("/admin/kyb/queue")
async def get_kyb_queue(
    status_filter: Optional[str] = "SUBMITTED",
    current_user: CurrentUser = Depends(require_role(["ADMIN"], ["SUPERADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    # Section 5.5: Queue defaults to SUBMITTED, oldest first
    sql = """
        SELECT o.id, o.role, o.legal_name, o.tax_id, o.kyb_status,
               o.kyb_submitted_at, o.created_at, u.full_name AS owner_name, u.email AS owner_email
        FROM organizations o
        JOIN users u ON u.organization_id = o.id AND u.sub_role = 'OWNER'
    """
    params: dict[str, Any] = {}
    if status_filter:
        sql += " WHERE o.kyb_status = :status_filter"
        params["status_filter"] = status_filter
    sql += " ORDER BY o.kyb_submitted_at ASC NULLS LAST, o.created_at ASC"

    res = await db.execute(text(sql), params)
    rows = res.mappings().all()
    return [dict(r) for r in rows]


@router.get("/admin/kyb/{org_id}")
async def get_kyb_detail(
    org_id: UUID,
    current_user: CurrentUser = Depends(require_role(["ADMIN"], ["SUPERADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    stmt = text(
        """
        SELECT o.id, o.role, o.legal_name, o.tax_id, o.kyb_status, o.kyb_submitted_at,
               o.kyb_reviewed_at, o.kyb_review_note, o.address_text, o.contact_phone,
               o.daily_capacity_liters, o.trust_score, o.approved_credit_limit, o.bank_iban,
               ST_Y(o.location::geometry) AS lat, ST_X(o.location::geometry) AS lng,
               u.full_name AS owner_name, u.email AS owner_email,
               (u.email_verified_at IS NOT NULL) AS email_verified,
               fp.cattle_headcount, fp.cooling_tank_capacity_liters,
               ip.signatory_name, ip.silo_capacity_liters, ip.intake_from, ip.intake_to,
               bp.license_number, bp.contact_person, bp.settlement_account, bp.webhook_url
        FROM organizations o
        JOIN users u ON u.organization_id = o.id AND u.sub_role = 'OWNER'
        LEFT JOIN farm_profiles fp ON fp.organization_id = o.id
        LEFT JOIN industry_profiles ip ON ip.organization_id = o.id
        LEFT JOIN bank_profiles bp ON bp.organization_id = o.id
        WHERE o.id = :org_id
        """
    )
    res = await db.execute(stmt, {"org_id": org_id})
    row = res.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Check for duplicate tax_id warning
    dup_warning = False
    if row["tax_id"]:
        dup_res = await db.execute(
            text("SELECT id FROM organizations WHERE tax_id = :tax_id AND id != :org_id"),
            {"tax_id": row["tax_id"], "org_id": org_id},
        )
        if dup_res.first():
            dup_warning = True

    # Get documents
    docs_res = await db.execute(
        text("SELECT id, doc_type, storage_path, original_filename, mime_type, size_bytes, uploaded_at FROM kyb_documents WHERE organization_id = :org_id"),
        {"org_id": org_id},
    )
    docs = [dict(d) for d in docs_res.mappings().all()]

    data = dict(row)
    data["tax_id_duplicate_warning"] = dup_warning
    data["documents"] = docs
    return data


@router.post("/admin/kyb/{org_id}/approve")
async def approve_kyb(
    org_id: UUID,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    current_user: CurrentUser = Depends(require_role(["ADMIN"], ["SUPERADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    # Section 5.1: Idempotency-Key required, SELECT FOR UPDATE NOWAIT
    res = await db.execute(
        text("SELECT id, kyb_status, role FROM organizations WHERE id = :org_id FOR UPDATE NOWAIT"),
        {"org_id": org_id},
    )
    org_row = res.mappings().first()
    if not org_row:
        raise HTTPException(status_code=404, detail="Organization not found")

    if org_row["kyb_status"] not in ("SUBMITTED", "INCOMPLETE", "PENDING", "REJECTED"):
        raise HTTPException(status_code=409, detail=f"Cannot approve organization from status {org_row['kyb_status']}")

    await db.execute(
        text(
            """
            UPDATE organizations
            SET kyb_status = 'VERIFIED',
                kyb_reviewed_at = NOW(),
                kyb_reviewed_by = :reviewer,
                kyb_review_note = NULL
            WHERE id = :org_id
            """
        ),
        {"org_id": org_id, "reviewer": current_user.id},
    )

    await write_audit_log(
        db,
        actor_user_id=current_user.id,
        action="KYB_APPROVED",
        entity_type="ORGANIZATION",
        entity_id=org_id,
        details={"status": "VERIFIED"},
    )

    # Notify Owner
    owner_res = await db.execute(
        text("SELECT id, email FROM users WHERE organization_id = :org_id AND sub_role = 'OWNER'"),
        {"org_id": org_id},
    )
    owner = owner_res.first()
    if owner:
        await notify(
            db,
            user_id=owner[0],
            notif_type="KYB_VERIFIED",
            title="KYB Verification Approved",
            body="Congratulations! Your organization has been verified. All platform features are now unlocked.",
            link_path="/",
        )
        await send_email_async(
            to_email=owner[1],
            subject="ZaminFlow: Your Account Has Been Approved",
            body_text="Your organization profile has been reviewed and approved by the ZaminFlow Compliance team.",
        )

    await db.commit()
    return {"status": "VERIFIED"}


@router.post("/admin/kyb/{org_id}/reject")
async def reject_kyb(
    org_id: UUID,
    data: RejectRequest,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    current_user: CurrentUser = Depends(require_role(["ADMIN"], ["SUPERADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    # Section 5.5: Reject (reason of at least 10 characters, shown to the user)
    res = await db.execute(
        text("SELECT id, kyb_status FROM organizations WHERE id = :org_id FOR UPDATE NOWAIT"),
        {"org_id": org_id},
    )
    org_row = res.mappings().first()
    if not org_row:
        raise HTTPException(status_code=404, detail="Organization not found")

    if org_row["kyb_status"] != "SUBMITTED":
        raise HTTPException(status_code=409, detail=f"Cannot reject organization from status {org_row['kyb_status']}")

    await db.execute(
        text(
            """
            UPDATE organizations
            SET kyb_status = 'REJECTED',
                kyb_reviewed_at = NOW(),
                kyb_reviewed_by = :reviewer,
                kyb_review_note = :reason
            WHERE id = :org_id
            """
        ),
        {"org_id": org_id, "reviewer": current_user.id, "reason": data.reason.strip()},
    )

    await write_audit_log(
        db,
        actor_user_id=current_user.id,
        action="KYB_REJECTED",
        entity_type="ORGANIZATION",
        entity_id=org_id,
        details={"status": "REJECTED", "reason": data.reason.strip()},
    )

    # Notify Owner
    owner_res = await db.execute(
        text("SELECT id, email FROM users WHERE organization_id = :org_id AND sub_role = 'OWNER'"),
        {"org_id": org_id},
    )
    owner = owner_res.first()
    if owner:
        await notify(
            db,
            user_id=owner[0],
            notif_type="KYB_REJECTED",
            title="KYB Verification Needs Attention",
            body=f"Your submission requires changes: {data.reason.strip()}",
            link_path="/profile",
        )
        await send_email_async(
            to_email=owner[1],
            subject="ZaminFlow: Action Required on Your KYB Submission",
            body_text=f"Your organization profile was not approved for the following reason:\n\n{data.reason.strip()}\n\nPlease update your profile and resubmit.",
        )

    await db.commit()
    return {"status": "REJECTED"}


@router.post("/admin/kyb/{org_id}/suspend")
async def suspend_kyb(
    org_id: UUID,
    data: SuspendRequest,
    current_user: CurrentUser = Depends(require_role(["ADMIN"], ["SUPERADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    res = await db.execute(
        text("SELECT id, kyb_status FROM organizations WHERE id = :org_id FOR UPDATE NOWAIT"),
        {"org_id": org_id},
    )
    org_row = res.mappings().first()
    if not org_row or org_row["kyb_status"] != "VERIFIED":
        raise HTTPException(status_code=409, detail="Only VERIFIED organizations can be suspended")

    await db.execute(
        text(
            """
            UPDATE organizations
            SET kyb_status = 'SUSPENDED',
                kyb_review_note = :reason
            WHERE id = :org_id
            """
        ),
        {"org_id": org_id, "reason": data.reason.strip()},
    )

    await write_audit_log(
        db,
        actor_user_id=current_user.id,
        action="KYB_SUSPENDED",
        entity_type="ORGANIZATION",
        entity_id=org_id,
        details={"status": "SUSPENDED", "reason": data.reason.strip()},
    )
    await db.commit()
    return {"status": "SUSPENDED"}


@router.post("/admin/kyb/{org_id}/reinstate")
async def reinstate_kyb(
    org_id: UUID,
    current_user: CurrentUser = Depends(require_role(["ADMIN"], ["SUPERADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    res = await db.execute(
        text("SELECT id, kyb_status FROM organizations WHERE id = :org_id FOR UPDATE NOWAIT"),
        {"org_id": org_id},
    )
    org_row = res.mappings().first()
    if not org_row or org_row["kyb_status"] != "SUSPENDED":
        raise HTTPException(status_code=409, detail="Only SUSPENDED organizations can be reinstated")

    await db.execute(
        text(
            """
            UPDATE organizations
            SET kyb_status = 'VERIFIED',
                kyb_review_note = NULL
            WHERE id = :org_id
            """
        ),
        {"org_id": org_id},
    )

    await write_audit_log(
        db,
        actor_user_id=current_user.id,
        action="KYB_REINSTATED",
        entity_type="ORGANIZATION",
        entity_id=org_id,
        details={"status": "VERIFIED"},
    )
    await db.commit()
    return {"status": "VERIFIED"}


# -----------------------------------------------------------------------------
# Bank Invitation Endpoint (Section 4 Item 7 & Section 10)
# -----------------------------------------------------------------------------
@router.post("/admin/invitations")
async def invite_bank(
    data: BankInviteRequest,
    current_user: CurrentUser = Depends(require_role(["ADMIN"], ["SUPERADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    email_clean = data.officer_email.strip().lower()
    res = await db.execute(
        text("SELECT id FROM users WHERE lower(email) = :email"),
        {"email": email_clean},
    )
    if res.first():
        raise HTTPException(status_code=409, detail="User with this email already exists")

    org_id = uuid4()
    user_id = uuid4()

    # Create BANK organization (INCOMPLETE)
    await db.execute(
        text(
            """
            INSERT INTO organizations (id, role, legal_name, kyb_status, created_at)
            VALUES (:id, 'BANK', :legal_name, 'INCOMPLETE', NOW())
            """
        ),
        {"id": org_id, "legal_name": data.org_name.strip()},
    )
    await db.execute(
        text("INSERT INTO bank_profiles (organization_id, updated_at) VALUES (:org_id, NOW())"),
        {"org_id": org_id},
    )

    # Create inactive BANK_OFFICER user with NULL password
    await db.execute(
        text(
            """
            INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
            VALUES (:id, :org_id, 'BANK_OFFICER', :full_name, :email, FALSE, NOW())
            """
        ),
        {
            "id": user_id,
            "org_id": org_id,
            "full_name": data.officer_name.strip(),
            "email": email_clean,
        },
    )

    # Generate invitation token (72 hours)
    raw_token = generate_secure_token(32)
    token_hash = hash_token(raw_token)
    await db.execute(
        text(
            """
            INSERT INTO email_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
            VALUES (:id, :user_id, 'INVITE', :token_hash, NOW() + INTERVAL '72 hours', NOW())
            """
        ),
        {"id": uuid4(), "user_id": user_id, "token_hash": token_hash},
    )
    await db.commit()

    invite_url = f"{settings.APP_BASE_URL}/accept-invite?token={raw_token}"
    await send_email_async(
        to_email=email_clean,
        subject="Invitation to join ZaminFlow as Partner Bank",
        body_text=f"You have been invited as a Bank Officer on ZaminFlow.\nTo set your password and activate your account, click:\n{invite_url} (valid for 72 hours)",
    )

    return {
        "status": "invited",
        "organization_id": str(org_id),
        "user_id": str(user_id),
        "invite_url": invite_url,
    }


# =============================================================================
# 3. TEAM MANAGEMENT (/api/v1/team) (Section 5.6)
# =============================================================================
@router.get("/team")
async def list_team(
    current_user: CurrentUser = Depends(require_role(["INDUSTRY"], ["OWNER"])),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    stmt = text(
        """
        SELECT id, sub_role, full_name, email, phone_number, is_active, created_at
        FROM users
        WHERE organization_id = :org_id AND sub_role != 'OWNER'
        ORDER BY created_at DESC
        """
    )
    res = await db.execute(stmt, {"org_id": current_user.organization_id})
    return [dict(r) for r in res.mappings().all()]


@router.post("/team")
async def add_team_member(
    data: AddTeamMemberRequest,
    current_user: CurrentUser = Depends(require_role(["INDUSTRY"], ["OWNER"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Section 5.6: VERIFIED only
    if current_user.kyb_status != "VERIFIED":
        raise HTTPException(status_code=403, detail="Team management is locked until organization is VERIFIED")

    # Limit: maximum 50 staff in MVP
    cnt = await db.execute(
        text("SELECT COUNT(*) FROM users WHERE organization_id = :org_id"),
        {"org_id": current_user.organization_id},
    )
    if (cnt.scalar() or 0) >= 50:
        raise HTTPException(status_code=400, detail="Maximum 50 staff members reached")

    email_clean = data.email.strip().lower()
    dup = await db.execute(
        text("SELECT id FROM users WHERE lower(email) = :email"),
        {"email": email_clean},
    )
    if dup.first():
        raise HTTPException(status_code=409, detail="User with this email already exists")

    new_user_id = uuid4()
    await db.execute(
        text(
            """
            INSERT INTO users (id, organization_id, sub_role, full_name, email, phone_number, is_active, created_at)
            VALUES (:id, :org_id, :sub_role, :full_name, :email, :phone, FALSE, NOW())
            """
        ),
        {
            "id": new_user_id,
            "org_id": current_user.organization_id,
            "sub_role": data.sub_role,
            "full_name": data.full_name.strip(),
            "email": email_clean,
            "phone": data.phone.strip() if data.phone else None,
        },
    )

    # Issue invitation token (72 hours)
    raw_token = generate_secure_token(32)
    token_hash = hash_token(raw_token)
    await db.execute(
        text(
            """
            INSERT INTO email_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
            VALUES (:id, :user_id, 'INVITE', :token_hash, NOW() + INTERVAL '72 hours', NOW())
            """
        ),
        {"id": uuid4(), "user_id": new_user_id, "token_hash": token_hash},
    )
    await db.commit()

    invite_url = f"{settings.APP_BASE_URL}/accept-invite?token={raw_token}"
    await send_email_async(
        to_email=email_clean,
        subject=f"Invitation to join {current_user.legal_name} on ZaminFlow",
        body_text=f"You have been invited as {data.sub_role}.\nTo set your password and activate your account, click:\n{invite_url}",
    )

    return {"status": "invited", "user_id": str(new_user_id), "invite_url": invite_url}


@router.post("/team/{user_id}/resend-invite")
async def resend_team_invite(
    user_id: UUID,
    current_user: CurrentUser = Depends(require_role(["INDUSTRY"], ["OWNER"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    res = await db.execute(
        text("SELECT id, email, is_active FROM users WHERE id = :user_id AND organization_id = :org_id"),
        {"user_id": user_id, "org_id": current_user.organization_id},
    )
    user = res.mappings().first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff member not found")

    raw_token = generate_secure_token(32)
    token_hash = hash_token(raw_token)
    await db.execute(
        text(
            """
            INSERT INTO email_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
            VALUES (:id, :user_id, 'INVITE', :token_hash, NOW() + INTERVAL '72 hours', NOW())
            """
        ),
        {"id": uuid4(), "user_id": user_id, "token_hash": token_hash},
    )
    await db.commit()

    invite_url = f"{settings.APP_BASE_URL}/accept-invite?token={raw_token}"
    await send_email_async(
        to_email=user["email"],
        subject="ZaminFlow Invitation",
        body_text=f"Your invitation link: {invite_url}",
    )

    return {"status": "invite_resent"}


@router.post("/team/{user_id}/deactivate")
async def deactivate_team_member(
    user_id: UUID,
    current_user: CurrentUser = Depends(require_role(["INDUSTRY"], ["OWNER"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Owner cannot deactivate themselves")

    res = await db.execute(
        text("SELECT id FROM users WHERE id = :user_id AND organization_id = :org_id"),
        {"user_id": user_id, "org_id": current_user.organization_id},
    )
    if not res.first():
        raise HTTPException(status_code=404, detail="Staff member not found")

    await db.execute(
        text("UPDATE users SET is_active = FALSE WHERE id = :user_id"),
        {"user_id": user_id},
    )
    # Revoke all refresh tokens
    await db.execute(
        text("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = :user_id"),
        {"user_id": user_id},
    )
    await db.commit()

    return {"status": "deactivated"}


async def get_organization_by_id(db: AsyncSession, org_id: UUID) -> dict[str, Any]:
    stmt = text("SELECT * FROM organizations WHERE id = :org_id")
    res = await db.execute(stmt, {"org_id": org_id})
    row = res.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Organization not found")
    return dict(row)


async def update_organization_trust_score(
    db: AsyncSession, org_id: UUID, delta: Decimal
) -> Decimal:
    stmt = text(
        """
        UPDATE organizations
        SET trust_score = GREATEST(0.00, LEAST(100.00, trust_score + :delta))
        WHERE id = :org_id
        RETURNING trust_score
        """
    )
    res = await db.execute(stmt, {"org_id": org_id, "delta": delta})
    row = res.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Organization not found")
    await db.commit()
    return Decimal(str(row["trust_score"]))
