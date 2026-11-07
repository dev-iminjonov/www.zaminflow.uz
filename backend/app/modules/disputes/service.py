from decimal import Decimal, ROUND_HALF_EVEN
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.idempotency import (
    check_idempotency_replay,
    require_idempotency_key,
    save_idempotency_record,
)
from app.modules.auth_rbac.service import CurrentUser, require_roles
from app.modules.escrow_ledger.service import post_dispute_arbitration_split
from app.modules.qr_logistics.service import (
    get_batch_by_id,
    validate_batch_transition,
)
from app.modules.smart_contracts.service import (
    calculate_dynamic_payout,
    get_contract_by_id,
)
from app.modules.trust_rating.service import background_recalculate_trust_scores


class ResolveDisputeRequest(BaseModel):
    verdict: str = Field(pattern="^(RESOLVED_SPLIT|REJECTED)$")
    arbitration_cert_url: str = Field(
        default="https://zaminflow.uz/certs/ref-vial-report.pdf"
    )
    binding_fat_pct: Decimal = Field(ge=Decimal("0.00"), le=Decimal("15.00"))
    binding_snf_pct: Decimal = Field(ge=Decimal("0.00"), le=Decimal("20.00"))
    binding_temp_c: Decimal = Field(ge=Decimal("0.00"), le=Decimal("8.00"))
    dishonest_party: str = Field(
        default="INDUSTRY", pattern="^(FARMER|INDUSTRY|NONE)$"
    )


async def resolve_disputed_batch(
    db: AsyncSession,
    batch_id: UUID,
    current_user: CurrentUser,
    payload: ResolveDisputeRequest,
    idempotency_key: str,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    endpoint = f"POST /api/v1/disputes/{batch_id}/resolve"
    replay = await check_idempotency_replay(db, idempotency_key, endpoint)
    if replay is not None:
        return replay

    batch = await get_batch_by_id(db, batch_id, lock_row=True)
    validate_batch_transition(batch["status"], payload.verdict)
    contract = await get_contract_by_id(
        db, batch["contract_id"], lock_row=True
    )

    v_actual = Decimal(
        str(batch["actual_volume_liters"] or batch["declared_volume_liters"])
    )
    baseline_locked = (
        v_actual * Decimal(str(contract["base_price_per_liter"]))
    ).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)

    if payload.verdict == "REJECTED":
        farmer_payout = Decimal("0.00")
        industry_refund = baseline_locked
    else:
        pricing = calculate_dynamic_payout(
            v_actual=v_actual,
            p_base=Decimal(str(contract["base_price_per_liter"])),
            f_actual=payload.binding_fat_pct,
            s_actual=payload.binding_snf_pct,
            t_actual=payload.binding_temp_c,
            f_std=Decimal(str(contract["std_fat_pct"])),
            s_std=Decimal(str(contract["std_snf_pct"])),
            alpha=Decimal(str(contract["alpha_fat_coeff"])),
            beta=Decimal(str(contract["beta_snf_coeff"])),
            payment_mode="ESCROW",
        )
        farmer_payout = pricing["final_payout_uzs"]
        industry_refund = max(
            Decimal("0.00"), baseline_locked - farmer_payout
        )

    await db.execute(
        text(
            """
            UPDATE delivery_batches
            SET status = :verdict,
                arbitration_cert_url = :cert_url,
                arbitration_fat_pct = :fat,
                arbitration_snf_pct = :snf,
                arbitration_temp_c = :temp,
                arbitration_dishonest_role = :dishonest,
                arbitration_resolved_at = NOW(),
                final_payout_uzs = :farmer_payout,
                net_farmer_payout_uzs = :farmer_payout
            WHERE id = :batch_id
            """
        ),
        {
            "verdict": payload.verdict,
            "cert_url": payload.arbitration_cert_url,
            "fat": payload.binding_fat_pct,
            "snf": payload.binding_snf_pct,
            "temp": payload.binding_temp_c,
            "dishonest": payload.dishonest_party,
            "farmer_payout": farmer_payout,
            "batch_id": str(batch_id),
        },
    )

    ledger_entries = await post_dispute_arbitration_split(
        db=db,
        contract=contract,
        batch_id=batch_id,
        farmer_payout_uzs=farmer_payout,
        industry_refund_uzs=industry_refund,
    )

    updated_batch = await get_batch_by_id(db, batch_id)
    response_data = {
        "batch": updated_batch,
        "farmer_payout_uzs": farmer_payout,
        "industry_refund_uzs": industry_refund,
        "ledger_entries": ledger_entries,
    }

    await save_idempotency_record(
        db=db,
        idempotency_key=idempotency_key,
        endpoint=endpoint,
        user_id=current_user.id,
        response_status=200,
        response_body=response_data,
    )
    await db.commit()

    background_tasks.add_task(
        background_recalculate_trust_scores,
        contract["farmer_id"],
        contract["industry_id"],
    )
    return response_data


async def get_admin_global_metrics(db: AsyncSession) -> dict[str, Any]:
    stmt = text(
        """
        SELECT
            COALESCE((SELECT SUM(final_payout_uzs) FROM delivery_batches WHERE status IN ('SETTLED', 'RESOLVED_SPLIT')), 0.0000) AS total_gmv_uzs,
            COALESCE((SELECT COUNT(*) FROM supply_contracts WHERE status = 'ACTIVE_FUNDED'), 0) AS active_contracts_count,
            COALESCE((SELECT SUM(daily_capacity_liters) FROM organizations WHERE role = 'FARMER'), 0.00) AS total_farmer_supply_liters,
            COALESCE((SELECT SUM(daily_capacity_liters) FROM organizations WHERE role = 'INDUSTRY'), 0.00) AS total_industry_demand_liters,
            COALESCE((SELECT SUM(amount_uzs) FROM financial_ledger WHERE entry_type = 'FACTORING_FEE'), 0.0000) AS platform_fee_revenue_uzs,
            COALESCE((SELECT COUNT(*) FROM delivery_batches WHERE status = 'DISPUTE_FROZEN'), 0) AS frozen_disputes_count
        """
    )
    res = await db.execute(stmt)
    row = dict(res.mappings().one())
    supply = Decimal(str(row["total_farmer_supply_liters"]))
    demand = Decimal(str(row["total_industry_demand_liters"]))
    row["regional_deficit_liters"] = max(Decimal("0.00"), demand - supply)
    return row


router = APIRouter(prefix="/disputes", tags=["Split-Sample Dispute Arbitration"])


@router.get("/admin-metrics")
async def get_admin_metrics_endpoint(
    current_user: CurrentUser = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await get_admin_global_metrics(db)


@router.post("/{batch_id}/resolve")
async def resolve_dispute_endpoint(
    batch_id: UUID,
    payload: ResolveDisputeRequest,
    background_tasks: BackgroundTasks,
    idempotency_key: str = Depends(require_idempotency_key),
    current_user: CurrentUser = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await resolve_disputed_batch(
        db, batch_id, current_user, payload, idempotency_key, background_tasks
    )
