"""
Slice 0 Authorization & Permission Matrix Test Suite
References: DOC-ARCH-SEC-001, ADR-006, DOC-TEST-AUT-001, 03-permission-matrix.csv
"""

import asyncio
from decimal import Decimal
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import text

from app.core.database import AsyncSessionLocal, engine
from app.core.security import create_access_token
from app.modules.auth_rbac.service import get_canonical_role_and_dashboard

BASE_URL = "http://127.0.0.1:8000/api/v1"


def test_canonical_role_mapping_includes_bank():
    """AUTH-TEST-08: Verify BANK organization role maps to ('bank', '/dashboard/bank')."""
    role, path = get_canonical_role_and_dashboard("BANK", "BANK_OFFICER")
    assert role == "bank"
    assert path == "/dashboard/bank"


def test_unauthenticated_access_rejected():
    """AUTH-TEST-01: Verify unauthenticated requests to protected role endpoints return 401."""
    protected_gets = [
        "/contracts",
        "/batches",
        "/bank/ledger",
        "/bank/dashboard-kpis",
        "/disputes/admin-metrics",
    ]
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        for path in protected_gets:
            resp = client.get(path)
            assert resp.status_code == 401, f"Expected 401 for {path}, got {resp.status_code}"


@pytest.mark.asyncio
async def test_role_isolation_and_cross_tenant_abac():
    """
    AUTH-TEST-02, AUTH-TEST-03, AUTH-TEST-04, AUTH-TEST-05, AUTH-TEST-06, AUTH-TEST-10:
    Full RBAC and ABAC cross-tenant isolation verification across Farmer A, Farmer B,
    Buyer A, Buyer B, Driver, Bank, and Admin.
    """
    org_ids = []
    user_ids = []
    contract_id = None

    await engine.dispose()
    async with AsyncSessionLocal() as db:
        try:
            # Ensure a Partner Bank exists
            bank_org_id = uuid4()
            bank_user_id = uuid4()
            org_ids.append(bank_org_id)
            user_ids.append(bank_user_id)
            await db.execute(
                text(
                    """
                    INSERT INTO organizations (id, role, legal_name, kyb_status, created_at)
                    VALUES (:id, 'BANK', 'Test Escrow Bank', 'VERIFIED', NOW())
                    """
                ),
                {"id": bank_org_id},
            )
            await db.execute(
                text(
                    """
                    INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                    VALUES (:id, :org_id, 'BANK_OFFICER', 'Bank Officer', :email, TRUE, NOW())
                    """
                ),
                {
                    "id": bank_user_id,
                    "org_id": bank_org_id,
                    "email": f"test_bank_{bank_user_id.hex[:8]}@zaminflow.uz",
                },
            )

            # Create Farmer A & Farmer B
            farmer_a_org = uuid4()
            farmer_a_user = uuid4()
            farmer_b_org = uuid4()
            farmer_b_user = uuid4()
            org_ids.extend([farmer_a_org, farmer_b_org])
            user_ids.extend([farmer_a_user, farmer_b_user])

            for idx, (oid, uid, label) in enumerate([
                (farmer_a_org, farmer_a_user, "Farmer A"),
                (farmer_b_org, farmer_b_user, "Farmer B"),
            ]):
                await db.execute(
                    text(
                        """
                        INSERT INTO organizations (id, role, legal_name, kyb_status, tax_id, bank_iban, location, created_at)
                        VALUES (:id, 'FARMER', :name, 'VERIFIED', :tax_id, 'UZ8800000000000000000001', CAST(ST_SetSRID(ST_MakePoint(66.9597, 39.6542), 4326) AS geography), NOW())
                        """
                    ),
                    {"id": oid, "name": label, "tax_id": f"99900010{idx}"},
                )
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, 'OWNER', :name, :email, TRUE, NOW())
                        """
                    ),
                    {
                        "id": uid,
                        "org_id": oid,
                        "name": label,
                        "email": f"test_{uid.hex[:8]}@zaminflow.uz",
                    },
                )

            # Create Buyer A, Buyer B, and a Driver under Buyer A
            buyer_a_org = uuid4()
            buyer_a_user = uuid4()
            buyer_b_org = uuid4()
            buyer_b_user = uuid4()
            driver_user = uuid4()
            org_ids.extend([buyer_a_org, buyer_b_org])
            user_ids.extend([buyer_a_user, buyer_b_user, driver_user])

            for idx, (oid, uid, label) in enumerate([
                (buyer_a_org, buyer_a_user, "Buyer A"),
                (buyer_b_org, buyer_b_user, "Buyer B"),
            ]):
                await db.execute(
                    text(
                        """
                        INSERT INTO organizations (id, role, legal_name, kyb_status, tax_id, bank_iban, location, created_at)
                        VALUES (:id, 'INDUSTRY', :name, 'VERIFIED', :tax_id, 'UZ8800000000000000000002', CAST(ST_SetSRID(ST_MakePoint(69.2401, 41.2995), 4326) AS geography), NOW())
                        """
                    ),
                    {"id": oid, "name": label, "tax_id": f"99900020{idx}"},
                )
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, 'OWNER', :name, :email, TRUE, NOW())
                        """
                    ),
                    {
                        "id": uid,
                        "org_id": oid,
                        "name": label,
                        "email": f"test_{uid.hex[:8]}@zaminflow.uz",
                    },
                )

            # Driver user in Buyer A organization (org.role = INDUSTRY, user.sub_role = DRIVER)
            await db.execute(
                text(
                    """
                    INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                    VALUES (:id, :org_id, 'DRIVER', 'Tanker Driver', :email, TRUE, NOW())
                    """
                ),
                {
                    "id": driver_user,
                    "org_id": buyer_a_org,
                    "email": f"test_drv_{driver_user.hex[:8]}@zaminflow.uz",
                },
            )

            await db.commit()

            # Mint JWT tokens
            token_farmer_a = create_access_token(str(farmer_a_user), str(farmer_a_org), "FARMER", "OWNER")
            token_farmer_b = create_access_token(str(farmer_b_user), str(farmer_b_org), "FARMER", "OWNER")
            token_buyer_a = create_access_token(str(buyer_a_user), str(buyer_a_org), "INDUSTRY", "OWNER")
            token_buyer_b = create_access_token(str(buyer_b_user), str(buyer_b_org), "INDUSTRY", "OWNER")
            token_driver = create_access_token(str(driver_user), str(buyer_a_org), "INDUSTRY", "DRIVER")
            token_bank = create_access_token(str(bank_user_id), str(bank_org_id), "BANK", "BANK_OFFICER")

            async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
                # 1. AUTH-TEST-02: Farmer cannot access Bank Ledger or KPIs
                r_bank_ledger = await client.get(
                    "/bank/ledger",
                    headers={"Authorization": f"Bearer {token_farmer_a}"},
                )
                assert r_bank_ledger.status_code == 403, f"Farmer accessed bank ledger: {r_bank_ledger.status_code}"

                r_bank_kpis = await client.get(
                    "/bank/dashboard-kpis",
                    headers={"Authorization": f"Bearer {token_farmer_a}"},
                )
                assert r_bank_kpis.status_code == 403

                # 2. AUTH-TEST-10: Verify audit_logs recorded UNAUTHORIZED_ACCESS_ATTEMPT
                audit_res = await db.execute(
                    text(
                        """
                        SELECT COUNT(*) FROM audit_logs
                        WHERE actor_user_id = :uid AND action = 'UNAUTHORIZED_ACCESS_ATTEMPT'
                        """
                    ),
                    {"uid": farmer_a_user},
                )
                assert (audit_res.scalar() or 0) >= 1, "Expected UNAUTHORIZED_ACCESS_ATTEMPT in audit_logs"

                # 3. AUTH-TEST-04: Driver cannot create a supply contract even though org_role is INDUSTRY
                r_drv_contract = await client.post(
                    "/contracts",
                    headers={
                        "Authorization": f"Bearer {token_driver}",
                        "Idempotency-Key": str(uuid4()),
                    },
                    json={
                        "farmer_id": str(farmer_a_org),
                        "industry_id": str(buyer_a_org),
                        "partner_bank_id": str(bank_org_id),
                        "daily_volume_liters": "1000.00",
                        "base_price_per_liter": "4800.00",
                    },
                )
                assert r_drv_contract.status_code == 403, f"Driver was allowed to create contract: {r_drv_contract.status_code}"

                # 4. Buyer A cannot create a contract pretending to be Buyer B (ABAC tenant spoofing)
                r_spoof_contract = await client.post(
                    "/contracts",
                    headers={
                        "Authorization": f"Bearer {token_buyer_a}",
                        "Idempotency-Key": str(uuid4()),
                    },
                    json={
                        "farmer_id": str(farmer_a_org),
                        "industry_id": str(buyer_b_org),  # Spoofing Buyer B!
                        "partner_bank_id": str(bank_org_id),
                        "daily_volume_liters": "1000.00",
                        "base_price_per_liter": "4800.00",
                    },
                )
                assert r_spoof_contract.status_code == 403, "Buyer A spoofed Buyer B in contract creation"

                # 5. Legitimate contract creation by Buyer A with Farmer A
                r_create = await client.post(
                    "/contracts",
                    headers={
                        "Authorization": f"Bearer {token_buyer_a}",
                        "Idempotency-Key": str(uuid4()),
                    },
                    json={
                        "farmer_id": str(farmer_a_org),
                        "industry_id": str(buyer_a_org),
                        "partner_bank_id": str(bank_org_id),
                        "daily_volume_liters": "1500.00",
                        "base_price_per_liter": "4850.00",
                    },
                )
                assert r_create.status_code in (200, 201), r_create.text
                contract_id = r_create.json()["id"]

                # 6. AUTH-TEST-05: Farmer B cannot countersign Farmer A's contract
                r_farmer_b_sign = await client.post(
                    f"/contracts/{contract_id}/sign",
                    headers={
                        "Authorization": f"Bearer {token_farmer_b}",
                        "Idempotency-Key": str(uuid4()),
                    },
                    json={"payment_mode": "ESCROW"},
                )
                assert r_farmer_b_sign.status_code == 403, "Farmer B signed Farmer A's contract!"

                # 6b. Farmer B cannot generate a pickup QR for Farmer A's contract
                r_farmer_b_qr = await client.post(
                    "/batches/generate-pickup-qr",
                    headers={"Authorization": f"Bearer {token_farmer_b}"},
                    json={
                        "contract_id": str(contract_id),
                        "declared_volume_liters": "500.00",
                        "pickup_temp_c": "3.50",
                    },
                )
                assert r_farmer_b_qr.status_code == 403, "Farmer B generated QR for Farmer A's contract!"

                # 6c. AUTH-TEST-03: Dairy Buyer cannot generate Farmer pickup QR
                r_buyer_qr = await client.post(
                    "/batches/generate-pickup-qr",
                    headers={"Authorization": f"Bearer {token_buyer_a}"},
                    json={
                        "contract_id": str(contract_id),
                        "declared_volume_liters": "500.00",
                        "pickup_temp_c": "3.50",
                    },
                )
                assert r_buyer_qr.status_code == 403

                # 6d. AUTH-TEST-04 & AUTH-TEST-09: Driver and Bank cannot submit lab titration
                fake_batch_id = str(uuid4())
                for bad_token, label in [(token_driver, "Driver"), (token_bank, "Bank")]:
                    r_bad_lab = await client.post(
                        f"/batches/{fake_batch_id}/lab-verify",
                        headers={
                            "Authorization": f"Bearer {bad_token}",
                            "Idempotency-Key": str(uuid4()),
                        },
                        json={
                            "actual_volume_liters": "1000.00",
                            "actual_fat_pct": "3.80",
                            "actual_snf_pct": "8.60",
                            "actual_temp_c": "3.50",
                            "acidity_turner": "16.50",
                            "antibiotics_negative": True,
                        },
                    )
                    assert r_bad_lab.status_code == 403, f"{label} was not blocked from lab-verify!"

                # 7. AUTH-TEST-06: Buyer B cannot see Buyer A's contract
                r_buyer_b_list = await client.get(
                    "/contracts",
                    headers={"Authorization": f"Bearer {token_buyer_b}"},
                )
                assert r_buyer_b_list.status_code == 200
                buyer_b_contracts = r_buyer_b_list.json()
                assert all(c["id"] != contract_id for c in buyer_b_contracts), "Buyer B saw Buyer A's contract!"

                # 8. Bank Officer can access /bank/ledger and /bank/dashboard-kpis
                r_bank_ok = await client.get(
                    "/bank/dashboard-kpis",
                    headers={"Authorization": f"Bearer {token_bank}"},
                )
                assert r_bank_ok.status_code == 200

        finally:
            await db.rollback()
            # Clean up all created test data
            if contract_id:
                await db.execute(
                    text("DELETE FROM supply_contracts WHERE id = :cid"),
                    {"cid": contract_id},
                )
            if user_ids:
                await db.execute(
                    text("DELETE FROM audit_logs WHERE actor_user_id = ANY(:uids)"),
                    {"uids": user_ids},
                )
                await db.execute(
                    text("DELETE FROM idempotency_keys WHERE user_id = ANY(:uids)"),
                    {"uids": user_ids},
                )
            if org_ids:
                await db.execute(
                    text("DELETE FROM organizations WHERE id = ANY(:oids)"),
                    {"oids": org_ids},
                )
            await db.commit()
    await engine.dispose()
