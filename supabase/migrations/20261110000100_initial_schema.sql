CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. Organizations Table (Farmers, Dairy Industries, Partner Banks, Admin)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('FARMER', 'INDUSTRY', 'BANK', 'ADMIN')),
    legal_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    kyb_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (kyb_status IN ('PENDING', 'VERIFIED', 'SUSPENDED')),
    location extensions.GEOGRAPHY(POINT, 4326) NOT NULL,
    address_text TEXT,
    daily_capacity_liters NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    trust_score NUMERIC(5, 2) NOT NULL DEFAULT 75.00,
    approved_credit_limit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    bank_iban VARCHAR(64),
    cattle_headcount INTEGER NOT NULL DEFAULT 0,
    cooling_tank_liters NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    std_fat_pct NUMERIC(4, 2) NOT NULL DEFAULT 3.60,
    std_snf_pct NUMERIC(4, 2) NOT NULL DEFAULT 8.50,
    alpha_fat_coeff NUMERIC(5, 4) NOT NULL DEFAULT 0.1500,
    beta_snf_coeff NUMERIC(5, 4) NOT NULL DEFAULT 0.1000,
    max_temp_c NUMERIC(4, 2) NOT NULL DEFAULT 4.00,
    max_acidity_turner NUMERIC(4, 2) NOT NULL DEFAULT 18.00,
    factoring_fee_pct NUMERIC(5, 4) NOT NULL DEFAULT 0.0150,
    vet_certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_location ON organizations USING GIST (location);
CREATE INDEX idx_organizations_role_trust ON organizations (role, trust_score DESC);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sub_role VARCHAR(20) NOT NULL CHECK (sub_role IN ('OWNER', 'DRIVER', 'LAB_TECH', 'BANK_OFFICER', 'SUPERADMIN')),
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    legacy_user_id BIGINT UNIQUE,
    password_hash TEXT,
    truck_plate VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Digital Supply Contracts Table
CREATE TABLE supply_contracts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES organizations(id),
    industry_id UUID NOT NULL REFERENCES organizations(id),
    partner_bank_id UUID NOT NULL REFERENCES organizations(id),
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('ESCROW', 'FACTORING')),
    factoring_fee_pct NUMERIC(5, 4) NOT NULL DEFAULT 0.0150,
    daily_volume_liters NUMERIC(12, 2) NOT NULL CHECK (daily_volume_liters > 0),
    base_price_per_liter NUMERIC(19, 4) NOT NULL CHECK (base_price_per_liter > 0),
    std_fat_pct NUMERIC(4, 2) NOT NULL DEFAULT 3.60,
    std_snf_pct NUMERIC(4, 2) NOT NULL DEFAULT 8.50,
    alpha_fat_coeff NUMERIC(5, 4) NOT NULL DEFAULT 0.1500,
    beta_snf_coeff NUMERIC(5, 4) NOT NULL DEFAULT 0.1000,
    max_temp_c NUMERIC(4, 2) NOT NULL DEFAULT 4.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'AWAITING_BANK_LOCK', 'ACTIVE_FUNDED', 'COMPLETED')),
    farmer_signed_at TIMESTAMPTZ,
    industry_signed_at TIMESTAMPTZ,
    pickup_window_start TIME NOT NULL DEFAULT '06:00:00',
    pickup_window_end TIME NOT NULL DEFAULT '09:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supply_contracts_parties ON supply_contracts (farmer_id, industry_id, status);

-- 4. Delivery Batches Table (Two-Way QR Handshake, Cold-Chain Lab & Arbitration)
CREATE TABLE delivery_batches (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES supply_contracts(id) ON DELETE RESTRICT,
    driver_user_id UUID REFERENCES users(id),
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    reference_vial_code VARCHAR(100) UNIQUE NOT NULL,
    declared_volume_liters NUMERIC(12, 2) NOT NULL CHECK (declared_volume_liters > 0),
    pickup_temp_c NUMERIC(4, 2) NOT NULL CHECK (pickup_temp_c <= 8.00),
    pickup_lat NUMERIC(9, 6),
    pickup_lng NUMERIC(9, 6),
    pickup_signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    gate_arrived_at TIMESTAMPTZ,
    lab_verified_at TIMESTAMPTZ,
    actual_volume_liters NUMERIC(12, 2),
    actual_fat_pct NUMERIC(4, 2),
    actual_snf_pct NUMERIC(4, 2),
    actual_temp_c NUMERIC(4, 2),
    acidity_turner NUMERIC(4, 2),
    antibiotics_negative BOOLEAN,
    final_payout_uzs NUMERIC(19, 4),
    factoring_fee_uzs NUMERIC(19, 4) DEFAULT 0.0000,
    net_farmer_payout_uzs NUMERIC(19, 4),
    status VARCHAR(30) NOT NULL DEFAULT 'IN_TRANSIT' CHECK (status IN ('IN_TRANSIT', 'AT_GATE', 'SETTLED', 'DISPUTE_FROZEN', 'RESOLVED_SPLIT', 'REJECTED')),
    dispute_reason TEXT,
    arbitration_cert_url TEXT,
    arbitration_fat_pct NUMERIC(4, 2),
    arbitration_snf_pct NUMERIC(4, 2),
    arbitration_temp_c NUMERIC(4, 2),
    arbitration_dishonest_role VARCHAR(20) CHECK (arbitration_dishonest_role IN ('FARMER', 'INDUSTRY', 'NONE')),
    arbitration_resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_batches_contract ON delivery_batches (contract_id, status);

-- 5. Double-Entry Financial Ledger Table (Escrow & Instant Bank Factoring)
CREATE TABLE financial_ledger (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES supply_contracts(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES delivery_batches(id) ON DELETE RESTRICT,
    entry_type VARCHAR(30) NOT NULL CHECK (entry_type IN ('ESCROW_LOCK', 'ESCROW_RELEASE', 'FACTORING_PAYOUT', 'FACTORING_FEE', 'DISPUTE_SPLIT_PAYOUT', 'ESCROW_REFUND')),
    debit_account VARCHAR(64) NOT NULL,
    credit_account VARCHAR(64) NOT NULL,
    amount_uzs NUMERIC(19, 4) NOT NULL CHECK (amount_uzs >= 0),
    bank_reference_id VARCHAR(100),
    webhook_status VARCHAR(20) NOT NULL DEFAULT 'DELIVERED' CHECK (webhook_status IN ('PENDING', 'DELIVERED', 'FAILED_RETRY')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_ledger_contract ON financial_ledger (contract_id, entry_type);

-- 6. Idempotency Keys Table (Mandatory Rule 03 Concurrency & Replay Protection)
CREATE TABLE idempotency_keys (
    key VARCHAR(128) PRIMARY KEY,
    endpoint VARCHAR(150) NOT NULL,
    user_id UUID,
    response_status INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('VERIFY_EMAIL', 'RESET_PASSWORD', 'INVITE')),
    token_hash CHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Refresh Tokens Table (Rotating opaque with family revocation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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

-- Link application profiles to Supabase Auth identities. Existing local users can
-- be backfilled during a controlled migration; an unlinked profile gets no RLS access.
ALTER TABLE public.users
    ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (lower(email)) WHERE email IS NOT NULL;

-- Public registration can create only farmer, dairy, and driver organizations.
-- Roles are copied into app_metadata (which users cannot edit) for server routing.
CREATE OR REPLACE FUNCTION public.zf_provision_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    requested_role TEXT := upper(coalesce(NEW.raw_user_meta_data ->> 'role', ''));
    app_role TEXT;
    org_role TEXT;
    sub_role TEXT;
BEGIN
    IF requested_role NOT IN ('FARMER', 'INDUSTRY', 'DAIRY', 'DRIVER') THEN
        RAISE EXCEPTION 'Public registration role is not permitted';
    END IF;

    IF requested_role IN ('INDUSTRY', 'DAIRY') THEN
        app_role := 'INDUSTRY'; org_role := 'INDUSTRY'; sub_role := 'OWNER';
    ELSIF requested_role = 'DRIVER' THEN
        app_role := 'DRIVER'; org_role := 'INDUSTRY'; sub_role := 'DRIVER';
    ELSE
        app_role := 'FARMER'; org_role := 'FARMER'; sub_role := 'OWNER';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER zf_auth_user_provision
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.zf_provision_auth_user();

CREATE OR REPLACE FUNCTION public.zf_create_app_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    requested_role TEXT := upper(coalesce(NEW.raw_user_meta_data ->> 'role', ''));
    app_role TEXT;
    org_role TEXT;
    sub_role TEXT;
    org_id UUID := extensions.uuid_generate_v4();
    full_name TEXT := left(coalesce(nullif(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(NEW.email, NEW.phone, 'user'), '@', 1)), 150);
    org_name TEXT;
BEGIN
    IF requested_role IN ('INDUSTRY', 'DAIRY') THEN
        app_role := 'INDUSTRY'; org_role := 'INDUSTRY'; sub_role := 'OWNER';
    ELSIF requested_role = 'DRIVER' THEN
        app_role := 'DRIVER'; org_role := 'INDUSTRY'; sub_role := 'DRIVER';
    ELSE
        app_role := 'FARMER'; org_role := 'FARMER'; sub_role := 'OWNER';
    END IF;

    org_name := left(coalesce(nullif(trim(NEW.raw_user_meta_data ->> 'organization_name'), ''), full_name), 255);

    INSERT INTO public.organizations (id, role, legal_name, kyb_status, address_text, contact_phone)
    VALUES (org_id, org_role, org_name, 'INCOMPLETE', NEW.raw_user_meta_data ->> 'region', NEW.raw_user_meta_data ->> 'phone_number');

    INSERT INTO public.users (organization_id, auth_user_id, sub_role, full_name, email, email_verified_at, phone_number, truck_plate, is_active)
    VALUES (org_id, NEW.id, sub_role, full_name, lower(NEW.email), NEW.email_confirmed_at, nullif(trim(NEW.raw_user_meta_data ->> 'phone_number'), ''), NEW.raw_user_meta_data ->> 'truck_plate', TRUE);

    IF org_role = 'FARMER' THEN
        INSERT INTO public.farm_profiles (organization_id, updated_at) VALUES (org_id, NOW());
    ELSE
        INSERT INTO public.industry_profiles (organization_id, updated_at) VALUES (org_id, NOW());
    END IF;

    UPDATE auth.users
    SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('org_role', app_role, 'sub_role', sub_role, 'organization_id', org_id)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER zf_auth_profile_create
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.zf_create_app_profile();

CREATE OR REPLACE FUNCTION public.zf_sync_auth_email_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at THEN
        UPDATE public.users SET email_verified_at = NEW.email_confirmed_at WHERE auth_user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER zf_auth_email_confirmation
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.zf_sync_auth_email_confirmation();

-- Identity helpers are SECURITY DEFINER so RLS checks can read the protected
-- membership rows without exposing them to other tenants.
CREATE OR REPLACE FUNCTION public.zf_current_app_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT u.id
    FROM public.users AS u
    WHERE u.auth_user_id = (SELECT auth.uid())
      AND u.is_active = TRUE
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.zf_current_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT u.organization_id
    FROM public.users AS u
    WHERE u.auth_user_id = (SELECT auth.uid())
      AND u.is_active = TRUE
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.zf_is_platform_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users AS u
        JOIN public.organizations AS o ON o.id = u.organization_id
        WHERE u.auth_user_id = (SELECT auth.uid())
          AND u.is_active = TRUE
          AND u.sub_role = 'SUPERADMIN'
          AND o.role = 'ADMIN'
    )
$$;

REVOKE ALL ON FUNCTION public.zf_current_app_user_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.zf_current_org_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.zf_is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.zf_current_app_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.zf_current_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.zf_is_platform_admin() TO authenticated;

-- Default deny for every application table. The API server uses a separate,
-- server-only database credential and must continue enforcing ABAC checks.
REVOKE ALL ON TABLE
    public.organizations,
    public.users,
    public.supply_contracts,
    public.delivery_batches,
    public.financial_ledger,
    public.idempotency_keys,
    public.farm_profiles,
    public.industry_profiles,
    public.bank_profiles,
    public.kyb_documents,
    public.email_tokens,
    public.refresh_tokens,
    public.login_attempts,
    public.notifications,
    public.audit_logs
FROM anon, authenticated;

GRANT SELECT ON TABLE
    public.organizations,
    public.supply_contracts,
    public.financial_ledger,
    public.farm_profiles,
    public.industry_profiles,
    public.bank_profiles,
    public.kyb_documents,
    public.notifications
TO authenticated;
-- QR tokens are bearer credentials and are deliberately excluded from client reads.
GRANT SELECT (
    id,
    contract_id,
    driver_user_id,
    reference_vial_code,
    declared_volume_liters,
    pickup_temp_c,
    pickup_lat,
    pickup_lng,
    pickup_signed_at,
    gate_arrived_at,
    lab_verified_at,
    actual_volume_liters,
    actual_fat_pct,
    actual_snf_pct,
    actual_temp_c,
    acidity_turner,
    antibiotics_negative,
    final_payout_uzs,
    factoring_fee_uzs,
    net_farmer_payout_uzs,
    status,
    dispute_reason,
    arbitration_cert_url,
    arbitration_fat_pct,
    arbitration_snf_pct,
    arbitration_temp_c,
    arbitration_dishonest_role,
    arbitration_resolved_at,
    created_at
) ON public.delivery_batches TO authenticated;
-- Do not expose password hashes, email addresses, or the auth linkage key to
-- browser clients. Email is available from the authenticated Supabase session.
GRANT SELECT (
    id,
    organization_id,
    sub_role,
    full_name,
    phone_number,
    truck_plate,
    is_active,
    created_at
) ON public.users TO authenticated;
GRANT UPDATE (full_name, phone_number, truck_plate) ON public.users TO authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_read_tenant
    ON public.organizations FOR SELECT TO authenticated
    USING (id = (SELECT public.zf_current_org_id()) OR (SELECT public.zf_is_platform_admin()));

CREATE POLICY users_read_tenant
    ON public.users FOR SELECT TO authenticated
    USING (
        auth_user_id = (SELECT auth.uid())
        OR organization_id = (SELECT public.zf_current_org_id())
        OR (SELECT public.zf_is_platform_admin())
    );
CREATE POLICY users_update_self
    ON public.users FOR UPDATE TO authenticated
    USING (auth_user_id = (SELECT auth.uid()))
    WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE POLICY supply_contracts_read_parties
    ON public.supply_contracts FOR SELECT TO authenticated
    USING (
        farmer_id = (SELECT public.zf_current_org_id())
        OR industry_id = (SELECT public.zf_current_org_id())
        OR partner_bank_id = (SELECT public.zf_current_org_id())
        OR (SELECT public.zf_is_platform_admin())
    );

CREATE POLICY delivery_batches_read_parties
    ON public.delivery_batches FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.supply_contracts AS c
            WHERE c.id = delivery_batches.contract_id
              AND (
                  c.farmer_id = (SELECT public.zf_current_org_id())
                  OR c.industry_id = (SELECT public.zf_current_org_id())
                  OR c.partner_bank_id = (SELECT public.zf_current_org_id())
                  OR (SELECT public.zf_is_platform_admin())
              )
        )
    );

CREATE POLICY financial_ledger_read_parties
    ON public.financial_ledger FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.supply_contracts AS c
            WHERE c.id = financial_ledger.contract_id
              AND (
                  c.farmer_id = (SELECT public.zf_current_org_id())
                  OR c.industry_id = (SELECT public.zf_current_org_id())
                  OR c.partner_bank_id = (SELECT public.zf_current_org_id())
                  OR (SELECT public.zf_is_platform_admin())
              )
        )
    );

CREATE POLICY farm_profiles_read_tenant
    ON public.farm_profiles FOR SELECT TO authenticated
    USING (
        organization_id = (SELECT public.zf_current_org_id())
        OR (SELECT public.zf_is_platform_admin())
    );
CREATE POLICY industry_profiles_read_tenant
    ON public.industry_profiles FOR SELECT TO authenticated
    USING (
        organization_id = (SELECT public.zf_current_org_id())
        OR (SELECT public.zf_is_platform_admin())
    );
CREATE POLICY bank_profiles_read_tenant
    ON public.bank_profiles FOR SELECT TO authenticated
    USING (
        organization_id = (SELECT public.zf_current_org_id())
        OR (SELECT public.zf_is_platform_admin())
    );
CREATE POLICY kyb_documents_read_tenant
    ON public.kyb_documents FOR SELECT TO authenticated
    USING (
        organization_id = (SELECT public.zf_current_org_id())
        OR (SELECT public.zf_is_platform_admin())
    );

-- Auth tokens, login-attempt telemetry and audit records are backend-only.
-- No anon/authenticated policy is created for these tables (default deny).
CREATE POLICY notifications_read_self
    ON public.notifications FOR SELECT TO authenticated
    USING (user_id = (SELECT public.zf_current_app_user_id()));
CREATE POLICY notifications_mark_read_self
    ON public.notifications FOR UPDATE TO authenticated
    USING (user_id = (SELECT public.zf_current_app_user_id()))
    WITH CHECK (user_id = (SELECT public.zf_current_app_user_id()));

-- KYB uploads are private and partitioned by organization UUID in object paths.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kyb-documents',
    'kyb-documents',
    FALSE,
    5242880,
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE ON storage.objects TO authenticated;

CREATE POLICY kyb_documents_select_org_objects
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'kyb-documents'
        AND (
            (storage.foldername(name))[1] = (SELECT public.zf_current_org_id())::text
            OR (SELECT public.zf_is_platform_admin())
        )
    );
CREATE POLICY kyb_documents_insert_org_objects
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'kyb-documents'
        AND (storage.foldername(name))[1] = (SELECT public.zf_current_org_id())::text
    );
CREATE POLICY kyb_documents_update_org_objects
    ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'kyb-documents'
        AND (
            (storage.foldername(name))[1] = (SELECT public.zf_current_org_id())::text
            OR (SELECT public.zf_is_platform_admin())
        )
    )
    WITH CHECK (
        bucket_id = 'kyb-documents'
        AND (
            (storage.foldername(name))[1] = (SELECT public.zf_current_org_id())::text
            OR (SELECT public.zf_is_platform_admin())
        )
    );
