"""Prepare the database schema and start the FastAPI server."""

import asyncio
import os
import subprocess
import sys

from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings


_EXISTING_SUPABASE_TABLES = {
    "organizations",
    "users",
    "supply_contracts",
    "delivery_batches",
    "financial_ledger",
    "idempotency_keys",
    "farm_profiles",
    "industry_profiles",
    "bank_profiles",
    "kyb_documents",
    "email_tokens",
    "refresh_tokens",
    "login_attempts",
    "notifications",
    "audit_logs",
}


async def _is_existing_schema_without_alembic_history() -> bool:
    engine = create_async_engine(settings.DATABASE_URL, poolclass=NullPool)
    try:
        async with engine.connect() as connection:
            tables = set(
                (
                    await connection.execute(
                        text(
                            "SELECT table_name FROM information_schema.tables "
                            "WHERE table_schema = 'public'"
                        )
                    )
                ).scalars()
            )
            if not _EXISTING_SUPABASE_TABLES.issubset(tables):
                return False

            required_columns = await connection.execute(
                text(
                    "SELECT table_name, column_name FROM information_schema.columns "
                    "WHERE table_schema = 'public' AND "
                    "((table_name = 'organizations' AND column_name = 'kyb_submitted_at') "
                    "OR (table_name = 'users' AND column_name IN ('email', 'last_sign_in_at')))"
                )
            )
            columns = set(required_columns.all())
            return {
                ("organizations", "kyb_submitted_at"),
                ("users", "email"),
                ("users", "last_sign_in_at"),
            }.issubset(columns) and "alembic_version" not in tables
    finally:
        await engine.dispose()


def _alembic_config() -> Config:
    return Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))


def main() -> None:
    if asyncio.run(_is_existing_schema_without_alembic_history()):
        # The Supabase migration already created both Alembic revisions' schema.
        # Record that baseline instead of re-running CREATE TABLE against live data.
        command.stamp(_alembic_config(), "head")

    command.upgrade(_alembic_config(), "head")
    port = os.environ.get("PORT", "8080")
    os.execv(
        sys.executable,
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port],
    )


if __name__ == "__main__":
    main()
