"""
Slice 1: Farmer Dashboard & Role-Specific API Tests
References: DOC-REQ-FAR-001 (FAR-01..FAR-05), UX-SPEC-FAR-001
"""

from uuid import uuid4

import httpx
import pytest
from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token

BASE_URL = "http://127.0.0.1:8000/api/v1"


@pytest.mark.asyncio
async def test_slice1_farmer_dashboard_and_actions():
    """
    Tests FAR-01 (Dashboard KPIs), FAR-02 (List Daily Supply),
    FAR-04 (Tenant-isolated Payouts), and FAR-05 (Raise Titration Dispute).
    """
    org_ids = []
    user_ids = []
    contract_id = None
    batch_id = None

    async with AsyncSessionLocal() as db:
        try:
            # Create Farmer A, Farmer B, Buyer A, Bank
            bank_org = uuid4()
            farmer_a_org = uuid4()
            farmer_a_user = uuid4()
            farmer_b_org = uuid4()
            farmer_b_user = uuid4()
            buyer_org = uuid4()
            buyer_user = uuid4()
            org_ids.extend([bank_org, farmer_a_org, farmer_b_org, buyer_org])
            user_ids.extend([farmer_a_user, farmer_b_user, buyer_user])

            await db.execute(
                text(
                    "INSERT INTO organizations (id, role, legal_name, kyb_status, created_at) VALUES (:id, 'BANK', 'Escrow Bank', 'VERIFIED', NOW())"
                ),
                {"id": bank_org},
            )

            for idx, (oid, uid, role, label) in enumerate([
                (farmer_a_org, farmer_a_user, "FARMER", "Chashma Baraka Farm"),
                (farmer_b_org, farmer_b_user, "FARMER", "Other Farm"),
                (buyer_org, buyer_user, "INDUSTRY", "Tashkent Dairy"),
            ]):
                await db.execute(
                    text(
                        """
                        INSERT INTO organizations (id, role, legal_name, kyb_status, tax_id, bank_iban, location, daily_capacity_liters, created_at)
                        VALUES (:id, :role, :name, 'VERIFIED', :tax_id, 'UZ8800000000000000000099', CAST(ST_SetSRID(ST_MakePoint(66.9597, 39.6542), 4326) AS geography), 1200, NOW())
                        """
                    ),
                    {"id": oid, "role": role, "name": label, "tax_id": f"88810010{idx}"},
                )
                if role == "FARMER":
                    await db.execute(
                        text("INSERT INTO farm_profiles (organization_id, cattle_headcount, cooling_tank_capacity_liters, updated_at) VALUES (:oid, 120, 2500, NOW())"),
                        {"oid": oid},
                    )
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, 'OWNER', :name, :email, TRUE, NOW())
                        """
                    ),
                    {"id": uid, "org_id": oid, "name": label, "email": f"far_s1_{uid.hex[:8]}@zaminflow.uz"},
                )

            # Create active contract and a batch for Farmer A
            contract_id = uuid4()
            batch_id = uuid4()
            await db.execute(
                text(
                    """
                    INSERT INTO supply_contracts (
                        id, farmer_id, industry_id, partner_bank_id, payment_mode,
                        daily_volume_liters, base_price_per_liter, status
                    ) VALUES (
                        :cid, :fid, :iid, :bid, 'ESCROW', 1500, 4850, 'ACTIVE_FUNDED'
                    )
                    """
                ),
                {"cid": contract_id, "fid": farmer_a_org, "iid": buyer_org, "bid": bank_org},
            )
            await db.execute(
                text(
                    """
                    INSERT INTO delivery_batches (
                        id, contract_id, qr_token, reference_vial_code,
                        declared_volume_liters, pickup_temp_c, pickup_lat, pickup_lng,
                        actual_volume_liters, actual_fat_pct, actual_snf_pct, actual_temp_c,
                        acidity_turner, final_payout_uzs, net_farmer_payout_uzs, status
                    ) VALUES (
                        :bid, :cid, :qr, 'VIAL-101',
                        1200, 3.4, 39.6542, 66.9597,
                        1195, 3.95, 8.70, 3.5,
                        16.5, 6214000, 6214000, 'AT_GATE'
                    )
                    """
                ),
                {"bid": batch_id, "cid": contract_id, "qr": f"qr_{batch_id.hex}"},
            )
            await db.commit()

            token_farmer_a = create_access_token(str(farmer_a_user), str(farmer_a_org), "FARMER", "OWNER")
            token_farmer_b = create_access_token(str(farmer_b_user), str(farmer_b_org), "FARMER", "OWNER")
            token_buyer = create_access_token(str(buyer_user), str(buyer_org), "INDUSTRY", "OWNER")

            async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
                # 1. Buyer cannot access /farmer/dashboard
                r_forbidden = await client.get(
                    "/farmer/dashboard",
                    headers={"Authorization": f"Bearer {token_buyer}"},
                )
                assert r_forbidden.status_code == 403

                # 2. FAR-01: Farmer A loads /farmer/dashboard with real DB telemetry
                r_dash = await client.get(
                    "/farmer/dashboard",
                    headers={"Authorization": f"Bearer {token_farmer_a}"},
                )
                assert r_dash.status_code == 200, r_dash.text
                dash_data = r_dash.json()
                assert "todayPrice" in dash_data
                assert "recentDeliveries" in dash_data
                assert len(dash_data["recentDeliveries"]) >= 1

                # 3. Farmer B loads /farmer/dashboard and does NOT see Farmer A's batch
                r_dash_b = await client.get(
                    "/farmer/dashboard",
                    headers={"Authorization": f"Bearer {token_farmer_b}"},
                )
                assert r_dash_b.status_code == 200
                dash_b = r_dash_b.json()
                assert all(str(batch_id)[:8].upper() not in d["batch"].upper() for d in dash_b["recentDeliveries"])

                # 4. FAR-02: Farmer A submits daily supply listing
                r_supply = await client.post(
                    "/farmer/supply",
                    headers={"Authorization": f"Bearer {token_farmer_a}"},
                    json={
                        "volume_liters": "1600.00",
                        "cooling_temp_c": "3.30",
                        "milking_session": "MORNING",
                    },
                )
                assert r_supply.status_code == 201, r_supply.text
                sup_data = r_supply.json()
                assert sup_data["status"] == "STORED"
                assert float(sup_data["estimated_escrow_uzs"]) > 0

                # 5. FAR-05: Farmer B cannot dispute Farmer A's batch
                r_disp_b = await client.post(
                    f"/farmer/batches/{batch_id}/dispute",
                    headers={"Authorization": f"Bearer {token_farmer_b}"},
                    json={"reason": "Fat % diverges from farm counter-sample by 0.35%", "vial_code": "VIAL-101"},
                )
                assert r_disp_b.status_code == 403

                # 6. FAR-05: Farmer A disputes their own batch -> transitions to DISPUTE_FROZEN
                r_disp_a = await client.post(
                    f"/farmer/batches/{batch_id}/dispute",
                    headers={"Authorization": f"Bearer {token_farmer_a}"},
                    json={"reason": "Fat % diverges from farm counter-sample by 0.35%", "vial_code": "VIAL-101"},
                )
                assert r_disp_a.status_code == 200, r_disp_a.text
                assert r_disp_a.json()["status"] == "DISPUTE_FROZEN"

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
