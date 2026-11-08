from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.idempotency import (
    check_idempotency_replay,
    require_idempotency_key,
    save_idempotency_record,
)
from app.core.policy import enforce_abac_tenancy
from app.core.security import sign_qr_payload, verify_qr_payload
from app.modules.auth_rbac.service import (
    CurrentUser,
    get_current_user,
    require_roles,
)
from app.modules.escrow_ledger.service import settle_batch_payout_in_ledger
from app.modules.smart_contracts.service import (
    calculate_dynamic_payout,
    get_contract_by_id,
)
from app.modules.notifications.service import notify
from app.modules.trust_rating.service import background_recalculate_trust_scores

ALLOWED_BATCH_TRANSITIONS: dict[str, set[str]] = {
    "IN_TRANSIT": {"AT_GATE"},
    "AT_GATE": {"SETTLED", "DISPUTE_FROZEN"},
    "DISPUTE_FROZEN": {"RESOLVED_SPLIT", "REJECTED"},
    "SETTLED": set(),
    "RESOLVED_SPLIT": set(),
    "REJECTED": set(),
}


def validate_batch_transition(current_status: str, next_status: str) -> None:
    if next_status not in ALLOWED_BATCH_TRANSITIONS.get(current_status, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Forbidden batch state transition from '{current_status}' to '{next_status}'.",
        )


class GeneratePickupQrRequest(BaseModel):
    contract_id: UUID
    declared_volume_liters: Decimal = Field(gt=Decimal("0.00"))
    pickup_temp_c: Decimal = Field(le=Decimal("8.00"))


class PickupHandshakeRequest(BaseModel):
    contract_id: UUID
    qr_token: str
    vial_code: str = Field(min_length=3)
    declared_liters: Decimal = Field(gt=Decimal("0.00"))
    temp_c: Decimal = Field(le=Decimal("8.00"))
    lat: Decimal
    lng: Decimal


class GateArrivalRequest(BaseModel):
    qr_token: Optional[str] = None


class LabVerificationRequest(BaseModel):
    actual_volume_liters: Decimal = Field(gt=Decimal("0.00"))
    actual_fat_pct: Decimal = Field(ge=Decimal("0.00"), le=Decimal("15.00"))
    actual_snf_pct: Decimal = Field(ge=Decimal("0.00"), le=Decimal("20.00"))
    actual_temp_c: Decimal = Field(ge=Decimal("-2.00"), le=Decimal("35.00"))
    acidity_turner: Decimal = Field(ge=Decimal("0.00"), le=Decimal("40.00"))
    antibiotics_negative: bool = True
    contested_downgrade: bool = False


async def get_batch_by_id(
    db: AsyncSession, batch_id: UUID, lock_row: bool = False
) -> dict[str, Any]:
    lock_clause = "FOR UPDATE NOWAIT" if lock_row else ""
    stmt = text(
        f"""
        SELECT b.*,
               c.farmer_id, c.industry_id, c.partner_bank_id,
               c.payment_mode, c.factoring_fee_pct, c.base_price_per_liter,
               c.std_fat_pct, c.std_snf_pct, c.alpha_fat_coeff, c.beta_snf_coeff,
               f.legal_name AS farmer_name,
               i.legal_name AS industry_name
        FROM delivery_batches b
        JOIN supply_contracts c ON c.id = b.contract_id
        JOIN organizations f ON f.id = c.farmer_id
        JOIN organizations i ON i.id = c.industry_id
        WHERE b.id = :batch_id
        {lock_clause}
        """
    )
    res = await db.execute(stmt, {"batch_id": str(batch_id)})
    row = res.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Delivery batch not found")
    return dict(row)


async def generate_farmer_pickup_qr(
    db: AsyncSession,
    current_user: CurrentUser,
    payload: GeneratePickupQrRequest,
) -> dict[str, Any]:
    if payload.pickup_temp_c > Decimal("8.00"):
        raise HTTPException(
            status_code=400,
            detail="Pickup temperature must be <= 8.0°C (Cold-Chain Rule).",
        )
    contract = await get_contract_by_id(db, payload.contract_id)
    if current_user.role == "FARMER":
        await enforce_abac_tenancy(
            db=db,
            actor_user_id=current_user.id,
            actor_org_id=current_user.organization_id,
            actor_role=current_user.role,
            expected_org_id=contract["farmer_id"],
            resource_type="SUPPLY_CONTRACT",
            resource_id=payload.contract_id,
        )
    if contract["status"] != "ACTIVE_FUNDED":
        raise HTTPException(
            status_code=400,
            detail="Contract must be in ACTIVE_FUNDED state to generate a Pickup QR.",
        )

    qr_data = {
        "contract_id": str(payload.contract_id),
        "farmer_id": str(contract["farmer_id"]),
        "declared_liters": str(payload.declared_volume_liters),
        "temp_c": str(payload.pickup_temp_c),
        "ts": int(datetime.now(timezone.utc).timestamp()),
    }
    signed_token = sign_qr_payload(qr_data)
    return {
        "qr_token": signed_token,
        "payload": qr_data,
    }


async def execute_pickup_handshake(
    db: AsyncSession,
    current_user: CurrentUser,
    payload: PickupHandshakeRequest,
    idempotency_key: str,
) -> dict[str, Any]:
    endpoint = "POST /api/v1/batches/pickup-handshake"
    replay = await check_idempotency_replay(db, idempotency_key, endpoint)
    if replay is not None:
        return replay

    verified_qr = verify_qr_payload(payload.qr_token)
    if verified_qr.get("contract_id") != str(payload.contract_id):
        raise HTTPException(
            status_code=400,
            detail="QR token contract_id does not match request contract_id.",
        )

    contract = await get_contract_by_id(db, payload.contract_id, lock_row=True)
    if contract["status"] != "ACTIVE_FUNDED":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot create batch for contract in '{contract['status']}' state. Must be ACTIVE_FUNDED.",
        )

    geo_stmt = text(
        """
        SELECT ST_DistanceSphere(
            o.location::geometry,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
        ) AS distance_meters
        FROM organizations o
        WHERE o.id = :farmer_id
        """
    )
    geo_res = await db.execute(
        geo_stmt,
        {
            "lng": float(payload.lng),
            "lat": float(payload.lat),
            "farmer_id": str(contract["farmer_id"]),
        },
    )
    distance_m = Decimal(str(geo_res.scalar_one()))
    if distance_m > Decimal("500.0"):
        raise HTTPException(
            status_code=400,
            detail=f"Geofence check failed: Driver GPS is {distance_m:.1f}m from farm (must be within 500m).",
        )

    ins_stmt = text(
        """
        INSERT INTO delivery_batches (
            contract_id, driver_user_id, qr_token, reference_vial_code,
            declared_volume_liters, pickup_temp_c, pickup_lat, pickup_lng,
            status
        )
        VALUES (
            :contract_id, :driver_user_id, :qr_token, :vial_code,
            :declared_liters, :temp_c, :lat, :lng,
            'IN_TRANSIT'
        )
        RETURNING id
        """
    )
    res = await db.execute(
        ins_stmt,
        {
            "contract_id": str(payload.contract_id),
            "driver_user_id": str(current_user.id),
            "qr_token": payload.qr_token,
            "vial_code": payload.vial_code,
            "declared_liters": payload.declared_liters,
            "temp_c": payload.temp_c,
            "lat": payload.lat,
            "lng": payload.lng,
        },
    )
    batch_id = res.scalar_one()
    batch_data = await get_batch_by_id(db, batch_id)

    await save_idempotency_record(
        db=db,
        idempotency_key=idempotency_key,
        endpoint=endpoint,
        user_id=current_user.id,
        response_status=201,
        response_body=batch_data,
    )
    await db.commit()
    return batch_data


async def record_gate_arrival(
    db: AsyncSession,
    batch_id: UUID,
    current_user: CurrentUser,
    idempotency_key: str,
) -> dict[str, Any]:
    endpoint = f"POST /api/v1/batches/{batch_id}/gate-arrival"
    replay = await check_idempotency_replay(db, idempotency_key, endpoint)
    if replay is not None:
        return replay

    batch = await get_batch_by_id(db, batch_id, lock_row=True)
    if current_user.role == "INDUSTRY" and current_user.sub_role != "DRIVER":
        await enforce_abac_tenancy(
            db=db,
            actor_user_id=current_user.id,
            actor_org_id=current_user.organization_id,
            actor_role=current_user.role,
            expected_org_id=batch["industry_id"],
            resource_type="DELIVERY_BATCH",
            resource_id=batch_id,
        )
    validate_batch_transition(batch["status"], "AT_GATE")

    await db.execute(
        text(
            """
            UPDATE delivery_batches
            SET status = 'AT_GATE',
                gate_arrived_at = NOW()
            WHERE id = :batch_id
            """
        ),
        {"batch_id": str(batch_id)},
    )
    updated = await get_batch_by_id(db, batch_id)
    await save_idempotency_record(
        db=db,
        idempotency_key=idempotency_key,
        endpoint=endpoint,
        user_id=current_user.id,
        response_status=200,
        response_body=updated,
    )
    await db.commit()
    return updated


async def verify_lab_and_settle_or_freeze(
    db: AsyncSession,
    batch_id: UUID,
    current_user: CurrentUser,
    payload: LabVerificationRequest,
    idempotency_key: str,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    endpoint = f"POST /api/v1/batches/{batch_id}/lab-verify"
    replay = await check_idempotency_replay(db, idempotency_key, endpoint)
    if replay is not None:
        return replay

    batch = await get_batch_by_id(db, batch_id, lock_row=True)
    if current_user.role == "INDUSTRY":
        await enforce_abac_tenancy(
            db=db,
            actor_user_id=current_user.id,
            actor_org_id=current_user.organization_id,
            actor_role=current_user.role,
            expected_org_id=batch["industry_id"],
            resource_type="DELIVERY_BATCH",
            resource_id=batch_id,
        )
    contract = await get_contract_by_id(
        db, batch["contract_id"], lock_row=True
    )

    is_disputed = (
        not payload.antibiotics_negative
        or payload.acidity_turner > Decimal("18.00")
        or payload.actual_temp_c > Decimal("8.00")
        or payload.contested_downgrade
    )

    if is_disputed:
        validate_batch_transition(batch["status"], "DISPUTE_FROZEN")
        reasons = []
        if not payload.antibiotics_negative:
            reasons.append("Antibiotics test FAILED (Positive)")
        if payload.acidity_turner > Decimal("18.00"):
            reasons.append(f"Acidity {payload.acidity_turner}°T > 18.0°T")
        if payload.actual_temp_c > Decimal("8.00"):
            reasons.append(f"Temperature {payload.actual_temp_c}°C > 8.0°C")
        if payload.contested_downgrade:
            reasons.append("Contested quality downgrade")
        dispute_reason = "; ".join(reasons)

        await db.execute(
            text(
                """
                UPDATE delivery_batches
                SET lab_verified_at = NOW(),
                    actual_volume_liters = :actual_volume_liters,
                    actual_fat_pct = :actual_fat_pct,
                    actual_snf_pct = :actual_snf_pct,
                    actual_temp_c = :actual_temp_c,
                    acidity_turner = :acidity_turner,
                    antibiotics_negative = :antibiotics_negative,
                    status = 'DISPUTE_FROZEN',
                    dispute_reason = :dispute_reason
                WHERE id = :batch_id
                """
            ),
            {
                "actual_volume_liters": payload.actual_volume_liters,
                "actual_fat_pct": payload.actual_fat_pct,
                "actual_snf_pct": payload.actual_snf_pct,
                "actual_temp_c": payload.actual_temp_c,
                "acidity_turner": payload.acidity_turner,
                "antibiotics_negative": payload.antibiotics_negative,
                "dispute_reason": dispute_reason,
                "batch_id": str(batch_id),
            },
        )
        updated_batch = await get_batch_by_id(db, batch_id)
        response_data = {
            "batch": updated_batch,
            "pricing_breakdown": None,
            "ledger_entries": [],
        }
    else:
        validate_batch_transition(batch["status"], "SETTLED")
        pricing = calculate_dynamic_payout(
            v_actual=payload.actual_volume_liters,
            p_base=Decimal(str(contract["base_price_per_liter"])),
            f_actual=payload.actual_fat_pct,
            s_actual=payload.actual_snf_pct,
            t_actual=payload.actual_temp_c,
            f_std=Decimal(str(contract["std_fat_pct"])),
            s_std=Decimal(str(contract["std_snf_pct"])),
            alpha=Decimal(str(contract["alpha_fat_coeff"])),
            beta=Decimal(str(contract["beta_snf_coeff"])),
            payment_mode=contract["payment_mode"],
            factoring_fee_pct=Decimal(str(contract["factoring_fee_pct"])),
        )

        await db.execute(
            text(
                """
                UPDATE delivery_batches
                SET lab_verified_at = NOW(),
                    actual_volume_liters = :actual_volume_liters,
                    actual_fat_pct = :actual_fat_pct,
                    actual_snf_pct = :actual_snf_pct,
                    actual_temp_c = :actual_temp_c,
                    acidity_turner = :acidity_turner,
                    antibiotics_negative = :antibiotics_negative,
                    final_payout_uzs = :final_payout_uzs,
                    factoring_fee_uzs = :factoring_fee_uzs,
                    net_farmer_payout_uzs = :net_farmer_payout_uzs,
                    status = 'SETTLED'
                WHERE id = :batch_id
                """
            ),
            {
                "actual_volume_liters": payload.actual_volume_liters,
                "actual_fat_pct": payload.actual_fat_pct,
                "actual_snf_pct": payload.actual_snf_pct,
                "actual_temp_c": payload.actual_temp_c,
                "acidity_turner": payload.acidity_turner,
                "antibiotics_negative": payload.antibiotics_negative,
                "final_payout_uzs": pricing["final_payout_uzs"],
                "factoring_fee_uzs": pricing["factoring_fee_uzs"],
                "net_farmer_payout_uzs": pricing["net_farmer_payout_uzs"],
                "batch_id": str(batch_id),
            },
        )

        ledger_entries = await settle_batch_payout_in_ledger(
            db=db,
            contract=contract,
            batch_id=batch_id,
            final_payout_uzs=pricing["final_payout_uzs"],
            factoring_fee_uzs=pricing["factoring_fee_uzs"],
            net_farmer_payout_uzs=pricing["net_farmer_payout_uzs"],
        )
        updated_batch = await get_batch_by_id(db, batch_id)
        response_data = {
            "batch": updated_batch,
            "pricing_breakdown": pricing,
            "ledger_entries": ledger_entries,
        }

        background_tasks.add_task(
            background_recalculate_trust_scores,
            contract["farmer_id"],
            contract["industry_id"],
        )

    await save_idempotency_record(
        db=db,
        idempotency_key=idempotency_key,
        endpoint=endpoint,
        user_id=current_user.id,
        response_status=200,
        response_body=response_data,
    )
    await db.commit()

    return response_data


async def list_batches_for_user(
    db: AsyncSession, current_user: CurrentUser, status_filter: Optional[str] = None
) -> list[dict[str, Any]]:
    conditions = []
    params: dict[str, Any] = {}
    if current_user.role == "FARMER":
        conditions.append("c.farmer_id = :org_id")
        params["org_id"] = str(current_user.organization_id)
    elif current_user.sub_role == "DRIVER":
        conditions.append("(b.driver_user_id = :user_id OR c.industry_id = :org_id)")
        params["user_id"] = str(current_user.id)
        params["org_id"] = str(current_user.organization_id)
    elif current_user.role == "INDUSTRY":
        conditions.append("c.industry_id = :org_id")
        params["org_id"] = str(current_user.organization_id)
    elif current_user.role == "BANK":
        conditions.append("c.partner_bank_id = :org_id")
        params["org_id"] = str(current_user.organization_id)

    if status_filter:
        conditions.append("b.status = :status")
        params["status"] = status_filter

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    stmt = text(
        f"""
        SELECT b.*,
               f.legal_name AS farmer_name,
               ST_Y(f.location::geometry) AS farmer_lat,
               ST_X(f.location::geometry) AS farmer_lng,
               i.legal_name AS industry_name,
               ST_Y(i.location::geometry) AS industry_lat,
               ST_X(i.location::geometry) AS industry_lng,
               c.base_price_per_liter, c.payment_mode, c.factoring_fee_pct,
               c.std_fat_pct, c.std_snf_pct, c.alpha_fat_coeff, c.beta_snf_coeff
        FROM delivery_batches b
        JOIN supply_contracts c ON c.id = b.contract_id
        JOIN organizations f ON f.id = c.farmer_id
        JOIN organizations i ON i.id = c.industry_id
        {where_clause}
        ORDER BY b.created_at DESC
        """
    )
    res = await db.execute(stmt, params)
    return [dict(r) for r in res.mappings().all()]


router = APIRouter(prefix="/batches", tags=["Two-Way QR Handshake & Gate Lab"])


@router.get("")
async def list_batches_endpoint(
    status: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    return await list_batches_for_user(db, current_user, status)


@router.post("/generate-pickup-qr")
async def generate_pickup_qr_endpoint(
    payload: GeneratePickupQrRequest,
    current_user: CurrentUser = Depends(require_roles(["FARMER", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await generate_farmer_pickup_qr(db, current_user, payload)


@router.post("/pickup-handshake")
async def pickup_handshake_endpoint(
    payload: PickupHandshakeRequest,
    idempotency_key: str = Depends(require_idempotency_key),
    current_user: CurrentUser = Depends(
        require_roles(["DRIVER", "FARMER", "INDUSTRY", "ADMIN"])
    ),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await execute_pickup_handshake(
        db, current_user, payload, idempotency_key
    )


@router.post("/{id}/gate-arrival")
async def gate_arrival_endpoint(
    id: UUID,
    payload: Optional[GateArrivalRequest] = None,
    idempotency_key: str = Depends(require_idempotency_key),
    current_user: CurrentUser = Depends(require_roles(["DRIVER", "INDUSTRY", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await record_gate_arrival(db, id, current_user, idempotency_key)


@router.post("/{id}/lab-verify")
async def lab_verify_endpoint(
    id: UUID,
    payload: LabVerificationRequest,
    background_tasks: BackgroundTasks,
    idempotency_key: str = Depends(require_idempotency_key),
    current_user: CurrentUser = Depends(require_roles(["INDUSTRY", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await verify_lab_and_settle_or_freeze(
        db, id, current_user, payload, idempotency_key, background_tasks
    )
