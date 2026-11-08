import csv
from decimal import Decimal, ROUND_HALF_EVEN
import io
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.idempotency import (
    check_idempotency_replay,
    require_idempotency_key,
    save_idempotency_record,
)
from app.core.security import verify_bank_webhook_hmac
from app.modules.auth_rbac.service import (
    CurrentUser,
    get_current_user,
    require_roles,
)
from app.modules.smart_contracts.service import (
    get_contract_by_id,
    transition_contract_to_active_funded,
)


class ConfirmLockWebhookPayload(BaseModel):
    contract_id: UUID
    lock_amount_uzs: Decimal = Field(gt=Decimal("0.0000"))
    bank_reference_id: str = Field(default="BNK-LOCK-001")


async def post_ledger_entry(
    db: AsyncSession,
    contract_id: UUID,
    batch_id: Optional[UUID],
    entry_type: str,
    debit_account: str,
    credit_account: str,
    amount_uzs: Decimal,
    bank_reference_id: Optional[str] = None,
) -> dict[str, Any]:
    stmt = text(
        """
        INSERT INTO financial_ledger (
            contract_id, batch_id, entry_type, debit_account,
            credit_account, amount_uzs, bank_reference_id, webhook_status
        )
        VALUES (
            :contract_id, :batch_id, :entry_type, :debit_account,
            :credit_account, :amount_uzs, :bank_reference_id, 'DELIVERED'
        )
        RETURNING id, contract_id, batch_id, entry_type, debit_account,
                  credit_account, amount_uzs, bank_reference_id,
                  webhook_status, created_at
        """
    )
    res = await db.execute(
        stmt,
        {
            "contract_id": str(contract_id),
            "batch_id": str(batch_id) if batch_id else None,
            "entry_type": entry_type,
            "debit_account": debit_account,
            "credit_account": credit_account,
            "amount_uzs": amount_uzs.quantize(
                Decimal("0.0001"), rounding=ROUND_HALF_EVEN
            ),
            "bank_reference_id": bank_reference_id,
        },
    )
    return dict(res.mappings().one())


async def record_escrow_lock_and_activate(
    db: AsyncSession,
    payload: ConfirmLockWebhookPayload,
    idempotency_key: str,
    user_id: Optional[UUID] = None,
) -> dict[str, Any]:
    endpoint = "POST /api/v1/bank/webhooks/confirm-lock"
    replay = await check_idempotency_replay(db, idempotency_key, endpoint)
    if replay is not None:
        return replay

    contract = await get_contract_by_id(db, payload.contract_id, lock_row=True)
    updated_contract = await transition_contract_to_active_funded(
        db, payload.contract_id
    )

    debit_acct = f"INDUSTRY_OPERATING:{contract['industry_id']}"
    credit_acct = f"BANK_ESCROW_VAULT:{contract['id']}"
    entry = await post_ledger_entry(
        db=db,
        contract_id=payload.contract_id,
        batch_id=None,
        entry_type="ESCROW_LOCK",
        debit_account=debit_acct,
        credit_account=credit_acct,
        amount_uzs=payload.lock_amount_uzs,
        bank_reference_id=payload.bank_reference_id,
    )

    response_data = {
        "contract": updated_contract,
        "ledger_entry": entry,
    }
    await save_idempotency_record(
        db=db,
        idempotency_key=idempotency_key,
        endpoint=endpoint,
        user_id=user_id,
        response_status=200,
        response_body=response_data,
    )
    await db.commit()
    return response_data


async def settle_batch_payout_in_ledger(
    db: AsyncSession,
    contract: dict[str, Any],
    batch_id: UUID,
    final_payout_uzs: Decimal,
    factoring_fee_uzs: Decimal,
    net_farmer_payout_uzs: Decimal,
) -> list[dict[str, Any]]:
    entries = []
    contract_id = contract["id"]
    farmer_acct = f"FARMER_SETTLEMENT:{contract['farmer_id']}"
    escrow_acct = f"BANK_ESCROW_VAULT:{contract_id}"
    bank_factoring_pool = f"BANK_FACTORING_POOL:{contract['partner_bank_id']}"
    bank_fee_revenue = f"BANK_FEE_REVENUE:{contract['partner_bank_id']}"

    if contract["payment_mode"] == "FACTORING":
        payout_entry = await post_ledger_entry(
            db=db,
            contract_id=contract_id,
            batch_id=batch_id,
            entry_type="FACTORING_PAYOUT",
            debit_account=bank_factoring_pool,
            credit_account=farmer_acct,
            amount_uzs=net_farmer_payout_uzs,
            bank_reference_id=f"FACT-PAY-{str(batch_id)[:8]}",
        )
        entries.append(payout_entry)
        if factoring_fee_uzs > Decimal("0.00"):
            fee_entry = await post_ledger_entry(
                db=db,
                contract_id=contract_id,
                batch_id=batch_id,
                entry_type="FACTORING_FEE",
                debit_account=bank_factoring_pool,
                credit_account=bank_fee_revenue,
                amount_uzs=factoring_fee_uzs,
                bank_reference_id=f"FACT-FEE-{str(batch_id)[:8]}",
            )
            entries.append(fee_entry)
    else:
        release_entry = await post_ledger_entry(
            db=db,
            contract_id=contract_id,
            batch_id=batch_id,
            entry_type="ESCROW_RELEASE",
            debit_account=escrow_acct,
            credit_account=farmer_acct,
            amount_uzs=final_payout_uzs,
            bank_reference_id=f"ESC-REL-{str(batch_id)[:8]}",
        )
        entries.append(release_entry)

    return entries


async def post_dispute_arbitration_split(
    db: AsyncSession,
    contract: dict[str, Any],
    batch_id: UUID,
    farmer_payout_uzs: Decimal,
    industry_refund_uzs: Decimal,
) -> list[dict[str, Any]]:
    entries = []
    contract_id = contract["id"]
    escrow_acct = f"BANK_ESCROW_VAULT:{contract_id}"
    farmer_acct = f"FARMER_SETTLEMENT:{contract['farmer_id']}"
    industry_acct = f"INDUSTRY_OPERATING:{contract['industry_id']}"

    if farmer_payout_uzs > Decimal("0.00"):
        e1 = await post_ledger_entry(
            db=db,
            contract_id=contract_id,
            batch_id=batch_id,
            entry_type="DISPUTE_SPLIT_PAYOUT",
            debit_account=escrow_acct,
            credit_account=farmer_acct,
            amount_uzs=farmer_payout_uzs,
            bank_reference_id=f"ARB-FARMER-{str(batch_id)[:8]}",
        )
        entries.append(e1)

    if industry_refund_uzs > Decimal("0.00"):
        e2 = await post_ledger_entry(
            db=db,
            contract_id=contract_id,
            batch_id=batch_id,
            entry_type="ESCROW_REFUND",
            debit_account=escrow_acct,
            credit_account=industry_acct,
            amount_uzs=industry_refund_uzs,
            bank_reference_id=f"ARB-REFUND-{str(batch_id)[:8]}",
        )
        entries.append(e2)

    return entries


async def get_bank_dashboard_kpis(db: AsyncSession) -> dict[str, Any]:
    stmt = text(
        """
        SELECT
            COALESCE(SUM(CASE WHEN entry_type = 'ESCROW_LOCK' THEN amount_uzs ELSE 0 END), 0.0000)
            - COALESCE(SUM(CASE WHEN entry_type IN ('ESCROW_RELEASE', 'DISPUTE_SPLIT_PAYOUT', 'ESCROW_REFUND') THEN amount_uzs ELSE 0 END), 0.0000)
            AS total_escrow_held_uzs,
            COALESCE(SUM(CASE WHEN entry_type = 'FACTORING_PAYOUT' THEN amount_uzs ELSE 0 END), 0.0000)
            AS total_factoring_deployed_uzs,
            COALESCE(SUM(CASE WHEN entry_type = 'FACTORING_FEE' THEN amount_uzs ELSE 0 END), 0.0000)
            AS total_factoring_fee_earned_uzs
        FROM financial_ledger
        """
    )
    res = await db.execute(stmt)
    row = dict(res.mappings().one())
    escrow_held = max(Decimal("0.00"), Decimal(str(row["total_escrow_held_uzs"])))
    factoring_deployed = Decimal(str(row["total_factoring_deployed_uzs"]))
    fee_earned = Decimal(str(row["total_factoring_fee_earned_uzs"]))
    repayments_due_week = (factoring_deployed * Decimal("0.25")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_EVEN
    )

    return {
        "total_escrow_held_uzs": escrow_held.quantize(Decimal("0.01")),
        "total_factoring_deployed_uzs": factoring_deployed.quantize(Decimal("0.01")),
        "repayments_due_this_week_uzs": repayments_due_week,
        "total_factoring_fee_revenue_uzs": fee_earned.quantize(Decimal("0.01")),
        "default_rate_pct": Decimal("0.00"),
    }


async def list_ledger_entries(
    db: AsyncSession, entry_type: Optional[str] = None
) -> list[dict[str, Any]]:
    where_clause = "WHERE entry_type = :entry_type" if entry_type else ""
    stmt = text(
        f"""
        SELECT * FROM financial_ledger
        {where_clause}
        ORDER BY created_at DESC
        LIMIT 200
        """
    )
    params = {"entry_type": entry_type} if entry_type else {}
    res = await db.execute(stmt, params)
    return [dict(r) for r in res.mappings().all()]


router = APIRouter(prefix="/bank", tags=["Escrow & Factoring Ledger"])


@router.post("/webhooks/confirm-lock")
async def confirm_lock_webhook_endpoint(
    request: Request,
    payload: ConfirmLockWebhookPayload,
    idempotency_key: str = Depends(require_idempotency_key),
    x_bank_signature: Optional[str] = Header(default=None, alias="X-Bank-Signature"),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    raw_body = await request.body()
    if x_bank_signature:
        verify_bank_webhook_hmac(raw_body, x_bank_signature)
    return await record_escrow_lock_and_activate(db, payload, idempotency_key)


@router.get("/dashboard-kpis")
async def bank_dashboard_kpis_endpoint(
    current_user: CurrentUser = Depends(require_roles(["BANK", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await get_bank_dashboard_kpis(db)


@router.get("/ledger")
async def list_ledger_endpoint(
    entry_type: Optional[str] = None,
    current_user: CurrentUser = Depends(
        require_roles(["BANK", "ADMIN"])
    ),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    return await list_ledger_entries(db, entry_type)


@router.get("/ledger/export-csv")
async def export_ledger_csv_endpoint(
    current_user: CurrentUser = Depends(require_roles(["BANK", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> Response:
    entries = await list_ledger_entries(db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "ISO20022_MsgId",
            "ContractId",
            "BatchId",
            "EntryType",
            "DebitAccount",
            "CreditAccount",
            "AmountUZS",
            "BankRef",
            "WebhookStatus",
            "CreatedAt",
        ]
    )
    for row in entries:
        writer.writerow(
            [
                row["id"],
                row["contract_id"],
                row["batch_id"] or "",
                row["entry_type"],
                row["debit_account"],
                row["credit_account"],
                f"{Decimal(str(row['amount_uzs'])):.4f}",
                row["bank_reference_id"] or "",
                row["webhook_status"],
                row["created_at"].isoformat() if row["created_at"] else "",
            ]
        )
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=iso20022_financial_ledger.csv"
        },
    )
