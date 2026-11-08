import json
import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.inquiries.schemas import InquiryCreate, InquiryResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])


@router.post(
    "",
    response_model=InquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit public Contact Us inquiry",
)
async def submit_inquiry(
    inquiry: InquiryCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> InquiryResponse:
    if not inquiry.consent:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="User consent to processing personal data is required.",
        )

    client_ip = request.client.host if request.client else "127.0.0.1"

    details_payload = {
        "full_name": inquiry.full_name.strip(),
        "contact_info": inquiry.contact_info.strip(),
        "role": inquiry.role.strip(),
        "message": inquiry.message.strip(),
        "client_ip": client_ip,
    }

    try:
        # 1. Persist to audit_logs
        await db.execute(
            text(
                """
                INSERT INTO audit_logs (action, entity_type, details, ip)
                VALUES ('CONTACT_INQUIRY', 'INQUIRY', CAST(:details AS jsonb), CAST(:ip AS inet))
                """
            ),
            {"details": json.dumps(details_payload), "ip": client_ip},
        )

        # 2. Dispatch in-app notification to all active SUPERADMIN users
        admin_rows = await db.execute(
            text("SELECT id FROM users WHERE sub_role = 'SUPERADMIN' AND is_active = TRUE")
        )
        admins = admin_rows.fetchall()

        for admin in admins:
            admin_id = admin[0]
            notif_id = uuid4()
            title = f"New Inquiry: {inquiry.full_name} ({inquiry.role})"
            body = f"Contact: {inquiry.contact_info}\n\n{inquiry.message}"
            await db.execute(
                text(
                    """
                    INSERT INTO notifications (id, user_id, type, title, body, link_path)
                    VALUES (:id, :user_id, 'INQUIRY', :title, :body, '/admin/notifications')
                    """
                ),
                {
                    "id": notif_id,
                    "user_id": admin_id,
                    "title": title,
                    "body": body,
                },
            )

        await db.commit()
        logger.info(
            "Contact inquiry submitted by %s (%s) from IP %s",
            inquiry.full_name,
            inquiry.contact_info,
            client_ip,
        )
        return InquiryResponse(
            status="received",
            message="Your message has been received. Our team will contact you shortly.",
        )
    except Exception as exc:
        await db.rollback()
        logger.exception("Failed to store public inquiry: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit inquiry. Please try again later.",
        )
