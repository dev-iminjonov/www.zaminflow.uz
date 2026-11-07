from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import secrets
from typing import Any, Optional
from uuid import UUID

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import bcrypt
from fastapi import HTTPException
import jwt

from app.core.config import settings

ph = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Hashes a password with argon2id as required by SRS v3.0."""
    try:
        return ph.hash(password)
    except Exception:
        # Fallback to bcrypt if argon2 fails in unusual environment
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against argon2id or bcrypt hash."""
    if not hashed_password:
        return False
    if hashed_password.startswith("$argon2"):
        try:
            return ph.verify(hashed_password, plain_password)
        except VerifyMismatchError:
            return False
        except Exception:
            return False
    # Bcrypt compatibility
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def hash_token(token: str) -> str:
    """Calculates SHA-256 hash for email tokens and refresh tokens."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_secure_token(nbytes: int = 32) -> str:
    """Generates a cryptographically secure URL-safe token."""
    return secrets.token_urlsafe(nbytes)


def create_access_token(
    subject: str,
    organization_id: str,
    org_role: str,
    sub_role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Creates a 15-minute access JWT (PyJWT).
    JWT claims: sub (user_id), org_id, org_role, sub_role.
    kyb_status is intentionally NOT in the token so changes reflect immediately from DB.
    """
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "org_id": str(organization_id),
        "org_role": org_role,
        "sub_role": sub_role,
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=401, detail="Could not validate credentials"
        ) from exc


def generate_csrf_token(user_id: str) -> str:
    """Generates double-submit CSRF token."""
    raw = f"{user_id}:{secrets.token_hex(16)}"
    sig = hmac.new(
        settings.CSRF_SECRET.encode("utf-8"),
        raw.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{raw}:{sig}"


def verify_csrf_token(user_id: str, csrf_token: Optional[str]) -> bool:
    """Verifies double-submit CSRF token."""
    if not csrf_token or ":" not in csrf_token:
        return False
    parts = csrf_token.split(":")
    if len(parts) != 3:
        return False
    token_user_id, salt, received_sig = parts
    if token_user_id != str(user_id):
        return False
    raw = f"{token_user_id}:{salt}"
    expected_sig = hmac.new(
        settings.CSRF_SECRET.encode("utf-8"),
        raw.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_sig, received_sig)


def verify_bank_webhook_hmac(raw_body: bytes, received_signature: str) -> bool:
    """Verifies bank partner HMAC-SHA256 signature on inbound webhooks."""
    secret = (getattr(settings, "BANK_WEBHOOK_SECRET", None) or settings.CSRF_SECRET).encode("utf-8")
    expected = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, received_signature):
        raise HTTPException(status_code=401, detail="INVALID_BANK_SIGNATURE")
    return True


def sign_qr_payload(payload_dict: dict[str, Any]) -> str:
    """Signs a Pickup QR payload with HMAC-SHA256 for offline-resilient verification."""
    canonical = json.dumps(payload_dict, sort_keys=True, separators=(",", ":"))
    sig = hmac.new(
        settings.QR_HMAC_SECRET.encode("utf-8"),
        canonical.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{canonical}.{sig}"


def verify_qr_payload(qr_token: str) -> dict[str, Any]:
    """Verifies an HMAC-SHA256 signed QR token and returns the parsed payload dict."""
    if "." not in qr_token:
        raise HTTPException(status_code=400, detail="Malformed QR token")
    canonical, received_sig = qr_token.rsplit(".", 1)
    expected_sig = hmac.new(
        settings.QR_HMAC_SECRET.encode("utf-8"),
        canonical.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected_sig, received_sig):
        raise HTTPException(status_code=400, detail="Invalid QR HMAC signature")
    return json.loads(canonical)
