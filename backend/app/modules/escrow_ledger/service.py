import csv
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_EVEN
import hashlib
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
from app.core.policy import log_security_audit
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
    db: AsyncSession,
    entry_type: Optional[str] = None,
    partner_bank_id: Optional[UUID] = None,
) -> list[dict[str, Any]]:
    conditions = []
    params: dict[str, Any] = {}
    if entry_type:
        conditions.append("fl.entry_type = :entry_type")
        params["entry_type"] = entry_type
    if partner_bank_id:
        conditions.append("c.partner_bank_id = :partner_bank_id")
        params["partner_bank_id"] = partner_bank_id

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    stmt = text(
        f"""
        SELECT fl.*
        FROM financial_ledger fl
        JOIN supply_contracts c ON c.id = fl.contract_id
        {where_clause}
        ORDER BY fl.created_at DESC
        LIMIT 200
        """
    )
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


@router.get("/dashboard")
async def bank_dashboard_endpoint(
    current_user: CurrentUser = Depends(require_roles(["BANK", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    BNK-01: Tenant-isolated Partner Bank Escrow & Clearing Dashboard telemetry.
    """
    bank_filter = "WHERE c.partner_bank_id = :bank_id" if current_user.role == "BANK" else ""
    params = {"bank_id": current_user.organization_id} if current_user.role == "BANK" else {}

    kpi_res = await db.execute(
        text(
            f"""
            SELECT
                COALESCE(SUM(CASE WHEN fl.entry_type = 'ESCROW_LOCK' THEN fl.amount_uzs ELSE 0 END), 0)
                - COALESCE(SUM(CASE WHEN fl.entry_type IN ('ESCROW_RELEASE', 'DISPUTE_SPLIT_PAYOUT', 'ESCROW_REFUND') THEN fl.amount_uzs ELSE 0 END), 0)
                AS total_escrow_held_uzs,
                COALESCE(SUM(CASE WHEN fl.entry_type = 'ESCROW_RELEASE' THEN fl.amount_uzs ELSE 0 END), 0)
                AS released_today_uzs,
                COALESCE(SUM(CASE WHEN fl.entry_type = 'FACTORING_FEE' THEN fl.amount_uzs ELSE 0 END), 0)
                AS factoring_fee_uzs
            FROM financial_ledger fl
            JOIN supply_contracts c ON c.id = fl.contract_id
            {bank_filter}
            """
        ),
        params,
    )
    k_row = kpi_res.mappings().first() or {}
    escrow_held = max(0.0, float(k_row.get("total_escrow_held_uzs") or 0.0))
    released_today = float(k_row.get("released_today_uzs") or 0.0)
    fee_rev = float(k_row.get("factoring_fee_uzs") or 0.0)

    disp_res = await db.execute(
        text(
            f"""
            SELECT COUNT(*) AS frozen_count
            FROM delivery_batches b
            JOIN supply_contracts c ON c.id = b.contract_id
            {bank_filter + (" AND " if bank_filter else "WHERE ") + "b.status = 'DISPUTE_FROZEN'"}
            """
        ),
        params,
    )
    frozen_count = int(disp_res.scalar() or 0)

    raw_entries = await list_ledger_entries(
        db=db,
        partner_bank_id=current_user.organization_id if current_user.role == "BANK" else None,
    )
    formatted_entries = []
    for r in raw_entries:
        formatted_entries.append(
            {
                "id": str(r["id"]),
                "contractId": str(r["contract_id"]),
                "batchId": str(r["batch_id"]) if r["batch_id"] else None,
                "entryType": r["entry_type"],
                "debitAccount": r["debit_account"],
                "creditAccount": r["credit_account"],
                "amountUzs": f"{int(round(float(r['amount_uzs'] or 0))):,}",
                "bankReferenceId": r["bank_reference_id"] or f"ISO-{str(r['id'])[:8].upper()}",
                "webhookStatus": r["webhook_status"],
                "createdAt": r["created_at"].isoformat() if r["created_at"] else "",
            }
        )

    return {
        "totalEscrowHeld": {"value": f"{int(round(escrow_held)):,}", "unit": "UZS"},
        "releasedToday": {"value": f"{int(round(released_today)):,}", "unit": "UZS"},
        "frozenDisputes": {"value": str(frozen_count), "status": "● Escrow Frozen" if frozen_count > 0 else "✓ Clear"},
        "factoringFeeRevenue": {"value": f"{int(round(fee_rev)):,}", "unit": "UZS"},
        "ledgerEntries": formatted_entries,
    }


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
    return await list_ledger_entries(
        db=db,
        entry_type=entry_type,
        partner_bank_id=current_user.organization_id if current_user.role == "BANK" else None,
    )


@router.get("/ledger/export-csv")
async def export_ledger_csv_endpoint(
    current_user: CurrentUser = Depends(require_roles(["BANK", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> Response:
    entries = await list_ledger_entries(
        db=db,
        partner_bank_id=current_user.organization_id if current_user.role == "BANK" else None,
    )
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


@router.get("/ledger/export-iso20022")
async def export_ledger_iso20022_xml_endpoint(
    current_user: CurrentUser = Depends(require_roles(["BANK", "ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """
    BNK-04: Generates an ISO 20022 pacs.008.001.08 XML clearing statement with SHA-256 integrity digest.
    """
    entries = await list_ledger_entries(
        db=db,
        partner_bank_id=current_user.organization_id if current_user.role == "BANK" else None,
    )
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    msg_id = f"ZAMINFLOW-PACS008-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    total_sum = sum((Decimal(str(r["amount_uzs"])) for r in entries), Decimal("0.00"))

    tx_nodes = []
    for row in entries:
        amt = f"{Decimal(str(row['amount_uzs'])):.2f}"
        ref = row["bank_reference_id"] or str(row["id"])[:16]
        tx_nodes.append(
            f"""      <CdtTrfTxInf>
        <PmtId>
          <InstrId>{row['id']}</InstrId>
          <EndToEndId>{ref}</EndToEndId>
        </PmtId>
        <IntrBkSttlmAmt Ccy="UZS">{amt}</IntrBkSttlmAmt>
        <DbtrAcct><Id><Othr><Id>{row['debit_account']}</Id></Othr></Id></DbtrAcct>
        <CdtrAcct><Id><Othr><Id>{row['credit_account']}</Id></Othr></Id></CdtrAcct>
        <RmtInf><Ustrd>{row['entry_type']} Contract:{row['contract_id']}</Ustrd></RmtInf>
      </CdtTrfTxInf>"""
        )

    xml_body = f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>{msg_id}</MsgId>
      <CreDtTm>{now_iso}</CreDtTm>
      <NbOfTxs>{len(entries)}</NbOfTxs>
      <CtrlSum>{total_sum:.2f}</CtrlSum>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
{chr(10).join(tx_nodes)}
  </FIToFICstmrCdtTrf>
</Document>"""

    sha256_digest = hashlib.sha256(xml_body.encode("utf-8")).hexdigest()

    await log_security_audit(
        db=db,
        actor_user_id=current_user.id,
        action="ISO20022_XML_EXPORTED",
        entity_type="financial_ledger",
        entity_id=current_user.organization_id,
        details={
            "msg_id": msg_id,
            "nb_of_txs": len(entries),
            "ctrl_sum_uzs": f"{total_sum:.2f}",
            "sha256": sha256_digest,
        },
    )

    return Response(
        content=xml_body,
        media_type="application/xml",
        headers={
            "Content-Disposition": f"attachment; filename={msg_id}.xml",
            "X-ISO20022-SHA256": sha256_digest,
        },
    )
