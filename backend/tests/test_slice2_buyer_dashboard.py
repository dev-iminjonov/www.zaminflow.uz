"""
Slice 2: Buyer (Dairy Industry) Dashboard & Role-Specific API Tests
References: DOC-REQ-BUY-001 (BUY-01..BUY-05), UX-SPEC-BUY-001
"""

from uuid import uuid4

import httpx
import pytest
from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token

BASE_URL = "http://127.0.0.1:8000/api/v1"


@pytest.mark.asyncio
async def test_slice2_buyer_dashboard_and_procurement():
    """
    Tests BUY-01 (Tenant-isolated Dairy Dashboard KPIs & Shipments),
    BUY-02 (Verified Farm Catalog with Trust Score & Cold-Chain Capacity),
    and cross-tenant isolation between Buyer A and Buyer B.
    """
    org_ids = []
    user_ids = []
    contract_id = None
    batch_id = None

    async with AsyncSessionLocal() as db:
        try:
            bank_org = uuid4()
            farmer_org = uuid4()
            farmer_user = uuid4()
            buyer_a_org = uuid4()
            buyer_a_user = uuid4()
            buyer_b_org = uuid4()
            buyer_b_user = uuid4()
            driver_user = uuid4()
            org_ids.extend([bank_org, farmer_org, buyer_a_org, buyer_b_org])
            user_ids.extend([farmer_user, buyer_a_user, buyer_b_user, driver_user])

            await db.execute(
                text(
                    "INSERT INTO organizations (id, role, legal_name, kyb_status, created_at) VALUES (:id, 'BANK', 'Escrow Bank', 'VERIFIED', NOW())"
                ),
                {"id": bank_org},
            )

            for idx, (oid, uid, role, sub_role, label) in enumerate([
                (farmer_org, farmer_user, "FARMER", "OWNER", "Zomin Pure Farm"),
                (buyer_a_org, buyer_a_user, "INDUSTRY", "OWNER", "Musaffo Dairy Plant"),
                (buyer_b_org, buyer_b_user, "INDUSTRY", "OWNER", "Rival Dairy Corp"),
            ]):
                await db.execute(
                    text(
                        """
                        INSERT INTO organizations (id, role, legal_name, kyb_status, tax_id, bank_iban, location, daily_capacity_liters, trust_score, created_at)
                        VALUES (:id, :role, :name, 'VERIFIED', :tax_id, 'UZ8800000000000000000099', CAST(ST_SetSRID(ST_MakePoint(68.3958, 39.9606), 4326) AS geography), 2400, 4.9, NOW())
                        """
                    ),
                    {"id": oid, "role": role, "name": label, "tax_id": f"88820010{idx}"},
                )
                if role == "FARMER":
                    await db.execute(
                        text("INSERT INTO farm_profiles (organization_id, cattle_headcount, cooling_tank_capacity_liters, updated_at) VALUES (:oid, 180, 3500, NOW())"),
                        {"oid": oid},
                    )
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, :sub_role, :name, :email, TRUE, NOW())
                        """
                    ),
                    {"id": uid, "org_id": oid, "sub_role": sub_role, "name": label, "email": f"buy_s2_{uid.hex[:8]}@zaminflow.uz"},
                )

            # Create a DRIVER user under Buyer A
            await db.execute(
                text(
                    """
                    INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                    VALUES (:id, :org_id, 'DRIVER', 'Tanker Driver', :email, TRUE, NOW())
                    """
                ),
                {"id": driver_user, "org_id": buyer_a_org, "email": f"drv_s2_{driver_user.hex[:8]}@zaminflow.uz"},
            )

            # Create active contract and shipment for Buyer A
            contract_id = uuid4()
            batch_id = uuid4()
            await db.execute(
                text(
                    """
                    INSERT INTO supply_contracts (
                        id, farmer_id, industry_id, partner_bank_id, payment_mode,
                        daily_volume_liters, base_price_per_liter, status
                    ) VALUES (
                        :cid, :fid, :iid, :bid, 'ESCROW', 2000, 4600, 'ACTIVE_FUNDED'
                    )
                    """
                ),
                {"cid": contract_id, "fid": farmer_org, "iid": buyer_a_org, "bid": bank_org},
            )
            await db.execute(
                text(
                    """
                    INSERT INTO delivery_batches (
                        id, contract_id, qr_token, reference_vial_code,
                        declared_volume_liters, pickup_temp_c, pickup_lat, pickup_lng,
                        status
                    ) VALUES (
                        :bid, :cid, :qr, 'VIAL-202',
                        1800, 3.2, 39.9606, 68.3958,
                        'IN_TRANSIT'
                    )
                    """
                ),
                {"bid": batch_id, "cid": contract_id, "qr": f"qr_{batch_id.hex}"},
            )
            await db.commit()

            token_farmer = create_access_token(str(farmer_user), str(farmer_org), "FARMER", "OWNER")
            token_buyer_a = create_access_token(str(buyer_a_user), str(buyer_a_org), "INDUSTRY", "OWNER")
            token_buyer_b = create_access_token(str(buyer_b_user), str(buyer_b_org), "INDUSTRY", "OWNER")
            token_driver = create_access_token(str(driver_user), str(buyer_a_org), "INDUSTRY", "DRIVER")

            async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
                # 1. Farmer and Driver cannot access /dairy/dashboard
                r_far = await client.get("/dairy/dashboard", headers={"Authorization": f"Bearer {token_farmer}"})
                assert r_far.status_code == 403
                r_drv = await client.get("/dairy/dashboard", headers={"Authorization": f"Bearer {token_driver}"})
                assert r_drv.status_code == 403

                # 2. BUY-01: Buyer A loads /dairy/dashboard and sees their active contract & incoming shipment
                r_dash_a = await client.get("/dairy/dashboard", headers={"Authorization": f"Bearer {token_buyer_a}"})
                assert r_dash_a.status_code == 200, r_dash_a.text
                data_a = r_dash_a.json()
                assert "openOrders" in data_a
                assert "incomingShipments" in data_a
                assert any(str(batch_id)[:8].upper() in s["batch"].upper() for s in data_a["incomingShipments"])

                # 3. Buyer B loads /dairy/dashboard and does NOT see Buyer A's shipment
                r_dash_b = await client.get("/dairy/dashboard", headers={"Authorization": f"Bearer {token_buyer_b}"})
                assert r_dash_b.status_code == 200
                data_b = r_dash_b.json()
                assert all(str(batch_id)[:8].upper() not in s["batch"].upper() for s in data_b["incomingShipments"])

                # 4. BUY-02: Buyer A queries /dairy/catalog for verified farm suppliers
                r_cat = await client.get("/dairy/catalog", headers={"Authorization": f"Bearer {token_buyer_a}"})
                assert r_cat.status_code == 200, r_cat.text
                catalog = r_cat.json()
                assert isinstance(catalog, list)
                assert any(item["organization_id"] == str(farmer_org) for item in catalog)

        finally:
            await db.rollback()
            if batch_id:
                await db.execute(text("DELETE FROM delivery_batches WHERE id = :bid"), {"bid": batch_id})
            if contract_id:
                await db.execute(text("DELETE FROM supply_contracts WHERE id = :cid"), {"cid": contract_id})
            if user_ids:
                await db.execute(text("DELETE FROM audit_logs WHERE actor_user_id = ANY(:uids)"), {"uids": user_ids})
            if org_ids:
                await db.execute(text("DELETE FROM organizations WHERE id = ANY(:oids)"), {"oids": org_ids})
            await db.commit()
