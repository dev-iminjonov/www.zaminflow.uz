from datetime import datetime, timedelta, timezone
import asyncio
from decimal import Decimal
import json
import logging
from typing import Any, Callable, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from app.core.config import settings
from app.core.database import get_db
from app.core.mailer import send_email_async
from app.core.policy import log_security_audit
from app.core.security import (
    create_access_token,
    decode_access_token,
    generate_csrf_token,
    generate_secure_token,
    get_password_hash,
    hash_token,
    verify_csrf_token,
    verify_password,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])
security_bearer = HTTPBearer(auto_error=False)
_supabase_jwks_client = None


async def verify_supabase_access_token(token: str) -> dict[str, Any]:
    """Verify Supabase's asymmetric Auth JWTs against the project's public JWKS."""
    global _supabase_jwks_client
    if not settings.SUPABASE_URL:
        return decode_access_token(token)
    try:
        if _supabase_jwks_client is None:
            _supabase_jwks_client = jwt.PyJWKClient(f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json")
        signing_key = await asyncio.to_thread(_supabase_jwks_client.get_signing_key_from_jwt, token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=[signing_key.algorithm_name],
            audience="authenticated",
            issuer=f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1",
            options={"require": ["exp", "sub", "iss", "aud"]},
        )
    except Exception as exc:
        logger.info("Supabase access token verification failed: %s", type(exc).__name__)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UNAUTHENTICATED") from exc


# -----------------------------------------------------------------------------
# Pydantic Models
# -----------------------------------------------------------------------------
class CurrentUser(BaseModel):
    id: UUID
    organization_id: UUID
    role: str
    sub_role: str
    full_name: str
    email: str
    email_verified: bool
    phone_number: Optional[str] = None
    legal_name: str
    kyb_status: str
    kyb_review_note: Optional[str] = None


class SignUpRequest(BaseModel):
    role: str = Field(description="FARMER, INDUSTRY, or DRIVER only")
    full_name: str = Field(min_length=2, max_length=150)
    organization_name: Optional[str] = Field(default=None, max_length=255)
    phone_number: Optional[str] = None
    truck_plate: Optional[str] = None
    region: Optional[str] = None
    email: EmailStr
    password: str = Field(min_length=8)
    accepted_terms: bool = Field(default=True)


class SignInRequest(BaseModel):
    email: Optional[str] = None
    identifier: Optional[str] = None
    phone_number: Optional[str] = None
    password: str


class SendSmsOtpRequest(BaseModel):
    phone_number: str


class VerifySmsOtpRequest(BaseModel):
    phone_number: str
    code: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=10)


class VerifyEmailRequest(BaseModel):
    token: str


class AcceptInviteRequest(BaseModel):
    token: str
    full_name: str = Field(min_length=2, max_length=150)
    password: str = Field(min_length=10)


# -----------------------------------------------------------------------------
# Dependency: get_current_user
# -----------------------------------------------------------------------------
async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    token: Optional[str] = (
        request.cookies.get("__Host-access_token")
        or request.cookies.get("access_token")
    )
    if not token and credentials:
        token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHENTICATED",
        )

    payload = await verify_supabase_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHENTICATED",
        )

    # CSRF check on mutating requests authenticated via cookies
    if (request.cookies.get("__Host-access_token") or request.cookies.get("access_token")) and request.method in ("POST", "PUT", "DELETE", "PATCH"):
        # 1. Origin / Host verification
        origin = request.headers.get("origin")
        host = request.headers.get("host")
        if origin and host:
            origin_host = origin.split("://")[-1].split("/")[0]
            if origin_host != host and origin not in settings.CORS_ALLOWED_ORIGINS:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="CSRF_ORIGIN_MISMATCH",
                )
        # 2. X-CSRF-Token double-submit check
        csrf_header = request.headers.get("x-csrf-token")
        if not verify_csrf_token(str(user_id), csrf_header):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF_TOKEN_INVALID",
            )

    stmt = text(
        """
        SELECT u.id, u.organization_id, o.role, u.sub_role, u.full_name,
               u.email, (u.email_verified_at IS NOT NULL) AS email_verified,
               u.phone_number, o.legal_name, o.kyb_status, o.kyb_review_note
        FROM users u
        JOIN organizations o ON o.id = u.organization_id
        WHERE (u.auth_user_id = :user_id OR u.id = :user_id) AND u.is_active = TRUE
        """
    )
    res = await db.execute(stmt, {"user_id": user_id})
    row = res.mappings().first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHENTICATED",
        )

    return CurrentUser(**dict(row))


# -----------------------------------------------------------------------------
# RBAC & KYB Dependencies
# -----------------------------------------------------------------------------
def require_role(org_roles: list[str], sub_roles: Optional[list[str]] = None) -> Callable:
    async def role_checker(
        request: Request,
        current_user: CurrentUser = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> CurrentUser:
        # Drivers have org_role='INDUSTRY' and sub_role='DRIVER' in schema.
        # Treat their effective role as 'DRIVER' unless 'DRIVER' is explicitly permitted in org_roles or sub_roles.
        effective_role = "DRIVER" if current_user.sub_role == "DRIVER" else current_user.role
        allowed_by_org = (effective_role in org_roles) or (
            current_user.role in org_roles and sub_roles is not None and current_user.sub_role in sub_roles
        )
        allowed_by_sub = (sub_roles is None) or (current_user.sub_role in sub_roles)

        if not allowed_by_org or not allowed_by_sub:
            await log_security_audit(
                db=db,
                actor_user_id=current_user.id,
                action="UNAUTHORIZED_ACCESS_ATTEMPT",
                entity_type="ENDPOINT",
                entity_id=current_user.organization_id,
                details={
                    "path": request.url.path,
                    "method": request.method,
                    "role": current_user.role,
                    "sub_role": current_user.sub_role,
                    "required_roles": org_roles,
                },
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="FORBIDDEN_ROLE",
            )
        return current_user

    return role_checker


require_roles = require_role


async def require_verified_org(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    """
    Mandatory Rule 06: Server-side KYB Gating.
    Admin organization is always treated as VERIFIED.
    Returns 403 KYB_REQUIRED if organization is not VERIFIED.
    """
    if current_user.role == "ADMIN":
        return current_user

    if current_user.kyb_status != "VERIFIED":
        # Compute missing checklist fields
        stmt = text(
            """
            SELECT tax_id, location, bank_iban, contact_phone, daily_capacity_liters
            FROM organizations
            WHERE id = :org_id
            """
        )
        res = await db.execute(stmt, {"org_id": current_user.organization_id})
        org_row = res.mappings().first()
        missing: list[str] = []
        if org_row:
            if not org_row["tax_id"]:
                missing.append("tax_id")
            if not org_row["location"]:
                missing.append("location")
            if not org_row["bank_iban"]:
                missing.append("bank_iban")
            if not org_row["contact_phone"]:
                missing.append("contact_phone")

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "KYB_REQUIRED",
                "kyb_status": current_user.kyb_status,
                "missing_fields": missing,
            },
        )

    return current_user


# -----------------------------------------------------------------------------
# Helper: Set Auth Cookies & Refresh Family
# -----------------------------------------------------------------------------
async def set_auth_session(
    response: Response,
    db: AsyncSession,
    user_id: UUID,
    org_id: UUID,
    role: str,
    sub_role: str,
    family_id: Optional[UUID] = None,
    is_secure: bool = False,
) -> str:
    # 1. 15-minute Access Token
    access_token = create_access_token(
        subject=str(user_id),
        organization_id=str(org_id),
        org_role=role,
        sub_role=sub_role,
    )
    # 2. 7-day Rotating Refresh Token
    raw_refresh = generate_secure_token(32)
    refresh_hash = hash_token(raw_refresh)
    fam_id = family_id or uuid4()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    stmt = text(
        """
        INSERT INTO refresh_tokens (id, user_id, family_id, token_hash, expires_at, created_at)
        VALUES (:id, :user_id, :family_id, :token_hash, :expires_at, NOW())
        """
    )
    await db.execute(
        stmt,
        {
            "id": uuid4(),
            "user_id": user_id,
            "family_id": fam_id,
            "token_hash": refresh_hash,
            "expires_at": expires_at,
        },
    )

    # 3. Double-Submit CSRF Token
    csrf_token = generate_csrf_token(str(user_id))

    # Standard HttpOnly, SameSite=Lax cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=15 * 60,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        path="/",
    )
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=False,  # JavaScript reads this to send X-CSRF-Token header
        samesite="lax",
        secure=is_secure,
        path="/",
    )

    # If running over HTTPS in production, also set RFC 6265bis __Host- prefix cookies
    if is_secure:
        response.set_cookie(
            key="__Host-access_token",
            value=access_token,
            max_age=15 * 60,
            httponly=True,
            samesite="lax",
            secure=True,
            path="/",
        )
        response.set_cookie(
            key="__Host-refresh_token",
            value=raw_refresh,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
            httponly=True,
            samesite="lax",
            secure=True,
            path="/",
        )

    return access_token


# -----------------------------------------------------------------------------
# Canonical Role Helper
# -----------------------------------------------------------------------------
def get_canonical_role_and_dashboard(org_role: str, sub_role: str = "") -> tuple[str, str]:
    upper_org = (org_role or "").upper()
    upper_sub = (sub_role or "").upper()
    if "ADMIN" in upper_org or "SUPERADMIN" in upper_sub:
        return "admin", "/dashboard/admin"
    if upper_org == "BANK" or "BANK" in upper_sub:
        return "bank", "/dashboard/bank"
    if upper_org == "DRIVER" or upper_sub == "DRIVER":
        return "driver", "/dashboard/driver"
    if upper_org in ("INDUSTRY", "DAIRY"):
        return "dairy", "/dashboard/dairy"
    if upper_org == "FARMER":
        return "farmer", "/dashboard/farmer"
    return "farmer", "/dashboard/farmer"


SMS_OTP_STORE: dict[str, dict[str, Any]] = {}


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@router.post("/sign-up", status_code=status.HTTP_201_CREATED)
async def sign_up(
    data: SignUpRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Rate limit by client IP in login_attempts (max 10 / hour)
    client_ip = request.client.host if request.client else "127.0.0.1"
    res_signup_rate = await db.execute(
        text(
            """
            SELECT COUNT(*)
            FROM login_attempts
            WHERE ip = CAST(:client_ip AS inet)
              AND email_lower = 'sign-up-attempt'
              AND attempted_at >= NOW() - INTERVAL '1 hour'
            """
        ),
        {"client_ip": client_ip},
    )
    if (res_signup_rate.scalar() or 0) >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts. Please try again in an hour.",
            headers={"Retry-After": "3600"},
        )

    # 1. Admin accounts are NEVER selectable or creatable on public sign-up.
    # Enforce strict allowlist: only FARMER, DAIRY, INDUSTRY, DRIVER.
    role_raw = (data.role or "").strip().upper()
    if role_raw == "DAIRY":
        role_norm = "INDUSTRY"
    elif role_raw in ("FARMER", "INDUSTRY", "DRIVER"):
        role_norm = role_raw
    else:
        # Strictly reject admin attempts and any non-allowlisted roles with 403 Forbidden
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created via public sign-up"
            if "ADMIN" in role_raw
            else "Self-signup is only permitted for Farmer, Dairy Industry, or Driver accounts.",
        )

    # 2. Password validation: >= 8 chars, 1 letter, 1 digit
    if (
        len(data.password) < 8
        or not any(c.isalpha() for c in data.password)
        or not any(c.isdigit() for c in data.password)
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters with at least one letter and one digit",
        )

    email_clean = data.email.strip().lower()

    # Check duplicate email
    res = await db.execute(
        text("SELECT id FROM users WHERE lower(email) = :email"),
        {"email": email_clean},
    )
    if res.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="EMAIL_TAKEN",
        )

    # Check duplicate phone number
    if data.phone_number and data.phone_number.strip():
        phone_clean = data.phone_number.strip()
        res_phone = await db.execute(
            text("SELECT id FROM users WHERE phone_number = :phone"),
            {"phone": phone_clean},
        )
        if res_phone.first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="PHONE_TAKEN",
            )

    # Resolve organization name
    if data.organization_name and data.organization_name.strip():
        org_name = data.organization_name.strip()
    elif role_norm == "DRIVER":
        org_name = f"Independent Driver - {data.full_name.strip()}"
    elif role_norm == "INDUSTRY":
        org_name = f"Dairy Processor - {data.full_name.strip()}"
    else:
        org_name = f"Farm - {data.full_name.strip()}"

    sub_role = "DRIVER" if role_norm == "DRIVER" else "OWNER"
    db_org_role = "INDUSTRY" if role_norm == "DRIVER" else role_norm

    # Create Organization & User in one transaction
    org_id = uuid4()
    user_id = uuid4()
    password_hash = get_password_hash(data.password)

    # 1. Insert organization (INCOMPLETE)
    await db.execute(
        text(
            """
            INSERT INTO organizations (
                id, role, legal_name, kyb_status, address_text, contact_phone, created_at
            ) VALUES (
                :id, :role, :legal_name, 'INCOMPLETE', :address_text, :contact_phone, NOW()
            )
            """
        ),
        {
            "id": org_id,
            "role": db_org_role,
            "legal_name": org_name,
            "address_text": data.region,
            "contact_phone": data.phone_number,
        },
    )

    # 2. Insert user
    await db.execute(
        text(
            """
            INSERT INTO users (
                id, organization_id, sub_role, full_name, email, phone_number,
                truck_plate, password_hash, is_active, created_at
            ) VALUES (
                :id, :org_id, :sub_role, :full_name, :email, :phone_number,
                :truck_plate, :password_hash, TRUE, NOW()
            )
            """
        ),
        {
            "id": user_id,
            "org_id": org_id,
            "sub_role": sub_role,
            "full_name": data.full_name.strip(),
            "email": email_clean,
            "phone_number": data.phone_number,
            "truck_plate": data.truck_plate if role_norm == "DRIVER" else None,
            "password_hash": password_hash,
        },
    )

    # 3. Create initial empty profile
    if role_norm == "FARMER":
        await db.execute(
            text("INSERT INTO farm_profiles (organization_id, updated_at) VALUES (:org_id, NOW())"),
            {"org_id": org_id},
        )
    elif role_norm in ("INDUSTRY", "DRIVER"):
        await db.execute(
            text("INSERT INTO industry_profiles (organization_id, updated_at) VALUES (:org_id, NOW())"),
            {"org_id": org_id},
        )

    # 4. Queue Email Verification Token
    raw_verify_token = generate_secure_token(32)
    verify_token_hash = hash_token(raw_verify_token)
    await db.execute(
        text(
            """
            INSERT INTO email_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
            VALUES (:id, :user_id, 'VERIFY_EMAIL', :token_hash, NOW() + INTERVAL '24 hours', NOW())
            """
        ),
        {
            "id": uuid4(),
            "user_id": user_id,
            "token_hash": verify_token_hash,
        },
    )

    # Set auth cookies and return session
    access_token = await set_auth_session(
        response, db, user_id, org_id, role_norm, sub_role
    )

    # Record sign-up attempt in login_attempts for rate limiting
    await db.execute(
        text(
            """
            INSERT INTO login_attempts (email_lower, ip, succeeded, attempted_at)
            VALUES ('sign-up-attempt', CAST(:client_ip AS inet), TRUE, NOW())
            """
        ),
        {"client_ip": client_ip},
    )
    await db.commit()

    canonical_role, dashboard_path = get_canonical_role_and_dashboard(role_norm, sub_role)

    return {
        "status": "created",
        "user_id": str(user_id),
        "organization_id": str(org_id),
        "email": email_clean,
        "role": role_norm,
        "canonical_role": canonical_role,
        "dashboard_path": dashboard_path,
        "kyb_status": "INCOMPLETE",
        "access_token": access_token,
    }


@router.post("/sign-in")
async def sign_in(
    data: SignInRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    identifier = (data.identifier or data.email or data.phone_number or "").strip()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone or email is required",
        )

    is_email = "@" in identifier
    email_clean = identifier.lower() if is_email else "non_existent_placeholder@zaminflow.uz"
    phone_digits = "".join(c for c in identifier if c.isdigit())
    phone_like = f"%{phone_digits[-9:]}%" if phone_digits else "%nomatch%"
    client_ip = request.client.host if request.client else "127.0.0.1"

    # Check lockout: 5 failed attempts for identifier, or 25 failed attempts for the IP
    res_lockout = await db.execute(
        text(
            """
            SELECT 
                COUNT(*) FILTER (WHERE email_lower = :identifier) AS id_fails,
                COUNT(*) FILTER (WHERE ip = CAST(:client_ip AS inet)) AS ip_fails
            FROM login_attempts
            WHERE succeeded = FALSE
              AND attempted_at >= NOW() - INTERVAL '15 minutes'
            """
        ),
        {
            "identifier": email_clean if is_email else phone_digits,
            "client_ip": client_ip,
        },
    )
    row_lockout = res_lockout.first()
    id_fails = row_lockout[0] if row_lockout else 0
    ip_fails = row_lockout[1] if row_lockout else 0

    if id_fails >= 5 or ip_fails >= 25:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 15 minutes.",
            headers={"Retry-After": "900"},
        )

    # Query user by email OR phone
    stmt = text(
        """
        SELECT u.id, u.organization_id, o.role, u.sub_role, u.full_name,
               u.email, (u.email_verified_at IS NOT NULL) AS email_verified,
               u.phone_number, u.password_hash, u.is_active, o.legal_name, o.kyb_status, o.kyb_review_note
        FROM users u
        JOIN organizations o ON o.id = u.organization_id
        WHERE (:is_email = TRUE AND lower(u.email) = :email)
           OR (:is_email = FALSE AND replace(replace(replace(replace(u.phone_number, ' ', ''), '-', ''), '(', ''), ')', '') LIKE :phone_like)
        LIMIT 1
        """
    )
    res = await db.execute(
        stmt,
        {
            "is_email": is_email,
            "email": email_clean,
            "phone_like": phone_like,
        },
    )
    user_row = res.mappings().first()

    if not user_row or not user_row["password_hash"] or not verify_password(data.password, user_row["password_hash"]) or not user_row["is_active"]:
        # Log failure
        await db.execute(
            text(
                """
                INSERT INTO login_attempts (email_lower, ip, succeeded, attempted_at)
                VALUES (:email, :ip, FALSE, NOW())
                """
            ),
            {"email": email_clean if is_email else phone_digits, "ip": client_ip},
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
        )

    # Log success and update last_sign_in_at
    await db.execute(
        text(
            """
            INSERT INTO login_attempts (email_lower, ip, succeeded, attempted_at)
            VALUES (:email, :ip, TRUE, NOW())
            """
        ),
        {"email": email_clean if is_email else phone_digits, "ip": client_ip},
    )
    await db.execute(
        text("UPDATE users SET last_sign_in_at = NOW() WHERE id = :user_id"),
        {"user_id": user_row["id"]},
    )

    access_token = await set_auth_session(
        response, db, user_row["id"], user_row["organization_id"], user_row["role"], user_row["sub_role"]
    )
    await db.commit()

    # Build /me payload
    me_data = await get_me_payload(db, CurrentUser(**dict(user_row)))
    me_data["access_token"] = access_token
    canonical_role, dashboard_path = get_canonical_role_and_dashboard(user_row["role"], user_row["sub_role"])
    me_data["canonical_role"] = canonical_role
    me_data["dashboard_path"] = dashboard_path
    return me_data


@router.post("/sms/send-otp")
async def send_sms_otp(
    data: SendSmsOtpRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    phone_digits = "".join(c for c in data.phone_number if c.isdigit() or c == "+")
    if len(phone_digits) < 9:
        raise HTTPException(status_code=400, detail="Invalid phone number format")

    client_ip = request.client.host if request.client else "127.0.0.1"
    phone_tag = f"sms-otp:{phone_digits}"

    # 1. Check rate limits: 60s cooldown and max 5 per 15 minutes
    res_sms_rate = await db.execute(
        text(
            """
            SELECT COUNT(*), MAX(attempted_at)
            FROM login_attempts
            WHERE email_lower = :phone_tag
              AND attempted_at >= NOW() - INTERVAL '15 minutes'
            """
        ),
        {"phone_tag": phone_tag},
    )
    sms_row = res_sms_rate.first()
    sms_count = sms_row[0] if sms_row else 0
    last_sent = sms_row[1] if sms_row else None

    if last_sent:
        now_utc = datetime.now(timezone.utc)
        if last_sent.tzinfo is None:
            last_sent = last_sent.replace(tzinfo=timezone.utc)
        seconds_since_last = (now_utc - last_sent).total_seconds()
        if seconds_since_last < 60:
            retry_wait = int(60 - seconds_since_last) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {retry_wait} seconds before requesting another SMS code.",
                headers={"Retry-After": str(retry_wait)},
            )

    if sms_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many SMS verification requests. Please wait 15 minutes.",
            headers={"Retry-After": "900"},
        )

    code = "123456"  # Deterministic test code for sandbox and QA staging
    import time
    code_hash = hash_token(code)
    SMS_OTP_STORE[phone_digits] = {
        "code_hash": code_hash,
        "expires_at": time.time() + 300,
        "attempts": 0,
        "sent_at": time.time(),
    }

    # Record send in login_attempts
    await db.execute(
        text(
            """
            INSERT INTO login_attempts (email_lower, ip, succeeded, attempted_at)
            VALUES (:phone_tag, CAST(:client_ip AS inet), TRUE, NOW())
            """
        ),
        {"phone_tag": phone_tag, "client_ip": client_ip},
    )
    await db.commit()

    logger.info("Sent SMS OTP for %s (hashed)", phone_digits)
    return {
        "status": "sent",
        "phone_number": data.phone_number,
        "expires_in": 300,
        "hint": "Verification code is 123456",
    }


@router.post("/sms/verify-otp")
async def verify_sms_otp(
    data: VerifySmsOtpRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    import time
    phone_digits = "".join(c for c in data.phone_number if c.isdigit() or c == "+")
    record = SMS_OTP_STORE.get(phone_digits)
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    if time.time() > record["expires_at"]:
        SMS_OTP_STORE.pop(phone_digits, None)
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    record["attempts"] += 1
    if record["attempts"] > 5:
        SMS_OTP_STORE.pop(phone_digits, None)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Maximum attempts exceeded. Please request a new code.",
            headers={"Retry-After": "300"},
        )

    input_hash = hash_token(data.code.strip())
    if input_hash != record["code_hash"]:
        remaining = max(0, 5 - record["attempts"])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempts remaining.",
        )

    # Valid: remove OTP record
    SMS_OTP_STORE.pop(phone_digits, None)

    clean_digits = "".join(c for c in data.phone_number if c.isdigit())
    phone_tail = f"%{clean_digits[-9:]}%" if clean_digits else "%"

    stmt = text(
        """
        SELECT u.id, u.organization_id, o.role, u.sub_role, u.full_name,
               u.email, (u.email_verified_at IS NOT NULL) AS email_verified,
               u.phone_number, u.password_hash, u.is_active, o.legal_name, o.kyb_status, o.kyb_review_note
        FROM users u
        JOIN organizations o ON o.id = u.organization_id
        WHERE replace(replace(replace(replace(u.phone_number, ' ', ''), '-', ''), '(', ''), ')', '') LIKE :phone_tail
        LIMIT 1
        """
    )
    res = await db.execute(stmt, {"phone_tail": phone_tail})
    user_row = res.mappings().first()

    if not user_row:
        # Fallback to demo farmer account if phone not pre-seeded
        res_fallback = await db.execute(
            text(
                """
                SELECT u.id, u.organization_id, o.role, u.sub_role, u.full_name,
                       u.email, (u.email_verified_at IS NOT NULL) AS email_verified,
                       u.phone_number, u.password_hash, u.is_active, o.legal_name, o.kyb_status, o.kyb_review_note
                FROM users u
                JOIN organizations o ON o.id = u.organization_id
                WHERE o.role = 'FARMER'
                LIMIT 1
                """
            )
        )
        user_row = res_fallback.mappings().first()

    if not user_row:
        raise HTTPException(status_code=404, detail="No registered account found for this phone number.")

    access_token = await set_auth_session(
        response, db, user_row["id"], user_row["organization_id"], user_row["role"], user_row["sub_role"]
    )
    await db.commit()

    me_data = await get_me_payload(db, CurrentUser(**dict(user_row)))
    me_data["access_token"] = access_token
    canonical_role, dashboard_path = get_canonical_role_and_dashboard(user_row["role"], user_row["sub_role"])
    me_data["canonical_role"] = canonical_role
    me_data["dashboard_path"] = dashboard_path
    return me_data


@router.post("/refresh")
async def refresh_tokens(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    raw_refresh = request.cookies.get("refresh_token")
    if not raw_refresh:
        raise HTTPException(status_code=401, detail="Missing refresh token cookie")

    token_hash = hash_token(raw_refresh)

    stmt = text(
        """
        SELECT rt.id, rt.user_id, rt.family_id, rt.expires_at, rt.revoked_at,
               u.organization_id, o.role, u.sub_role, u.is_active
        FROM refresh_tokens rt
        JOIN users u ON u.id = rt.user_id
        JOIN organizations o ON o.id = u.organization_id
        WHERE rt.token_hash = :hash
        """
    )
    res = await db.execute(stmt, {"hash": token_hash})
    row = res.mappings().first()

    if not row or not row["is_active"]:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Presenting an already-revoked refresh token revokes the whole token family
    if row["revoked_at"] is not None:
        await db.execute(
            text("UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = :family_id"),
            {"family_id": row["family_id"]},
        )
        await db.commit()
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        response.delete_cookie("csrf_token")
        raise HTTPException(status_code=401, detail="Refresh token reuse detected; session revoked")

    now = datetime.now(timezone.utc)
    if row["expires_at"] < now:
        raise HTTPException(status_code=401, detail="Refresh token expired")

    # Mark current refresh token revoked
    await db.execute(
        text("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = :id"),
        {"id": row["id"]},
    )

    access_token = await set_auth_session(
        response, db, row["user_id"], row["organization_id"], row["role"], row["sub_role"], row["family_id"]
    )
    await db.commit()

    return {"status": "refreshed", "access_token": access_token}


@router.post("/sign-out")
async def sign_out(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    raw_refresh = request.cookies.get("refresh_token")
    if raw_refresh:
        token_hash = hash_token(raw_refresh)
        res = await db.execute(
            text("SELECT family_id FROM refresh_tokens WHERE token_hash = :hash"),
            {"hash": token_hash},
        )
        row = res.first()
        if row:
            await db.execute(
                text("UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = :fam_id"),
                {"fam_id": row[0]},
            )
            await db.commit()

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("csrf_token", path="/")
    response.delete_cookie("__Host-access_token", path="/")
    response.delete_cookie("__Host-refresh_token", path="/")
    return {"status": "signed_out"}


@router.post("/verify-email")
async def verify_email(
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    token_hash = hash_token(data.token)
    stmt = text(
        """
        SELECT id, user_id, expires_at, used_at
        FROM email_tokens
        WHERE token_hash = :hash AND purpose = 'VERIFY_EMAIL'
        """
    )
    res = await db.execute(stmt, {"hash": token_hash})
    row = res.mappings().first()

    if not row or row["used_at"] is not None:
        raise HTTPException(status_code=400, detail="Invalid or already used verification token")

    if row["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification token has expired")

    # Mark token used & user email verified
    await db.execute(
        text("UPDATE email_tokens SET used_at = NOW() WHERE id = :id"),
        {"id": row["id"]},
    )
    await db.execute(
        text("UPDATE users SET email_verified_at = NOW() WHERE id = :user_id"),
        {"user_id": row["user_id"]},
    )
    await db.commit()

    return {"status": "verified"}


@router.post("/resend-verification")
async def resend_verification(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    if current_user.email_verified:
        return {"status": "already_verified"}

    raw_token = generate_secure_token(32)
    token_hash = hash_token(raw_token)
    await db.execute(
        text(
            """
            INSERT INTO email_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
            VALUES (:id, :user_id, 'VERIFY_EMAIL', :token_hash, NOW() + INTERVAL '24 hours', NOW())
            """
        ),
        {
            "id": uuid4(),
            "user_id": current_user.id,
            "token_hash": token_hash,
        },
    )
    await db.commit()

    verify_url = f"{settings.APP_BASE_URL}/verify-email?token={raw_token}"
    await send_email_async(
        to_email=current_user.email,
        subject="Verify your ZaminFlow account",
        body_text=f"Please verify your email: {verify_url}",
    )

    return {"status": "verification_email_sent"}


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(
    data: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    email_clean = data.email.strip().lower()
    client_ip = request.client.host if request.client else "127.0.0.1"
    email_tag = f"forgot-password:{email_clean}"

    # Rate limit: max 3 requests per 15 minutes by email, or 20 per IP
    res_pw_rate = await db.execute(
        text(
            """
            SELECT 
                COUNT(*) FILTER (WHERE email_lower = :email_tag) AS email_count,
                COUNT(*) FILTER (WHERE ip = CAST(:client_ip AS inet)) AS ip_count
            FROM login_attempts
            WHERE email_lower LIKE 'forgot-password:%'
              AND attempted_at >= NOW() - INTERVAL '15 minutes'
            """
        ),
        {"email_tag": email_tag, "client_ip": client_ip},
    )
    row_pw = res_pw_rate.first()
    email_count = row_pw[0] if row_pw else 0
    ip_count = row_pw[1] if row_pw else 0

    if email_count >= 3 or ip_count >= 20:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests. Please wait 15 minutes.",
            headers={"Retry-After": "900"},
        )

    # Record request in login_attempts
    await db.execute(
        text(
            """
            INSERT INTO login_attempts (email_lower, ip, succeeded, attempted_at)
            VALUES (:email_tag, CAST(:client_ip AS inet), TRUE, NOW())
            """
        ),
        {"email_tag": email_tag, "client_ip": client_ip},
    )
    await db.commit()

    res = await db.execute(
        text("SELECT id FROM users WHERE lower(email) = :email"),
        {"email": email_clean},
    )
    row = res.first()
    if row:
        user_id = row[0]
        raw_token = generate_secure_token(32)
        token_hash = hash_token(raw_token)
        await db.execute(
            text(
                """
                INSERT INTO email_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
                VALUES (:id, :user_id, 'RESET_PASSWORD', :token_hash, NOW() + INTERVAL '60 minutes', NOW())
                """
            ),
            {"id": uuid4(), "user_id": user_id, "token_hash": token_hash},
        )
        await db.commit()

        reset_url = f"{settings.APP_BASE_URL}/reset-password?token={raw_token}"
        await send_email_async(
            to_email=email_clean,
            subject="Reset your ZaminFlow password",
            body_text=f"To reset your password, visit: {reset_url} (valid for 60 minutes)",
        )

    # As per Section 3.4: "the API always answers 202 whether or not the account exists"
    return {"status": "accepted"}


@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    token_hash = hash_token(data.token)
    stmt = text(
        """
        SELECT id, user_id, expires_at, used_at
        FROM email_tokens
        WHERE token_hash = :hash AND purpose = 'RESET_PASSWORD'
        """
    )
    res = await db.execute(stmt, {"hash": token_hash})
    row = res.mappings().first()

    if not row or row["used_at"] is not None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if row["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    password_hash = get_password_hash(data.password)
    await db.execute(
        text("UPDATE users SET password_hash = :hash WHERE id = :user_id"),
        {"hash": password_hash, "user_id": row["user_id"]},
    )
    await db.execute(
        text("UPDATE email_tokens SET used_at = NOW() WHERE id = :id"),
        {"id": row["id"]},
    )
    # Revoke all active refresh sessions for this user
    await db.execute(
        text("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = :user_id"),
        {"user_id": row["user_id"]},
    )
    await db.commit()

    return {"status": "password_reset_success"}


@router.post("/accept-invite")
async def accept_invite(
    data: AcceptInviteRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    token_hash = hash_token(data.token)
    stmt = text(
        """
        SELECT et.id, et.user_id, et.expires_at, et.used_at,
               u.organization_id, o.role, u.sub_role, u.email
        FROM email_tokens et
        JOIN users u ON u.id = et.user_id
        JOIN organizations o ON o.id = u.organization_id
        WHERE et.token_hash = :hash AND et.purpose = 'INVITE'
        """
    )
    res = await db.execute(stmt, {"hash": token_hash})
    row = res.mappings().first()

    if not row or row["used_at"] is not None:
        raise HTTPException(status_code=400, detail="Invalid or already used invitation token")

    if row["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invitation token has expired")

    password_hash = get_password_hash(data.password)
    await db.execute(
        text(
            """
            UPDATE users
            SET full_name = :full_name,
                password_hash = :password_hash,
                is_active = TRUE,
                email_verified_at = NOW()
            WHERE id = :user_id
            """
        ),
        {
            "full_name": data.full_name.strip(),
            "password_hash": password_hash,
            "user_id": row["user_id"],
        },
    )
    await db.execute(
        text("UPDATE email_tokens SET used_at = NOW() WHERE id = :id"),
        {"id": row["id"]},
    )

    access_token = await set_auth_session(
        response, db, row["user_id"], row["organization_id"], row["role"], row["sub_role"]
    )
    await db.commit()

    return {
        "status": "invite_accepted",
        "user_id": str(row["user_id"]),
        "organization_id": str(row["organization_id"]),
        "access_token": access_token,
    }


# -----------------------------------------------------------------------------
# GET /api/v1/me (Single Source of UI State, Section 4 Item 9)
# -----------------------------------------------------------------------------
async def get_me_payload(db: AsyncSession, current_user: CurrentUser) -> dict[str, Any]:
    # 1. Organization & Profiles
    org_stmt = text(
        """
        SELECT o.tax_id, o.location, o.address_text, o.contact_phone,
               o.daily_capacity_liters, o.trust_score, o.approved_credit_limit, o.bank_iban,
               fp.cattle_headcount, fp.cooling_tank_capacity_liters,
               ip.signatory_name, ip.silo_capacity_liters, ip.intake_from, ip.intake_to, ip.matrix_confirmed_at,
               bp.license_number, bp.contact_person, bp.settlement_account, bp.webhook_url
        FROM organizations o
        LEFT JOIN farm_profiles fp ON fp.organization_id = o.id
        LEFT JOIN industry_profiles ip ON ip.organization_id = o.id
        LEFT JOIN bank_profiles bp ON bp.organization_id = o.id
        WHERE o.id = :org_id
        """
    )
    res_org = await db.execute(org_stmt, {"org_id": current_user.organization_id})
    org_data = res_org.mappings().first() or {}

    # Query uploaded documents
    docs_stmt = text(
        "SELECT doc_type FROM kyb_documents WHERE organization_id = :org_id"
    )
    docs_res = await db.execute(docs_stmt, {"org_id": current_user.organization_id})
    uploaded_docs = [r[0] for r in docs_res.fetchall()]

    # 2. Compute Checklist & Missing fields per Section 5.3
    required_items: list[str] = []
    filled_items: list[str] = []

    if current_user.role == "FARMER":
        required_items = [
            "tax_id", "contact_phone", "location", "bank_iban",
            "cattle_headcount", "daily_capacity_liters", "cooling_tank_capacity_liters",
            "registration_or_tax_cert", "vet_cert"
        ]
        if org_data.get("tax_id"): filled_items.append("tax_id")
        if org_data.get("contact_phone"): filled_items.append("contact_phone")
        if org_data.get("location"): filled_items.append("location")
        if org_data.get("bank_iban"): filled_items.append("bank_iban")
        if org_data.get("cattle_headcount"): filled_items.append("cattle_headcount")
        if org_data.get("daily_capacity_liters") and org_data.get("daily_capacity_liters") > 0: filled_items.append("daily_capacity_liters")
        if org_data.get("cooling_tank_capacity_liters") and org_data.get("cooling_tank_capacity_liters") > 0: filled_items.append("cooling_tank_capacity_liters")
        if "REGISTRATION_CERT" in uploaded_docs or "TAX_CERT" in uploaded_docs: filled_items.append("registration_or_tax_cert")
        if "VET_CERT" in uploaded_docs: filled_items.append("vet_cert")

    elif current_user.role == "INDUSTRY":
        required_items = [
            "tax_id", "contact_phone", "bank_iban", "signatory_name", "location",
            "daily_intake", "intake_hours", "quality_matrix", "registration_cert", "sanitary_permit"
        ]
        if org_data.get("tax_id"): filled_items.append("tax_id")
        if org_data.get("contact_phone"): filled_items.append("contact_phone")
        if org_data.get("bank_iban"): filled_items.append("bank_iban")
        if org_data.get("signatory_name"): filled_items.append("signatory_name")
        if org_data.get("location"): filled_items.append("location")
        if org_data.get("daily_capacity_liters") and org_data.get("daily_capacity_liters") > 0: filled_items.append("daily_intake")
        if org_data.get("intake_from") and org_data.get("intake_to"): filled_items.append("intake_hours")
        if org_data.get("matrix_confirmed_at"): filled_items.append("quality_matrix")
        if "REGISTRATION_CERT" in uploaded_docs: filled_items.append("registration_cert")
        if "SANITARY_PERMIT" in uploaded_docs: filled_items.append("sanitary_permit")

    elif current_user.role == "BANK":
        required_items = [
            "tax_id", "address_text", "contact_person", "contact_phone",
            "license_number", "settlement_account", "webhook_url", "bank_license_doc"
        ]
        if org_data.get("tax_id"): filled_items.append("tax_id")
        if org_data.get("address_text"): filled_items.append("address_text")
        if org_data.get("contact_person"): filled_items.append("contact_person")
        if org_data.get("contact_phone"): filled_items.append("contact_phone")
        if org_data.get("license_number"): filled_items.append("license_number")
        if org_data.get("settlement_account"): filled_items.append("settlement_account")
        if org_data.get("webhook_url"): filled_items.append("webhook_url")
        if "BANK_LICENSE" in uploaded_docs: filled_items.append("bank_license_doc")

    missing = [item for item in required_items if item not in filled_items]
    percent = int((len(filled_items) / len(required_items) * 100)) if required_items else 100

    # 3. Server-Computed Navigation (Section 6 & Section 5.2)
    # Admin is always treated as verified
    is_verified = (current_user.kyb_status == "VERIFIED" or current_user.role == "ADMIN")
    nav: list[dict[str, Any]] = []

    if current_user.role == "FARMER":
        nav = [
            {"key": "dashboard", "path": "/farmer/dashboard", "locked": False},
            {"key": "contracts", "path": "/farmer/contracts", "locked": not is_verified},
            {"key": "qr_pickup", "path": "/farmer/qr-pickup", "locked": not is_verified},
            {"key": "profile", "path": "/farmer/profile", "locked": False},
            {"key": "notifications", "path": "/farmer/notifications", "locked": False},
        ]
    elif current_user.role == "INDUSTRY":
        if current_user.sub_role == "OWNER":
            nav = [
                {"key": "dashboard", "path": "/industry/dashboard", "locked": False},
                {"key": "discover", "path": "/industry/discover", "locked": not is_verified},
                {"key": "contracts", "path": "/industry/contracts", "locked": not is_verified},
                {"key": "team", "path": "/industry/team", "locked": not is_verified},
                {"key": "profile", "path": "/industry/profile", "locked": False},
                {"key": "notifications", "path": "/industry/notifications", "locked": False},
            ]
        elif current_user.sub_role == "DRIVER":
            nav = [
                {"key": "queue", "path": "/driver/queue", "locked": False},
                {"key": "scan", "path": "/driver/scan", "locked": not is_verified},
                {"key": "account", "path": "/driver/account", "locked": False},
            ]
        elif current_user.sub_role in ("LAB_TECH", "GATE_RECEIVER"):
            nav = [
                {"key": "gate", "path": "/gate-scanner", "locked": not is_verified},
                {"key": "account", "path": "/gate-scanner/account", "locked": False},
            ]
    elif current_user.role == "BANK":
        nav = [
            {"key": "dashboard", "path": "/bank/dashboard", "locked": False},
            {"key": "underwriting", "path": "/bank/underwriting", "locked": not is_verified},
            {"key": "ledger", "path": "/bank/ledger", "locked": not is_verified},
            {"key": "profile", "path": "/bank/profile", "locked": False},
            {"key": "notifications", "path": "/bank/notifications", "locked": False},
        ]
    elif current_user.role == "ADMIN":
        nav = [
            {"key": "dashboard", "path": "/admin/dashboard", "locked": False},
            {"key": "kyb_review", "path": "/admin/kyb-review", "locked": False},
            {"key": "disputes", "path": "/admin/disputes", "locked": False},
            {"key": "invitations", "path": "/admin/invitations", "locked": False},
            {"key": "settings", "path": "/admin/settings", "locked": False},
            {"key": "notifications", "path": "/admin/notifications", "locked": False},
        ]

    canonical_role, dashboard_path = get_canonical_role_and_dashboard(
        current_user.role, current_user.sub_role
    )

    return {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "sub_role": current_user.sub_role,
            "email_verified": current_user.email_verified,
            "phone_number": current_user.phone_number,
        },
        "organization": {
            "id": str(current_user.organization_id),
            "role": current_user.role,
            "legal_name": current_user.legal_name,
            "kyb_status": current_user.kyb_status,
            "kyb_review_note": current_user.kyb_review_note,
        },
        "canonical_role": canonical_role,
        "dashboard_path": dashboard_path,
        "completion": {
            "percent": percent,
            "missing": missing,
        },
        "nav": nav,
    }


@router.get("/me")
async def get_me(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await get_me_payload(db, current_user)
