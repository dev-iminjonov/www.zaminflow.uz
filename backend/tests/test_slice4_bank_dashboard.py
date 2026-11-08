"""
Slice 4: Partner Bank Escrow & ISO 20022 Clearing Dashboard Tests
References: DOC-REQ-BNK-001 (BNK-01..BNK-04), UX-SPEC-BNK-001
"""

from uuid import uuid4

import httpx
import pytest
from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token

BASE_URL = "http://127.0.0.1:8000/api/v1"


@pytest.mark.asyncio
async def test_slice4_bank_dashboard_tenancy_and_iso20022_export():
    """
    Tests BNK-01 (/bank/dashboard tenant-isolated KPIs),
    BNK-02 (/bank/ledger tenant isolation between Bank A and Bank B),
    and BNK-04 (/bank/ledger/export-iso20022 XML with SHA-256 hash & audit log).
    """
    org_ids = []
    user_ids = []
    contract_id = None
    ledger_id = None

    async with AsyncSessionLocal() as db:
        try:
            bank_a_org = uuid4()
            bank_a_user = uuid4()
            bank_b_org = uuid4()
            bank_b_user = uuid4()
            farmer_org = uuid4()
            farmer_user = uuid4()
            buyer_org = uuid4()
            buyer_user = uuid4()
            org_ids.extend([bank_a_org, bank_b_org, farmer_org, buyer_org])
            user_ids.extend([bank_a_user, bank_b_user, farmer_user, buyer_user])

            for oid, uid, label in [
                (bank_a_org, bank_a_user, "Agrobank ATB Custodian"),
                (bank_b_org, bank_b_user, "Other Commercial Bank"),
            ]:
                await db.execute(
                    text(
                        "INSERT INTO organizations (id, role, legal_name, kyb_status, created_at) VALUES (:id, 'BANK', :name, 'VERIFIED', NOW())"
                    ),
                    {"id": oid, "name": label},
                )
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, 'BANK_OFFICER', :name, :email, TRUE, NOW())
                        """
                    ),
                    {"id": uid, "org_id": oid, "name": label, "email": f"bnk_s4_{uid.hex[:8]}@zaminflow.uz"},
                )

            for idx, (oid, uid, role, label) in enumerate([
                (farmer_org, farmer_user, "FARMER", "Bank Test Farm"),
                (buyer_org, buyer_user, "INDUSTRY", "Bank Test Dairy"),
            ]):
                await db.execute(
                    text(
                        """
                        INSERT INTO organizations (id, role, legal_name, kyb_status, tax_id, bank_iban, location, daily_capacity_liters, created_at)
                        VALUES (:id, :role, :name, 'VERIFIED', :tax_id, 'UZ8800000000000000000099', CAST(ST_SetSRID(ST_MakePoint(69.2401, 41.2995), 4326) AS geography), 2000, NOW())
                        """
                    ),
                    {"id": oid, "role": role, "name": label, "tax_id": f"88840010{idx}"},
                )
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, 'OWNER', :name, :email, TRUE, NOW())
                        """
                    ),
                    {"id": uid, "org_id": oid, "name": label, "email": f"org_s4_{uid.hex[:8]}@zaminflow.uz"},
                )

            # Create contract and ledger entry for Bank A
            contract_id = uuid4()
            ledger_id = uuid4()
            await db.execute(
                text(
                    """
                    INSERT INTO supply_contracts (
                        id, farmer_id, industry_id, partner_bank_id, payment_mode,
                        daily_volume_liters, base_price_per_liter, status
                    ) VALUES (
                        :cid, :fid, :iid, :bid, 'ESCROW', 2500, 4800, 'ACTIVE_FUNDED'
                    )
                    """
                ),
                {"cid": contract_id, "fid": farmer_org, "iid": buyer_org, "bid": bank_a_org},
            )
            await db.execute(
                text(
                    """
                    INSERT INTO financial_ledger (
                        id, contract_id, entry_type, debit_account, credit_account,
                        amount_uzs, bank_reference_id, webhook_status
                    ) VALUES (
                        :lid, :cid, 'ESCROW_LOCK', :deb, :cred,
                        12000000.0000, 'AGRO-LOCK-901', 'DELIVERED'
                    )
                    """
                ),
                {
                    "lid": ledger_id,
                    "cid": contract_id,
                    "deb": f"INDUSTRY_OPERATING:{buyer_org}",
                    "cred": f"BANK_ESCROW_VAULT:{contract_id}",
                },
            )
            await db.commit()

            token_farmer = create_access_token(str(farmer_user), str(farmer_org), "FARMER", "OWNER")
            token_buyer = create_access_token(str(buyer_user), str(buyer_org), "INDUSTRY", "OWNER")
            token_bank_a = create_access_token(str(bank_a_user), str(bank_a_org), "BANK", "BANK_OFFICER")
            token_bank_b = create_access_token(str(bank_b_user), str(bank_b_org), "BANK", "BANK_OFFICER")

            async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
                # 1. Farmer and Buyer cannot access /bank/dashboard
                r_far = await client.get("/bank/dashboard", headers={"Authorization": f"Bearer {token_farmer}"})
                assert r_far.status_code == 403
                r_buy = await client.get("/bank/dashboard", headers={"Authorization": f"Bearer {token_buyer}"})
                assert r_buy.status_code == 403

                # 2. BNK-01: Bank A loads /bank/dashboard and sees their contract & ledger entry
                r_bnk_a = await client.get("/bank/dashboard", headers={"Authorization": f"Bearer {token_bank_a}"})
                assert r_bnk_a.status_code == 200, r_bnk_a.text
                data_a = r_bnk_a.json()
                assert "totalEscrowHeld" in data_a
                assert "ledgerEntries" in data_a
                assert any(e["bankReferenceId"] == "AGRO-LOCK-901" for e in data_a["ledgerEntries"])

                # 3. BNK-02: Bank B loads /bank/dashboard and /bank/ledger and does NOT see Bank A's ledger entry
                r_bnk_b = await client.get("/bank/dashboard", headers={"Authorization": f"Bearer {token_bank_b}"})
                assert r_bnk_b.status_code == 200
                data_b = r_bnk_b.json()
                assert all(e["bankReferenceId"] != "AGRO-LOCK-901" for e in data_b["ledgerEntries"])

                r_led_b = await client.get("/bank/ledger", headers={"Authorization": f"Bearer {token_bank_b}"})
                assert r_led_b.status_code == 200
                assert all(e.get("bank_reference_id") != "AGRO-LOCK-901" for e in r_led_b.json())

                # 4. BNK-04: Bank A exports ISO 20022 pacs.008.001.08 XML with SHA-256 hash
                r_xml = await client.get(
                    "/bank/ledger/export-iso20022",
                    headers={"Authorization": f"Bearer {token_bank_a}"},
                )
                assert r_xml.status_code == 200, r_xml.text
                assert "urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08" in r_xml.text
                assert "AGRO-LOCK-901" in r_xml.text
                assert "X-ISO20022-SHA256" in r_xml.headers

        finally:
            await db.rollback()
            if ledger_id:
                await db.execute(text("DELETE FROM financial_ledger WHERE id = :lid"), {"lid": ledger_id})
            if contract_id:
                await db.execute(text("DELETE FROM supply_contracts WHERE id = :cid"), {"cid": contract_id})
            if user_ids:
                await db.execute(text("DELETE FROM audit_logs WHERE actor_user_id = ANY(:uids)"), {"uids": user_ids})
            if org_ids:
                await db.execute(text("DELETE FROM organizations WHERE id = ANY(:oids)"), {"oids": org_ids})
            await db.commit()
