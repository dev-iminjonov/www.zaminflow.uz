"""Initial PostgreSQL 16 + PostGIS 3.4 Production Schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-11-06 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


DDL_SQL = """
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table (Farmers, Dairy Industries, Partner Banks, Admin)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('FARMER', 'INDUSTRY', 'BANK', 'ADMIN')),
    legal_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    kyb_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (kyb_status IN ('PENDING', 'VERIFIED', 'SUSPENDED')),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
"""


def upgrade() -> None:
    for statement in [s.strip() for s in DDL_SQL.split(";") if s.strip()]:
        op.execute(statement)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS idempotency_keys CASCADE;")
    op.execute("DROP TABLE IF EXISTS financial_ledger CASCADE;")
    op.execute("DROP TABLE IF EXISTS delivery_batches CASCADE;")
    op.execute("DROP TABLE IF EXISTS supply_contracts CASCADE;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")
    op.execute("DROP TABLE IF EXISTS organizations CASCADE;")
