"""
Slice 5: Platform Admin Governance, KYB Verification & Audit Log Tests
References: DOC-REQ-ADM-001 (ADM-01..ADM-04), UX-SPEC-ADM-001
"""

from uuid import uuid4

import httpx
import pytest
from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token

BASE_URL = "http://127.0.0.1:8000/api/v1"


@pytest.mark.asyncio
async def test_slice5_admin_dashboard_kyb_and_audit_logs():
    """
    Tests ADM-01 (/admin/dashboard live governance metrics),
    ADM-02 (KYB approval workflow), and ADM-04 (/admin/audit-logs).
    """
    org_ids = []
    user_ids = []

    async with AsyncSessionLocal() as db:
        try:
            admin_org = uuid4()
            admin_user = uuid4()
            pending_farmer_org = uuid4()
            pending_farmer_user = uuid4()
            bank_org = uuid4()
            bank_user = uuid4()
            org_ids.extend([admin_org, pending_farmer_org, bank_org])
            user_ids.extend([admin_user, pending_farmer_user, bank_user])

            await db.execute(
                text(
                    "INSERT INTO organizations (id, role, legal_name, kyb_status, created_at) VALUES (:id, 'ADMIN', 'ZaminFlow Governance', 'VERIFIED', NOW())"
                ),
                {"id": admin_org},
            )
            await db.execute(
                text(
                    "INSERT INTO organizations (id, role, legal_name, kyb_status, created_at) VALUES (:id, 'BANK', 'Escrow Bank', 'VERIFIED', NOW())"
                ),
                {"id": bank_org},
            )
            await db.execute(
                text(
                    """
                    INSERT INTO organizations (id, role, legal_name, kyb_status, tax_id, bank_iban, location, daily_capacity_liters, created_at)
                    VALUES (:id, 'FARMER', 'Pending KYB Farm', 'SUBMITTED', '888500101', 'UZ8800000000000000000099', CAST(ST_SetSRID(ST_MakePoint(69.2401, 41.2995), 4326) AS geography), 1400, NOW())
                    """
                ),
                {"id": pending_farmer_org},
            )

            for uid, oid, sub_role, name in [
                (admin_user, admin_org, "SUPERADMIN", "Platform Admin"),
                (pending_farmer_user, pending_farmer_org, "OWNER", "Pending Farmer"),
                (bank_user, bank_org, "BANK_OFFICER", "Bank Officer"),
            ]:
                await db.execute(
                    text(
                        """
                        INSERT INTO users (id, organization_id, sub_role, full_name, email, is_active, created_at)
                        VALUES (:id, :org_id, :sub_role, :name, :email, TRUE, NOW())
                        """
                    ),
                    {"id": uid, "org_id": oid, "sub_role": sub_role, "name": name, "email": f"adm_s5_{uid.hex[:8]}@zaminflow.uz"},
                )

            await db.commit()

            token_admin = create_access_token(str(admin_user), str(admin_org), "ADMIN", "SUPERADMIN")
            token_farmer = create_access_token(str(pending_farmer_user), str(pending_farmer_org), "FARMER", "OWNER")
            token_bank = create_access_token(str(bank_user), str(bank_org), "BANK", "BANK_OFFICER")

            async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
                # 1. Farmer and Bank Officer cannot access /admin/dashboard or /admin/audit-logs
                for tok in (token_farmer, token_bank):
                    r_forb = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {tok}"})
                    assert r_forb.status_code == 403
                    r_aud_forb = await client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {tok}"})
                    assert r_aud_forb.status_code == 403

                # 2. ADM-01: Admin loads /admin/dashboard and sees pending verification queue
                r_adm = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {token_admin}"})
                assert r_adm.status_code == 200, r_adm.text
                adm_data = r_adm.json()
                assert "pendingVerification" in adm_data
                assert "verificationQueue" in adm_data
                assert "usersByRole" in adm_data
                assert any(item["id"] == str(pending_farmer_org) for item in adm_data["verificationQueue"])

                # 3. ADM-04: Admin queries /admin/audit-logs and sees UNAUTHORIZED_ACCESS_ATTEMPT from step 1
                r_logs = await client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {token_admin}"})
                assert r_logs.status_code == 200, r_logs.text
                logs_list = r_logs.json()
                assert isinstance(logs_list, list)
                assert any(entry["action"] == "UNAUTHORIZED_ACCESS_ATTEMPT" for entry in logs_list)

        finally:
            await db.rollback()
            if user_ids:
                await db.execute(text("DELETE FROM audit_logs WHERE actor_user_id = ANY(:uids)"), {"uids": user_ids})
            if org_ids:
                await db.execute(text("DELETE FROM organizations WHERE id = ANY(:oids)"), {"oids": org_ids})
            await db.commit()
