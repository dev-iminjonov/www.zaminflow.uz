from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth_rbac.service import CurrentUser, get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    body: str
    link_path: Optional[str] = None
    read_at: Optional[datetime] = None
    created_at: datetime


async def notify(
    db: AsyncSession,
    user_id: UUID,
    notif_type: str,
    title: str,
    body: str,
    link_path: Optional[str] = None,
) -> UUID:
    """Inserts an in-app notification row and returns its UUID."""
    notif_id = uuid4()
    stmt = text(
        """
        INSERT INTO notifications (id, user_id, type, title, body, link_path, created_at)
        VALUES (:id, :user_id, :type, :title, :body, :link_path, NOW())
        """
    )
    await db.execute(
        stmt,
        {
            "id": notif_id,
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "body": body,
            "link_path": link_path,
        },
    )
    return notif_id


# We need a dependency to get current user; we import get_current_user dynamically or from auth_rbac
@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    limit: int = 50,
    offset: int = 0,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    # Query notifications scoped to current user
    stmt = text(
        """
        SELECT id, user_id, type, title, body, link_path, read_at, created_at
        FROM notifications
        WHERE user_id = :user_id
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
        """
    )
    res = await db.execute(stmt, {"user_id": current_user.id, "limit": limit, "offset": offset})
    rows = res.mappings().all()
    return [NotificationResponse(**dict(r)) for r in rows]


@router.get("/unread-count")
async def get_unread_count(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    stmt = text(
        """
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = :user_id AND read_at IS NULL
        """
    )
    res = await db.execute(stmt, {"user_id": current_user.id})
    count = res.scalar() or 0
    return {"unread_count": count}


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    stmt = text(
        """
        UPDATE notifications
        SET read_at = NOW()
        WHERE id = :id AND user_id = :user_id AND read_at IS NULL
        """
    )
    res = await db.execute(stmt, {"id": notification_id, "user_id": current_user.id})
    await db.commit()
    return {"status": "ok"}


@router.post("/read-all")
async def mark_all_read(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    stmt = text(
        """
        UPDATE notifications
        SET read_at = NOW()
        WHERE user_id = :user_id AND read_at IS NULL
        """
    )
    await db.execute(stmt, {"user_id": current_user.id})
    await db.commit()
    return {"status": "ok"}
