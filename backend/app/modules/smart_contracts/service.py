from decimal import Decimal, ROUND_HALF_EVEN
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.idempotency import (
    check_idempotency_replay,
    require_idempotency_key,
    save_idempotency_record,
)
from app.modules.auth_rbac.service import (
    CurrentUser,
    get_current_user,
    require_roles,
)
from app.modules.profiles_kyb.service import get_organization_by_id


def calculate_dynamic_payout(
    v_actual: Decimal,
    p_base: Decimal,
    f_actual: Decimal,
    s_actual: Decimal,
    t_actual: Decimal,
    f_std: Decimal = Decimal("3.60"),
    s_std: Decimal = Decimal("8.50"),
    alpha: Decimal = Decimal("0.1500"),
    beta: Decimal = Decimal("0.1000"),
    payment_mode: str = "ESCROW",
    factoring_fee_pct: Decimal = Decimal("0.0150"),
) -> dict[str, Decimal]:
    """
    Exact Decimal Settlement Payout Equation (Section 4.2 of SRS):
    P_final = V_actual * P_base * [ 1 + alpha * (F_actual - F_std) + beta * (S_actual - S_std) - gamma_temp ]
    """
    v_act = Decimal(str(v_actual))
    p_b = Decimal(str(p_base))
    f_act = Decimal(str(f_actual))
    s_act = Decimal(str(s_actual))
    t_act = Decimal(str(t_actual))
    f_s = Decimal(str(f_std))
    s_s = Decimal(str(s_std))
    a = Decimal(str(alpha))
    b = Decimal(str(beta))
    fee_pct = Decimal(str(factoring_fee_pct))

    if t_act <= Decimal("4.00"):
        gamma_temp = Decimal("0.0000")
    elif t_act <= Decimal("8.00"):
        gamma_temp = Decimal("0.005") * (t_act - Decimal("4.00"))
    else:
        raise ValueError(
            "Temperature exceeds 8.0°C cold-chain rejection threshold."
        )

    fat_adjustment = a * (f_act - f_s)
    snf_adjustment = b * (s_act - s_s)
    multiplier = (
        Decimal("1.0000") + fat_adjustment + snf_adjustment - gamma_temp
    )

    p_final = (v_act * p_b * multiplier).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_EVEN
    )

    if payment_mode == "FACTORING":
        factoring_fee_uzs = (p_final * fee_pct).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_EVEN
        )
    else:
        factoring_fee_uzs = Decimal("0.00")

    net_farmer_payout_uzs = (p_final - factoring_fee_uzs).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_EVEN
    )

    return {
        "multiplier": multiplier.quantize(
            Decimal("0.0001"), rounding=ROUND_HALF_EVEN
        ),
        "fat_adjustment_pct": (fat_adjustment * Decimal("100.0")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_EVEN
        ),
        "snf_adjustment_pct": (snf_adjustment * Decimal("100.0")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_EVEN
        ),
        "temp_penalty_pct": (gamma_temp * Decimal("100.0")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_EVEN
        ),
        "final_payout_uzs": p_final,
        "factoring_fee_uzs": factoring_fee_uzs,
        "net_farmer_payout_uzs": net_farmer_payout_uzs,
    }


ALLOWED_CONTRACT_TRANSITIONS: dict[str, set[str]] = {
    "DRAFT": {"AWAITING_BANK_LOCK"},
    "AWAITING_BANK_LOCK": {"ACTIVE_FUNDED"},
    "ACTIVE_FUNDED": {"COMPLETED"},
    "COMPLETED": set(),
}


def validate_contract_transition(current_status: str, next_status: str) -> None:
    if next_status not in ALLOWED_CONTRACT_TRANSITIONS.get(current_status, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Forbidden contract state transition from '{current_status}' to '{next_status}'.",
        )


class CreateSupplyContractRequest(BaseModel):
    farmer_id: UUID
    industry_id: UUID
    partner_bank_id: Optional[UUID] = None
    payment_mode: str = Field(default="ESCROW", pattern="^(ESCROW|FACTORING)$")
    factoring_fee_pct: Decimal = Field(default=Decimal("0.0150"))
    daily_volume_liters: Decimal = Field(gt=Decimal("0.00"))
    base_price_per_liter: Decimal = Field(gt=Decimal("0.0000"))
    std_fat_pct: Decimal = Field(default=Decimal("3.60"))
    std_snf_pct: Decimal = Field(default=Decimal("8.50"))
    alpha_fat_coeff: Decimal = Field(default=Decimal("0.1500"))
    beta_snf_coeff: Decimal = Field(default=Decimal("0.1000"))
    max_temp_c: Decimal = Field(default=Decimal("4.00"))


class SignContractRequest(BaseModel):
    payment_mode: Optional[str] = Field(
        default=None, pattern="^(ESCROW|FACTORING)$"
    )


async def get_contract_by_id(
    db: AsyncSession, contract_id: UUID, lock_row: bool = False
) -> dict[str, Any]:
    lock_clause = "FOR UPDATE NOWAIT" if lock_row else ""
    stmt = text(
        f"""
        SELECT c.*,
               f.legal_name AS farmer_name,
               f.bank_iban AS farmer_iban,
               i.legal_name AS industry_name,
               i.bank_iban AS industry_iban,
               b.legal_name AS bank_name
        FROM supply_contracts c
        JOIN organizations f ON f.id = c.farmer_id
        JOIN organizations i ON i.id = c.industry_id
        JOIN organizations b ON b.id = c.partner_bank_id
        WHERE c.id = :contract_id
        {lock_clause}
        """
    )
    res = await db.execute(stmt, {"contract_id": str(contract_id)})
    row = res.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Supply contract not found")
    return dict(row)


async def create_or_sign_contract(
    db: AsyncSession,
    current_user: CurrentUser,
    payload: CreateSupplyContractRequest,
    idempotency_key: str,
) -> dict[str, Any]:
    endpoint = "POST /api/v1/contracts"
    replay = await check_idempotency_replay(db, idempotency_key, endpoint)
    if replay is not None:
        return replay

    await get_organization_by_id(db, payload.farmer_id)
    await get_organization_by_id(db, payload.industry_id)

    bank_id = payload.partner_bank_id
    if bank_id is None:
        bank_res = await db.execute(
            text("SELECT id FROM organizations WHERE role = 'BANK' LIMIT 1")
        )
        bank_row = bank_res.mappings().first()
        if not bank_row:
            raise HTTPException(
                status_code=400,
                detail="No Partner Bank registered in the system.",
            )
        bank_id = bank_row["id"]

    farmer_signed = "NOW()" if current_user.role == "FARMER" else "NULL"
    industry_signed = "NOW()" if current_user.role == "INDUSTRY" else "NULL"

    stmt = text(
        f"""
        INSERT INTO supply_contracts (
            farmer_id, industry_id, partner_bank_id, payment_mode,
            factoring_fee_pct, daily_volume_liters, base_price_per_liter,
            std_fat_pct, std_snf_pct, alpha_fat_coeff, beta_snf_coeff,
            max_temp_c, status, farmer_signed_at, industry_signed_at
        )
        VALUES (
            :farmer_id, :industry_id, :partner_bank_id, :payment_mode,
            :factoring_fee_pct, :daily_volume_liters, :base_price_per_liter,
            :std_fat_pct, :std_snf_pct, :alpha_fat_coeff, :beta_snf_coeff,
            :max_temp_c, 'DRAFT', {farmer_signed}, {industry_signed}
        )
        RETURNING id
        """
    )
    res = await db.execute(
        stmt,
        {
            "farmer_id": str(payload.farmer_id),
            "industry_id": str(payload.industry_id),
            "partner_bank_id": str(bank_id),
            "payment_mode": payload.payment_mode,
            "factoring_fee_pct": payload.factoring_fee_pct,
            "daily_volume_liters": payload.daily_volume_liters,
            "base_price_per_liter": payload.base_price_per_liter,
            "std_fat_pct": payload.std_fat_pct,
            "std_snf_pct": payload.std_snf_pct,
            "alpha_fat_coeff": payload.alpha_fat_coeff,
            "beta_snf_coeff": payload.beta_snf_coeff,
            "max_temp_c": payload.max_temp_c,
        },
    )
    new_id = res.scalar_one()
    contract_data = await get_contract_by_id(db, new_id)

    await save_idempotency_record(
        db=db,
        idempotency_key=idempotency_key,
        endpoint=endpoint,
        user_id=current_user.id,
        response_status=201,
        response_body=contract_data,
    )
    await db.commit()
    return contract_data


async def countersign_contract(
    db: AsyncSession,
    contract_id: UUID,
    current_user: CurrentUser,
    payload: SignContractRequest,
    idempotency_key: str,
) -> dict[str, Any]:
    endpoint = f"POST /api/v1/contracts/{contract_id}/sign"
    replay = await check_idempotency_replay(db, idempotency_key, endpoint)
    if replay is not None:
        return replay

    contract = await get_contract_by_id(db, contract_id, lock_row=True)
    if contract["status"] != "DRAFT":
        raise HTTPException(
            status_code=400,
            detail=f"Contract is in '{contract['status']}' state and cannot be signed.",
        )

    payment_mode = payload.payment_mode or contract["payment_mode"]
    farmer_signed = contract["farmer_signed_at"] is not None
    industry_signed = contract["industry_signed_at"] is not None

    if current_user.role == "FARMER":
        farmer_signed = True
        sign_col = "farmer_signed_at = COALESCE(farmer_signed_at, NOW())"
    elif current_user.role == "INDUSTRY":
        industry_signed = True
        sign_col = "industry_signed_at = COALESCE(industry_signed_at, NOW())"
    else:
        raise HTTPException(
            status_code=403,
            detail="Only Farmer or Industry can sign supply contracts.",
        )

    next_status = (
        "AWAITING_BANK_LOCK"
        if (farmer_signed and industry_signed)
        else "DRAFT"
    )
    if next_status != contract["status"]:
        validate_contract_transition(contract["status"], next_status)

    stmt = text(
        f"""
        UPDATE supply_contracts
        SET {sign_col},
            payment_mode = :payment_mode,
            status = :next_status
        WHERE id = :contract_id
        """
    )
    await db.execute(
        stmt,
        {
            "payment_mode": payment_mode,
            "next_status": next_status,
            "contract_id": str(contract_id),
        },
    )
    updated = await get_contract_by_id(db, contract_id)
    await save_idempotency_record(
        db=db,
        idempotency_key=idempotency_key,
        endpoint=endpoint,
        user_id=current_user.id,
        response_status=200,
        response_body=updated,
    )
    await db.commit()

    if next_status == "AWAITING_BANK_LOCK":
        try:
            from app.modules.metrics.service import broadcast_contract_signed
            broadcast_contract_signed(
                title="Commercial Contract Signed",
                description=f"{updated['daily_volume_liters']} L/day contract signed between {updated['farmer_name']} & {updated['industry_name']}",
                region="Samarqand",
                volume=int(updated["daily_volume_liters"]),
                price=int(updated["base_price_per_liter"]),
            )
        except Exception:
            pass

    return updated


async def transition_contract_to_active_funded(
    db: AsyncSession, contract_id: UUID
) -> dict[str, Any]:
    contract = await get_contract_by_id(db, contract_id, lock_row=True)
    validate_contract_transition(contract["status"], "ACTIVE_FUNDED")
    await db.execute(
        text(
            "UPDATE supply_contracts SET status = 'ACTIVE_FUNDED' WHERE id = :id"
        ),
        {"id": str(contract_id)},
    )
    return await get_contract_by_id(db, contract_id)


async def list_contracts_for_user(
    db: AsyncSession, current_user: CurrentUser
) -> list[dict[str, Any]]:
    if current_user.role == "FARMER":
        where_clause = "WHERE c.farmer_id = :org_id"
    elif current_user.role == "INDUSTRY":
        where_clause = "WHERE c.industry_id = :org_id"
    elif current_user.role == "BANK":
        where_clause = "WHERE c.partner_bank_id = :org_id"
    else:
        where_clause = ""

    stmt = text(
        f"""
        SELECT c.*,
               f.legal_name AS farmer_name,
               i.legal_name AS industry_name,
               b.legal_name AS bank_name
        FROM supply_contracts c
        JOIN organizations f ON f.id = c.farmer_id
        JOIN organizations i ON i.id = c.industry_id
        JOIN organizations b ON b.id = c.partner_bank_id
        {where_clause}
        ORDER BY c.created_at DESC
        """
    )
    params = (
        {"org_id": str(current_user.organization_id)}
        if where_clause
        else {}
    )
    res = await db.execute(stmt, params)
    return [dict(r) for r in res.mappings().all()]


router = APIRouter(prefix="/contracts", tags=["Smart Supply Contracts"])


@router.get("")
async def list_contracts_endpoint(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    return await list_contracts_for_user(db, current_user)


@router.post("")
async def create_contract_endpoint(
    payload: CreateSupplyContractRequest,
    idempotency_key: str = Depends(require_idempotency_key),
    current_user: CurrentUser = Depends(require_roles(["FARMER", "INDUSTRY"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await create_or_sign_contract(
        db, current_user, payload, idempotency_key
    )


@router.post("/{contract_id}/sign")
async def sign_contract_endpoint(
    contract_id: UUID,
    payload: SignContractRequest,
    idempotency_key: str = Depends(require_idempotency_key),
    current_user: CurrentUser = Depends(require_roles(["FARMER", "INDUSTRY"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await countersign_contract(
        db, contract_id, current_user, payload, idempotency_key
    )
