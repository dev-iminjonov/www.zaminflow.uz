"""
Role-Specific Dashboards & Action Endpoints
References:
- Slice 1: DOC-REQ-FAR-001 (Farmer Dashboard & Supply/Dispute/Payouts)
"""

import json
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.policy import enforce_abac_tenancy, log_security_audit
from app.modules.auth_rbac.service import CurrentUser, require_roles

router = APIRouter(tags=["Role Dashboards"])


class FarmerSupplyListingRequest(BaseModel):
    volume_liters: Decimal = Field(..., gt=0, le=50000)
    cooling_temp_c: Decimal = Field(..., ge=0.0, le=8.0)
    milking_session: str = Field(default="MORNING", pattern="^(MORNING|EVENING|morning|evening)$")
    fat_pct: Optional[Decimal] = Field(default=Decimal("4.10"), ge=2.5, le=6.5)
    snf_pct: Optional[Decimal] = Field(default=Decimal("8.70"), ge=7.0, le=10.5)
    acidity_turner: Optional[Decimal] = Field(default=Decimal("16.5"), ge=12.0, le=25.0)


class FarmerBatchDisputeRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=1000)
    vial_code: Optional[str] = Field(default=None, max_length=64)


def _compute_grade(fat: float, snf: float, acidity: float) -> str:
    if fat >= 4.0 and snf >= 8.6 and acidity <= 17.5:
        return "A+"
    if fat >= 3.5 and snf >= 8.4 and acidity <= 19.0:
        return "A"
    return "B"


@router.get("/farmer/dashboard")
async def get_farmer_dashboard(
    current_user: CurrentUser = Depends(require_roles(["FARMER", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    FAR-01: Tenant-isolated Farmer Dashboard telemetry.
    Returns only contracts, batches, and payouts belonging to current_user.organization_id.
    """
    org_id = current_user.organization_id

    # 1. Average contract base price for this farmer
    price_res = await db.execute(
        text(
            """
            SELECT COALESCE(AVG(base_price_per_liter), 4850) AS avg_price
            FROM supply_contracts
            WHERE farmer_id = :org_id AND status IN ('ACTIVE_FUNDED', 'PENDING_FUNDING', 'DRAFT')
            """
        ),
        {"org_id": org_id},
    )
    avg_price = float(price_res.scalar() or 4850.0)

    # 2. Supplied volume & next payout & average quality
    stats_res = await db.execute(
        text(
            """
            SELECT
                COALESCE(SUM(COALESCE(b.actual_volume_liters, b.declared_volume_liters)), 0) AS supplied_liters,
                COALESCE(SUM(
                    CASE WHEN b.status IN ('IN_TRANSIT', 'AT_GATE', 'LAB_PASSED_PAID')
                    THEN COALESCE(b.net_farmer_payout_uzs, b.declared_volume_liters * c.base_price_per_liter)
                    ELSE 0 END
                ), 0) AS next_payout_uzs,
                COALESCE(AVG(b.actual_fat_pct), 4.05) AS avg_fat,
                COALESCE(AVG(b.actual_snf_pct), 8.70) AS avg_snf,
                COALESCE(AVG(b.acidity_turner), 16.5) AS avg_acidity
            FROM supply_contracts c
            LEFT JOIN delivery_batches b ON b.contract_id = c.id
            WHERE c.farmer_id = :org_id
            """
        ),
        {"org_id": org_id},
    )
    stats_row = stats_res.mappings().first() or {}
    supplied_liters = float(stats_row.get("supplied_liters") or 0.0)
    next_payout_uzs = float(stats_row.get("next_payout_uzs") or 0.0)
    avg_fat = float(stats_row.get("avg_fat") or 4.05)
    avg_snf = float(stats_row.get("avg_snf") or 8.70)
    avg_acidity = float(stats_row.get("avg_acidity") or 16.5)
    overall_grade = _compute_grade(avg_fat, avg_snf, avg_acidity)

    # 3. Recent deliveries strictly for this farmer
    batches_res = await db.execute(
        text(
            """
            SELECT
                b.id,
                b.status,
                COALESCE(b.actual_volume_liters, b.declared_volume_liters) AS volume_liters,
                COALESCE(b.actual_fat_pct, 4.0) AS fat_pct,
                COALESCE(b.actual_snf_pct, 8.7) AS snf_pct,
                COALESCE(b.acidity_turner, 16.5) AS acidity_t,
                COALESCE(b.net_farmer_payout_uzs, b.declared_volume_liters * c.base_price_per_liter) AS payout_uzs,
                ind.legal_name AS buyer_name
            FROM delivery_batches b
            JOIN supply_contracts c ON c.id = b.contract_id
            JOIN organizations ind ON ind.id = c.industry_id
            WHERE c.farmer_id = :org_id
            ORDER BY b.created_at DESC
            LIMIT 10
            """
        ),
        {"org_id": org_id},
    )
    batch_rows = batches_res.mappings().all()

    recent_deliveries = []
    payouts = []
    for row in batch_rows:
        bid_short = str(row["id"])[:8].upper()
        batch_label = f"Batch ZF-{bid_short}"
        st = row["status"]
        grade = _compute_grade(
            float(row["fat_pct"] or 4.0),
            float(row["snf_pct"] or 8.7),
            float(row["acidity_t"] or 16.5),
        )
        if st == "IN_TRANSIT":
            status_display = "● In transit"
            status_type = "success"
            cond = "Releases after titration"
        elif st == "AT_GATE":
            status_display = "● Titration pending"
            status_type = "warning"
            cond = "At plant lab gate"
        elif st == "LAB_PASSED_PAID":
            status_display = "✓ Escrow released"
            status_type = "neutral"
            cond = "Released to IBAN"
        else:
            status_display = f"⚠ {st.replace('_', ' ').title()}"
            status_type = "warning"
            cond = "Escrow frozen (Arbitration)"

        recent_deliveries.append(
            {
                "id": str(row["id"]),
                "destination": f"To {row['buyer_name']}",
                "batch": batch_label,
                "volume": f"{int(float(row['volume_liters'] or 0)):,} L",
                "grade": grade,
                "status": status_display,
                "statusType": status_type,
            }
        )
        payouts.append(
            {
                "id": f"pay-{bid_short}",
                "batch": f"ZF-{bid_short}",
                "condition": cond,
                "amount": f"{int(float(row['payout_uzs'] or 0)):,}",
            }
        )

    return {
        "todayPrice": {
            "value": f"{int(round(avg_price)):,}",
            "unit": "UZS / L",
            "delta": "+4.2%",
        },
        "suppliedThisMonth": {
            "value": f"{int(round(supplied_liters)):,}",
            "unit": "L",
        },
        "nextPayout": {
            "value": f"{int(round(next_payout_uzs)):,}",
            "unit": "UZS",
        },
        "qualityGrade": {
            "grade": overall_grade,
            "snf": f"SNF {avg_snf:.1f}%",
        },
        "recentDeliveries": recent_deliveries,
        "payouts": payouts,
    }


@router.post("/farmer/supply", status_code=status.HTTP_201_CREATED)
async def create_farmer_supply_listing(
    payload: FarmerSupplyListingRequest,
    current_user: CurrentUser = Depends(require_roles(["FARMER", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    FAR-02: Farmer lists daily raw milk supply volume and bulk cooling tank temperature.
    """
    org_id = current_user.organization_id

    await db.execute(
        text(
            """
            UPDATE organizations
            SET daily_capacity_liters = :vol
            WHERE id = :org_id
            """
        ),
        {"vol": int(payload.volume_liters), "org_id": org_id},
    )

    price_res = await db.execute(
        text(
            """
            SELECT COALESCE(AVG(base_price_per_liter), 4850)
            FROM supply_contracts
            WHERE farmer_id = :org_id AND status = 'ACTIVE_FUNDED'
            """
        ),
        {"org_id": org_id},
    )
    base_price = Decimal(str(price_res.scalar() or "4850.00"))
    estimated_escrow = (payload.volume_liters * base_price).quantize(Decimal("0.01"))

    await db.commit()
    await log_security_audit(
        db=db,
        actor_user_id=current_user.id,
        action="FARMER_SUPPLY_LISTED",
        entity_type="organizations",
        entity_id=org_id,
        details={
            "volume_liters": str(payload.volume_liters),
            "cooling_temp_c": str(payload.cooling_temp_c),
            "milking_session": payload.milking_session.upper(),
            "estimated_escrow_uzs": str(estimated_escrow),
        },
    )

    return {
        "organization_id": str(org_id),
        "volume_liters": str(payload.volume_liters),
        "cooling_temp_c": str(payload.cooling_temp_c),
        "milking_session": payload.milking_session.upper(),
        "status": "STORED",
        "estimated_escrow_uzs": str(estimated_escrow),
    }


@router.get("/farmer/payouts")
async def list_farmer_payouts(
    current_user: CurrentUser = Depends(require_roles(["FARMER", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """
    FAR-04: Tenant-isolated payout breakdown for the authenticated farmer.
    """
    res = await db.execute(
        text(
            """
            SELECT
                b.id AS batch_id,
                COALESCE(b.actual_volume_liters, b.declared_volume_liters) AS volume_liters,
                c.base_price_per_liter,
                COALESCE(b.actual_fat_pct, 4.0) AS fat_pct,
                COALESCE(b.actual_snf_pct, 8.7) AS snf_pct,
                COALESCE(b.net_farmer_payout_uzs, b.declared_volume_liters * c.base_price_per_liter) AS net_payout_uzs,
                b.status,
                ind.legal_name AS destination_plant,
                b.created_at
            FROM delivery_batches b
            JOIN supply_contracts c ON c.id = b.contract_id
            JOIN organizations ind ON ind.id = c.industry_id
            WHERE c.farmer_id = :org_id
            ORDER BY b.created_at DESC
            """
        ),
        {"org_id": current_user.organization_id},
    )
    return [dict(r) for r in res.mappings().all()]


@router.post("/farmer/batches/{batch_id}/dispute")
async def raise_farmer_batch_dispute(
    batch_id: UUID,
    payload: FarmerBatchDisputeRequest,
    current_user: CurrentUser = Depends(require_roles(["FARMER", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    FAR-05: Farmer contests lab titration reading and freezes batch escrow.
    Enforces strict ABAC ownership so Farmer B cannot freeze Farmer A's batch.
    """
    res = await db.execute(
        text(
            """
            SELECT b.id, b.status, b.reference_vial_code, c.farmer_id
            FROM delivery_batches b
            JOIN supply_contracts c ON c.id = b.contract_id
            WHERE b.id = :bid
            """
        ),
        {"bid": batch_id},
    )
    row = res.mappings().first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery batch not found.")

    await enforce_abac_tenancy(
        db=db,
        actor_user_id=current_user.id,
        actor_org_id=current_user.organization_id,
        actor_role=current_user.role,
        expected_org_id=row["farmer_id"],
        resource_type="delivery_batches",
        resource_id=batch_id,
    )

    await db.execute(
        text(
            """
            UPDATE delivery_batches
            SET status = 'DISPUTE_FROZEN',
                dispute_reason = :reason
            WHERE id = :bid
            """
        ),
        {"bid": batch_id, "reason": payload.reason},
    )
    await db.commit()

    await log_security_audit(
        db=db,
        actor_user_id=current_user.id,
        action="FARMER_DISPUTE_OPENED",
        entity_type="delivery_batches",
        entity_id=batch_id,
        details={
            "reason": payload.reason,
            "vial_code": payload.vial_code or row["reference_vial_code"],
            "previous_status": row["status"],
        },
    )

    return {
        "batch_id": str(batch_id),
        "status": "DISPUTE_FROZEN",
        "reason": payload.reason,
        "vial_code": payload.vial_code or row["reference_vial_code"],
    }
