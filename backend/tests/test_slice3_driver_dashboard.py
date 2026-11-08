"""
Slice 3: Driver Dashboard, GPS/Cold-Chain Telemetry & Offline Sync Tests
References: DOC-REQ-DRI-001 (DRI-01..DRI-05), ADR-007, UX-SPEC-DRI-001
"""

from uuid import uuid4

import httpx
import pytest
from sqlalchemy import text

from app.core.database import AsyncSessionLocal, engine
from app.core.security import create_access_token

BASE_URL = "http://127.0.0.1:8000/api/v1"


@pytest.mark.asyncio
async def test_slice3_driver_dashboard_telemetry_and_offline_sync():
    """
    Tests DRI-01 (Driver Route Manifest without financial data),
    DRI-03 (Cold-Chain Telemetry ping), and DRI-04 (Offline Store-and-Forward Sync).
    """
    org_ids = []
    user_ids = []
    contract_id = None
    batch_id = None

    await engine.dispose()
    async with AsyncSessionLocal() as db:
        try:
            bank_org = uuid4()
            farmer_org = uuid4()
            farmer_user = uuid4()
            buyer_a_org = uuid4()
            buyer_a_user = uuid4()
            driver_a_user = uuid4()
            buyer_b_org = uuid4()
            driver_b_user = uuid4()
            org_ids.extend([bank_org, farmer_org, buyer_a_org, buyer_b_org])
            user_ids.extend([farmer_user, buyer_a_user, driver_a_user, driver_b_user])

            await db.execute(
                text(
                    "INSERT INTO organizations (id, role, legal_name, kyb_status, created_at) VALUES (:id, 'BANK', 'Escrow Bank', 'VERIFIED', NOW())"
                ),
                {"id": bank_org},
            )

            for idx, (oid, role, label) in enumerate([
                (farmer_org, "FARMER", "Sayxunobod Dairy Coop"),
                (buyer_a_org, "INDUSTRY", "Tashkent Central Dairy"),
                (buyer_b_org, "INDUSTRY", "Other Region Dairy"),
            ]):
                await db.execute(
                    text(
                        """
                        INSERT INTO organizations (id, role, legal_name, kyb_status, tax_id, bank_iban, location, daily_capacity_liters, created_at)
                        VALUES (:id, :role, :name, 'VERIFIED', :tax_id, 'UZ8800000000000000000099', CAST(ST_SetSRID(ST_MakePoint(69.2401, 41.2995), 4326) AS geography), 2000, NOW())
                        """
                    ),
                    {"id": oid, "role": role, "name": label, "tax_id": f"88830010{idx}"},
                )

            for uid, oid, sub_role, name in [
                (farmer_user, farmer_org, "OWNER", "Farm Owner"),
                (buyer_a_user, buyer_a_org, "OWNER", "Buyer Owner"),
                (driver_a_user, buyer_a_org, "DRIVER", "Azizbek Tanker Driver"),
                (driver_b_user, buyer_b_org, "DRIVER", "Other Fleet Driver"),
            ]:
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, :sub_role, :name, :email, TRUE, NOW())
                        """
                    ),
                    {"id": uid, "org_id": oid, "sub_role": sub_role, "name": name, "email": f"drv_s3_{uid.hex[:8]}@zaminflow.uz"},
                )

            contract_id = uuid4()
            batch_id = uuid4()
            await db.execute(
                text(
                    """
                    INSERT INTO supply_contracts (
                        id, farmer_id, industry_id, partner_bank_id, payment_mode,
                        daily_volume_liters, base_price_per_liter, status
                    ) VALUES (
                        :cid, :fid, :iid, :bid, 'ESCROW', 1200, 4500, 'ACTIVE_FUNDED'
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
                        :bid, :cid, :qr, 'VIAL-303',
                        1200, 3.2, 41.2995, 69.2401,
                        'IN_TRANSIT'
                    )
                    """
                ),
                {"bid": batch_id, "cid": contract_id, "qr": f"qr_{batch_id.hex}"},
            )
            await db.commit()

            token_farmer = create_access_token(str(farmer_user), str(farmer_org), "FARMER", "OWNER")
            token_buyer = create_access_token(str(buyer_a_user), str(buyer_a_org), "INDUSTRY", "OWNER")
            token_driver_a = create_access_token(str(driver_a_user), str(buyer_a_org), "INDUSTRY", "DRIVER")
            token_driver_b = create_access_token(str(driver_b_user), str(buyer_b_org), "INDUSTRY", "DRIVER")

            async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
                # 1. Farmer and Buyer Owner cannot access /driver/dashboard
                r_far = await client.get("/driver/dashboard", headers={"Authorization": f"Bearer {token_farmer}"})
                assert r_far.status_code == 403
                r_buy = await client.get("/driver/dashboard", headers={"Authorization": f"Bearer {token_buyer}"})
                assert r_buy.status_code == 403

                # 2. DRI-01: Driver A loads /driver/dashboard and gets route stops WITHOUT price/escrow fields
                r_drv_a = await client.get("/driver/dashboard", headers={"Authorization": f"Bearer {token_driver_a}"})
                assert r_drv_a.status_code == 200, r_drv_a.text
                data_a = r_drv_a.json()
                assert "todayStops" in data_a
                assert "coldChain" in data_a
                assert "escrowBalance" not in data_a
                assert "todayPrice" not in data_a
                assert any(str(batch_id)[:8].upper() in s["batchInfo"].upper() for s in data_a["todayStops"])

                # 3. Driver B (other dairy fleet) does NOT see Driver A's stops
                r_drv_b = await client.get("/driver/dashboard", headers={"Authorization": f"Bearer {token_driver_b}"})
                assert r_drv_b.status_code == 200
                data_b = r_drv_b.json()
                assert all(str(batch_id)[:8].upper() not in s["batchInfo"].upper() for s in data_b["todayStops"])

                # 4. DRI-03: Driver A submits cold-chain telemetry
                r_tel = await client.post(
                    "/driver/telemetry",
                    headers={"Authorization": f"Bearer {token_driver_a}"},
                    json={
                        "batch_id": str(batch_id),
                        "lat": 41.3050,
                        "lng": 69.2500,
                        "tank_temp_c": "3.4",
                        "recorded_at": "2026-11-08T10:00:00Z",
                    },
                )
                assert r_tel.status_code == 200, r_tel.text
                tel_data = r_tel.json()
                assert tel_data["cold_chain_ok"] is True

                # 5. DRI-04: Driver A syncs offline store-and-forward queue (ADR-007)
                r_sync = await client.post(
                    "/driver/offline-sync",
                    headers={"Authorization": f"Bearer {token_driver_a}"},
                    json={
                        "events": [
                            {
                                "idempotency_key": f"sync_{uuid4().hex[:12]}",
                                "event_type": "TELEMETRY_PING",
                                "batch_id": str(batch_id),
                                "lat": 41.3100,
                                "lng": 69.2600,
                                "tank_temp_c": "3.5",
                                "recorded_at": "2026-11-08T10:05:00Z",
                            }
                        ]
                    },
                )
                assert r_sync.status_code == 200, r_sync.text
                sync_data = r_sync.json()
                assert sync_data["synced_count"] == 1

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
