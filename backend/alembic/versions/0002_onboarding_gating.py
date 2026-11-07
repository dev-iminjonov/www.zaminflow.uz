"""v3.0 Role-Gated Onboarding & KYB Schema Migration

Revision ID: 0002_onboarding_gating
Revises: 0001_initial_schema
Create Date: 2026-11-07 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = "0002_onboarding_gating"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


DDL_SQL = """
-- 1. Alter organizations table for v3.0 onboarding & KYB state
ALTER TABLE organizations ALTER COLUMN tax_id DROP NOT NULL;
ALTER TABLE organizations ALTER COLUMN location DROP NOT NULL;

-- Drop previous check constraint if present and alter kyb_status default
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_kyb_status_check;
ALTER TABLE organizations ALTER COLUMN kyb_status SET DEFAULT 'INCOMPLETE';
UPDATE organizations SET kyb_status = 'INCOMPLETE' WHERE kyb_status = 'PENDING';
ALTER TABLE organizations ADD CONSTRAINT organizations_kyb_status_check 
    CHECK (kyb_status IN ('INCOMPLETE', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'SUSPENDED'));

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS kyb_submitted_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS kyb_reviewed_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS kyb_reviewed_by UUID;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS kyb_review_note TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(30);

ALTER TABLE organizations ADD CONSTRAINT chk_verified_complete CHECK (
    role IN ('ADMIN', 'BANK') OR kyb_status <> 'VERIFIED'
    OR (location IS NOT NULL AND tax_id IS NOT NULL AND bank_iban IS NOT NULL)
);

-- 2. Alter users table: drop legacy_user_id, add email, nullable phone, sub_role GATE_RECEIVER
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Drop legacy_user_id column completely
ALTER TABLE users DROP COLUMN IF EXISTS legacy_user_id;

-- Drop old sub_role check and add updated check with GATE_RECEIVER
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_sub_role_check;
ALTER TABLE users ADD CONSTRAINT users_sub_role_check 
    CHECK (sub_role IN ('OWNER', 'DRIVER', 'LAB_TECH', 'GATE_RECEIVER', 'BANK_OFFICER', 'SUPERADMIN'));

-- Unique index on lower(email)
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (lower(email));

-- Add foreign key from organizations.kyb_reviewed_by to users(id)
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS fk_org_reviewer;
ALTER TABLE organizations ADD CONSTRAINT fk_org_reviewer 
    FOREIGN KEY (kyb_reviewed_by) REFERENCES users(id);

-- 3. Role Profiles (1:1 with organizations)
CREATE TABLE IF NOT EXISTS farm_profiles (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    cattle_headcount INTEGER CHECK (cattle_headcount > 0),
    cooling_tank_capacity_liters NUMERIC(12, 2) CHECK (cooling_tank_capacity_liters > 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS industry_profiles (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    signatory_name VARCHAR(150),
    silo_capacity_liters NUMERIC(12, 2) CHECK (silo_capacity_liters > 0),
    intake_from TIME,
    intake_to TIME,
    std_fat_pct NUMERIC(4, 2) NOT NULL DEFAULT 3.60,
    std_snf_pct NUMERIC(4, 2) NOT NULL DEFAULT 8.50,
    alpha_fat_coeff NUMERIC(5, 4) NOT NULL DEFAULT 0.1500,
    beta_snf_coeff NUMERIC(5, 4) NOT NULL DEFAULT 0.1000,
    max_temp_optimal_c NUMERIC(4, 2) NOT NULL DEFAULT 4.00,
    max_temp_reject_c NUMERIC(4, 2) NOT NULL DEFAULT 8.00,
    max_acidity_turner NUMERIC(4, 1) NOT NULL DEFAULT 18.0,
    matrix_confirmed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_profiles (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    license_number VARCHAR(80),
    contact_person VARCHAR(150),
    settlement_account VARCHAR(64),
    default_factoring_fee_pct NUMERIC(5, 4) NOT NULL DEFAULT 0.0150,
    max_tenor_days INTEGER NOT NULL DEFAULT 30 CHECK (max_tenor_days > 0),
    webhook_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. KYB Documents Table
CREATE TABLE IF NOT EXISTS kyb_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    doc_type VARCHAR(30) NOT NULL CHECK (doc_type IN (
        'REGISTRATION_CERT', 'TAX_CERT', 'VET_CERT', 'SANITARY_PERMIT', 'BANK_LICENSE'
    )),
    storage_path TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(80) NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes <= 5242880),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, doc_type)
);

-- 5. Email Tokens Table (Single-use SHA-256 for verification, reset, invites)
CREATE TABLE IF NOT EXISTS email_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('VERIFY_EMAIL', 'RESET_PASSWORD', 'INVITE')),
    token_hash CHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Refresh Tokens Table (Rotating opaque with family revocation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL,
    token_hash CHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Login Attempts Table (Brute-force lockout protection without Redis)
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    email_lower VARCHAR(255) NOT NULL,
    ip INET,
    succeeded BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts (email_lower, attempted_at DESC);

-- 8. Notifications Table (In-App notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    link_path TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);

-- 9. Audit Logs Table (Immutable audit trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(60) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    entity_id UUID,
    details JSONB NOT NULL DEFAULT '{}',
    ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


def upgrade() -> None:
    conn = op.get_bind()
    # Split multiple statements to prevent asyncpg "cannot insert multiple commands into a prepared statement"
    for statement in DDL_SQL.split(";"):
        stmt_clean = statement.strip()
        if stmt_clean:
            conn.execute(sa_text(stmt_clean))


def downgrade() -> None:
    pass


from sqlalchemy import text as sa_text
