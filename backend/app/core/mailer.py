from email.message import EmailMessage
import logging
from typing import Optional

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email_async(to_email: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
    """
    Sends email via SMTP if configured, or logs to console mailer in development.
    Never raises an uncaught exception to caller.
    """
    if not settings.SMTP_HOST:
        logger.info(
            "\n========== [CONSOLE MAILER] ==========\nTo: %s\nSubject: %s\nBody:\n%s\n======================================\n",
            to_email,
            subject,
            body_text,
        )
        return True

    try:
        message = EmailMessage()
        message["From"] = settings.SMTP_FROM
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body_text)
        if body_html:
            message.add_alternative(body_html, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER or None,
            password=settings.SMTP_PASSWORD or None,
            start_tls=True,
        )
        logger.info("Sent email to %s: %s", to_email, subject)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)
        return False
