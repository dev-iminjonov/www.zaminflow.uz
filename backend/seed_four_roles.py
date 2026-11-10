import asyncio
import logging
import os
from uuid import uuid4
from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_four_roles")

SEED_ACCOUNTS = [
    {
        "role_key": "farmer",
        "org_role": "FARMER",
        "org_name": "Baraka Agro Cooperative",
        "email": "farmer@zaminflow.uz",
        "phone_number": "+998 90 111 22 33",
        "full_name": "Rustam Oripov",
        "sub_role": "OWNER",
        "password_env": "SEED_FARMER_PASSWORD",
        "truck_plate": None,
        "kyb_status": "VERIFIED",
        "tax_id": "301112233",
        "bank_iban": "UZ2400000000100000000001",
        "address_text": "Samarqand Region, Pastdarg'om",
        "longitude": 66.9597,
        "latitude": 39.6270,
    },
    {
        "role_key": "dairy",
        "org_role": "INDUSTRY",
        "org_name": "Toshkent Sut Kombinati LLC",
        "email": "dairy@zaminflow.uz",
        "phone_number": "+998 90 222 33 44",
        "full_name": "Dilshod Rahimov",
        "sub_role": "OWNER",
        "password_env": "SEED_DAIRY_PASSWORD",
        "truck_plate": None,
        "kyb_status": "VERIFIED",
        "tax_id": "302223344",
        "bank_iban": "UZ2400000000100000000002",
        "address_text": "Tashkent City, Bektemir District",
        "longitude": 69.3340,
        "latitude": 41.2340,
    },
    {
        "role_key": "driver",
        "org_role": "INDUSTRY",
        "org_name": "Zamin Logistics Fleet",
        "email": "driver@zaminflow.uz",
        "phone_number": "+998 90 333 44 55",
        "full_name": "Sanjar Karimov",
        "sub_role": "DRIVER",
        "password_env": "SEED_DRIVER_PASSWORD",
        "truck_plate": "01 A 777 AA",
        "kyb_status": "VERIFIED",
        "tax_id": "303334455",
        "bank_iban": "UZ2400000000100000000003",
        "address_text": "Tashkent City, Sergeli District",
        "longitude": 69.2200,
        "latitude": 41.2100,
    },
    {
        "role_key": "admin",
        "org_role": "ADMIN",
        "org_name": "ZaminFlow Operations HQ",
        "email": "admin@zaminflow.uz",
        "phone_number": "+998 90 444 55 66",
        "full_name": "Platform Operator",
        "sub_role": "SUPERADMIN",
        "password_env": "SEED_ADMIN_PASSWORD",
        "truck_plate": None,
        "kyb_status": "VERIFIED",
        "tax_id": "304445566",
        "bank_iban": "UZ2400000000100000000004",
        "address_text": "Tashkent, Mirzo Ulugbek District",
        "longitude": 69.2800,
        "latitude": 41.3100,
    },
]

async def seed_users():
    async with AsyncSessionLocal() as db:
        for acc in SEED_ACCOUNTS:
            email = acc["email"].lower()
            password = os.environ.get(acc["password_env"])
            if not password:
                raise RuntimeError(
                    f"{acc['password_env']} must be configured in the environment"
                )
            password_hash = get_password_hash(password)

            res = await db.execute(
                text("SELECT id, organization_id FROM users WHERE lower(email) = :email"),
                {"email": email},
            )
            existing = res.mappings().first()

            if existing:
                user_id = existing["id"]
                org_id = existing["organization_id"]
                logger.info("Updating existing test account: %s (%s)", email, acc["role_key"])
                
                await db.execute(
                    text(
                        """
                        UPDATE organizations 
                        SET role = :role, legal_name = :legal_name, kyb_status = :kyb_status,
                            tax_id = :tax_id, bank_iban = :bank_iban, contact_phone = :phone,
                            address_text = :address_text,
                            location = ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
                        WHERE id = :org_id
                        """
                    ),
                    {
                        "role": acc["org_role"],
                        "legal_name": acc["org_name"],
                        "kyb_status": acc["kyb_status"],
                        "tax_id": acc["tax_id"],
                        "bank_iban": acc["bank_iban"],
                        "phone": acc["phone_number"],
                        "address_text": acc["address_text"],
                        "lon": acc["longitude"],
                        "lat": acc["latitude"],
                        "org_id": org_id,
                    },
                )

                await db.execute(
                    text(
                        """
                        UPDATE users 
                        SET full_name = :full_name, phone_number = :phone, password_hash = :hash,
                            sub_role = :sub_role, truck_plate = :plate, is_active = TRUE,
                            email_verified_at = NOW()
                        WHERE id = :user_id
                        """
                    ),
                    {
                        "full_name": acc["full_name"],
                        "phone": acc["phone_number"],
                        "hash": password_hash,
                        "sub_role": acc["sub_role"],
                        "plate": acc["truck_plate"],
                        "user_id": user_id,
                    },
                )
            else:
                logger.info("Creating new test account: %s (%s)", email, acc["role_key"])
                user_id = uuid4()

                # Check if organization with this tax_id already exists
                org_existing = await db.execute(
                    text("SELECT id FROM organizations WHERE tax_id = :tax_id"),
                    {"tax_id": acc["tax_id"]},
                )
                existing_org_id = org_existing.scalar()

                if existing_org_id:
                    org_id = existing_org_id
                else:
                    org_id = uuid4()
                    await db.execute(
                        text(
                            """
                            INSERT INTO organizations (
                                id, role, legal_name, kyb_status, tax_id, bank_iban,
                                contact_phone, address_text, location, created_at
                            ) VALUES (
                                :id, :role, :legal_name, :kyb_status, :tax_id, :bank_iban,
                                :phone, :address_text, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), NOW()
                            )
                            """
                        ),
                        {
                            "id": org_id,
                            "role": acc["org_role"],
                            "legal_name": acc["org_name"],
                            "kyb_status": acc["kyb_status"],
                            "tax_id": acc["tax_id"],
                            "bank_iban": acc["bank_iban"],
                            "phone": acc["phone_number"],
                            "address_text": acc["address_text"],
                            "lon": acc["longitude"],
                            "lat": acc["latitude"],
                        },
                    )

                await db.execute(
                    text(
                        """
                        INSERT INTO users (
                            id, organization_id, sub_role, full_name, email,
                            phone_number, password_hash, truck_plate, is_active,
                            email_verified_at, created_at
                        ) VALUES (
                            :id, :org_id, :sub_role, :full_name, :email,
                            :phone, :hash, :plate, TRUE,
                            NOW(), NOW()
                        )
                        """
                    ),
                    {
                        "id": user_id,
                        "org_id": org_id,
                        "sub_role": acc["sub_role"],
                        "full_name": acc["full_name"],
                        "email": email,
                        "phone": acc["phone_number"],
                        "hash": password_hash,
                        "plate": acc["truck_plate"],
                    },
                )

        await db.commit()
        logger.info("Four role test users successfully seeded and verified!")

if __name__ == "__main__":
    asyncio.run(seed_users())
