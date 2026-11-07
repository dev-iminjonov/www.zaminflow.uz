import json
from typing import Any, Optional
from uuid import UUID

from fastapi import Header, HTTPException, Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def require_idempotency_key(
    request: Request,
    idempotency_key: Optional[str] = Header(default=None, alias="Idempotency-Key"),
) -> str:
    if not idempotency_key or not idempotency_key.strip():
        raise HTTPException(
            status_code=400,
            detail="Mandatory Idempotency-Key header is required for state-mutating operations (Rule 03).",
        )
    if len(idempotency_key) > 128:
        raise HTTPException(
            status_code=400,
            detail="Idempotency-Key header must not exceed 128 characters.",
        )
    return idempotency_key.strip()


async def check_idempotency_replay(
    db: AsyncSession,
    idempotency_key: str,
    endpoint: str,
) -> Optional[dict[str, Any]]:
    """Checks if an Idempotency-Key has already been executed. Uses FOR UPDATE NOWAIT if row exists."""
    stmt = text(
        """
        SELECT key, endpoint, response_status, response_body
        FROM idempotency_keys
        WHERE key = :key
        FOR UPDATE NOWAIT
        """
    )
    result = await db.execute(stmt, {"key": idempotency_key})
    row = result.mappings().first()
    if row is not None:
        if row["endpoint"] != endpoint:
            raise HTTPException(
                status_code=409,
                detail="Idempotency-Key already used on a different endpoint.",
            )
        body = row["response_body"]
        if isinstance(body, str):
            body = json.loads(body)
        return body
    return None


async def save_idempotency_record(
    db: AsyncSession,
    idempotency_key: str,
    endpoint: str,
    user_id: Optional[UUID],
    response_status: int,
    response_body: dict[str, Any],
) -> None:
    stmt = text(
        """
        INSERT INTO idempotency_keys (key, endpoint, user_id, response_status, response_body)
        VALUES (:key, :endpoint, :user_id, :response_status, CAST(:response_body AS jsonb))
        """
    )
    await db.execute(
        stmt,
        {
            "key": idempotency_key,
            "endpoint": endpoint,
            "user_id": str(user_id) if user_id else None,
            "response_status": response_status,
            "response_body": json.dumps(response_body, default=str),
        },
    )
