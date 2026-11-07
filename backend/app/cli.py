import argparse
import asyncio
import getpass
import sys
from uuid import uuid4

from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash


async def create_superadmin(email: str, password: str | None = None, name: str = "Platform SuperAdmin") -> None:
    print(f"Creating SUPERADMIN for email: {email}")
    if not password:
        password = getpass.getpass("Enter password (min 10 chars, 1 letter, 1 digit): ")
        if len(password) < 10 or not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
            print("Error: Password must be at least 10 characters with at least one letter and one digit.")
            sys.exit(1)

        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Error: Passwords do not match.")
            sys.exit(1)
    else:
        if len(password) < 10 or not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
            print("Error: Password must be at least 10 characters with at least one letter and one digit.")
            sys.exit(1)

    password_hash = get_password_hash(password)

    async with AsyncSessionLocal() as db:
        # Check if email exists
        res = await db.execute(
            text("SELECT id FROM users WHERE lower(email) = lower(:email)"),
            {"email": email},
        )
        if res.first():
            print("Error: User with this email already exists.")
            sys.exit(1)

        # Check or create Admin Organization
        res_org = await db.execute(
            text("SELECT id FROM organizations WHERE role = 'ADMIN' LIMIT 1")
        )
        org_row = res_org.first()
        if org_row:
            org_id = org_row[0]
        else:
            org_id = uuid4()
            await db.execute(
                text(
                    """
                    INSERT INTO organizations (id, role, legal_name, kyb_status, daily_capacity_liters, trust_score, approved_credit_limit)
                    VALUES (:id, 'ADMIN', 'ZaminFlow System Administration', 'VERIFIED', 0, 100, 0)
                    """
                ),
                {"id": org_id},
            )

        user_id = uuid4()
        await db.execute(
            text(
                """
                INSERT INTO users (id, organization_id, sub_role, full_name, email, email_verified_at, password_hash, is_active)
                VALUES (:id, :org_id, 'SUPERADMIN', :full_name, :email, NOW(), :password_hash, TRUE)
                """
            ),
            {
                "id": user_id,
                "org_id": org_id,
                "full_name": name,
                "email": email.strip().lower(),
                "password_hash": password_hash,
            },
        )
        await db.commit()
        print(f"✓ SUPERADMIN created successfully (User ID: {user_id}, Org ID: {org_id})")


def main() -> None:
    parser = argparse.ArgumentParser(description="ZaminFlow System Administration CLI")
    subparsers = parser.add_subparsers(dest="command")

    admin_parser = subparsers.add_parser("create-superadmin", help="Bootstrap first SUPERADMIN user")
    admin_parser.add_argument("--email", required=True, help="Superadmin email address")
    admin_parser.add_argument("--password", required=False, default=None, help="Superadmin password")
    admin_parser.add_argument("--name", required=False, default="Platform SuperAdmin", help="Superadmin display name")

    args = parser.parse_args()

    if args.command == "create-superadmin":
        asyncio.run(create_superadmin(args.email, args.password, args.name))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
