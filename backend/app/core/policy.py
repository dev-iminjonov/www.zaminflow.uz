"""
Central RBAC & ABAC Policy Engine for ZaminFlow
References: DOC-ARCH-SEC-001, ADR-006, 03-permission-matrix.csv
"""

import json
import logging
from typing import Any, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


async def log_security_audit(
    db: AsyncSession,
    actor_user_id: Optional[UUID],
    action: str,
    entity_type: str,
    entity_id: Optional[UUID] = None,
    details: Optional[dict[str, Any]] = None,
) -> None:
    """Writes an immutable audit record to audit_logs."""
    try:
        stmt = text(
            """
            INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details, created_at)
            VALUES (:actor, :action, :entity_type, :entity_id, CAST(:details AS jsonb), NOW())
            """
        )
        await db.execute(
            stmt,
            {
                "actor": actor_user_id,
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "details": json.dumps(details or {}),
            },
        )
        await db.commit()
    except Exception as exc:
        logger.warning("Audit log write failed: %s", exc)


async def enforce_abac_tenancy(
    db: AsyncSession,
    actor_user_id: UUID,
    actor_org_id: UUID,
    actor_role: str,
    expected_org_id: UUID,
    resource_type: str,
    resource_id: Optional[UUID] = None,
) -> None:
    """
    Verifies that the acting user's organization matches the target resource's tenant owner,
    unless the user is a Platform ADMIN.
    Logs UNAUTHORIZED_ACCESS_ATTEMPT on violation and raises 403 Forbidden.
    """
    if actor_role == "ADMIN":
        return

    if str(actor_org_id) != str(expected_org_id):
        await log_security_audit(
            db=db,
            actor_user_id=actor_user_id,
            action="UNAUTHORIZED_ACCESS_ATTEMPT",
            entity_type=resource_type,
            entity_id=resource_id,
            details={
                "reason": "ABAC_CROSS_TENANT_VIOLATION",
                "actor_org_id": str(actor_org_id),
                "expected_org_id": str(expected_org_id),
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-tenant access denied: resource belongs to another organization.",
        )
