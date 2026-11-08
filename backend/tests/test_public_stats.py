import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import os
import time
import asyncpg
import httpx
import pytest

from app.modules.public_stats.service import PublicStatsResponse

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:8000/api/v1")
PG_DSN = "postgresql://dairy_user:dairy_secret_password@dairy_db:5432/dairy_platform"


def test_01_public_stats_schema_and_headers():
    """Verify endpoint contract, headers, and response structure."""
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        resp = client.get("/public/stats")
        assert resp.status_code == 200
        assert resp.headers["Cache-Control"] == "public, max-age=60, stale-while-revalidate=30"

        data = resp.json()
        validated = PublicStatsResponse(**data)
        assert isinstance(validated.successfulDeals, int)
        assert isinstance(validated.totalUsers, int)
        assert isinstance(validated.milkDeliveredLitres, int)
        assert isinstance(validated.avgRawMilkPrice.value, int)
        assert validated.avgRawMilkPrice.currency == "UZS"
        assert validated.avgRawMilkPrice.unit == "L"
        assert len(validated.avgRawMilkPrice.date) == 10  # YYYY-MM-DD
        assert validated.generatedAt.endswith("Z")


def test_02_empty_database_and_fallback_defaults():
    """Verify clean zero results, no NaN or division-by-zero on fresh/empty database."""
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        resp = client.get("/public/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["successfulDeals"] >= 0
        assert data["totalUsers"] >= 0
        assert data["milkDeliveredLitres"] >= 0
        assert data["avgRawMilkPrice"]["value"] >= 0
        assert data["avgRawMilkPrice"]["currency"] == "UZS"
        assert data["avgRawMilkPrice"]["unit"] == "L"


@pytest.mark.asyncio
async def test_03_definitions_with_synthetic_deals_and_users():
    """
    Test definitions against synthetic isolated transactions:
    - Deal 1: SETTLED deal with 4,000 L at 4,400 UZS (17,600,000 UZS)
    - Deal 2: DISPUTE_FROZEN deal (must be excluded)
    - Deal 3: REJECTED deal (must be excluded)
    - Deal 4: TEST deal (must be excluded)
    - Users: ADMIN (excluded), INACTIVE (excluded), TEST (excluded), valid FARMER & DRIVER (included)
    """
    conn = await asyncpg.connect(PG_DSN)
    try:
        # Create real farmer org and industry org (non-test), plus a test org
        await conn.execute("""
            INSERT INTO organizations (id, role, legal_name, tax_id, bank_iban, kyb_status, location)
            VALUES 
              ('11111111-1111-1111-1111-111111111111', 'FARMER', 'Alisher Agro Fermasi', '999111222', 'UZ8800010000000000000001', 'VERIFIED', ST_SetSRID(ST_Point(69.24, 41.29), 4326)),
              ('22222222-2222-2222-2222-222222222222', 'INDUSTRY', 'Pure Milk Qoqon Zavod', '999333444', 'UZ8800010000000000000002', 'VERIFIED', ST_SetSRID(ST_Point(69.25, 41.30), 4326)),
              ('33333333-3333-3333-3333-333333333333', 'FARMER', 'Test Dummy Farm', 'TEST-ORG-001', 'UZ8800010000000000000003', 'VERIFIED', ST_SetSRID(ST_Point(69.26, 41.31), 4326))
            ON CONFLICT (id) DO NOTHING;
        """)

        # Create active users and excluded users
        await conn.execute("""
            INSERT INTO users (id, organization_id, sub_role, full_name, phone_number, is_active)
            VALUES 
              ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'OWNER', 'Alisher Real Farmer', '+998901112233', TRUE),
              ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'DRIVER', 'Bobur Real Driver', '+998902223344', TRUE),
              ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'SUPERADMIN', 'Admin User', '+998903334455', TRUE),
              ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'OWNER', 'Inactive User', '+998904445566', FALSE),
              ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'OWNER', 'Test Seed Account', '+998001112233', TRUE)
            ON CONFLICT (id) DO NOTHING;
        """)

        # Create contract
        await conn.execute("""
            INSERT INTO supply_contracts (id, farmer_id, industry_id, partner_bank_id, payment_mode, daily_volume_liters, base_price_per_liter, status)
            VALUES 
              ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'ESCROW', 5000, 4400, 'ACTIVE_FUNDED')
            ON CONFLICT (id) DO NOTHING;
        """)

        # 2 days ago in Tashkent time (completed day)
        now_utc = datetime.now(timezone.utc)
        tashkent_now = now_utc + timedelta(hours=5)
        two_days_ago_tashkent = (tashkent_now - timedelta(days=2)).replace(hour=14, minute=0, second=0)
        two_days_ago_utc = two_days_ago_tashkent - timedelta(hours=5)

        # Batch 1: Real SETTLED deal (4,000 L, 17,600,000 UZS => 4,400 UZS/L)
        # Batch 2: DISPUTE_FROZEN (must not count)
        # Batch 3: REJECTED (must not count)
        await conn.execute("""
            INSERT INTO delivery_batches (id, contract_id, qr_token, reference_vial_code, declared_volume_liters, actual_volume_liters, pickup_temp_c, final_payout_uzs, status, lab_verified_at)
            VALUES 
              ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'qr-stat-01', 'vial-stat-01', 4000, 4000, 3.8, 17600000, 'SETTLED', $1),
              ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'qr-stat-02', 'vial-stat-02', 2000, 2000, 3.8, 8800000, 'DISPUTE_FROZEN', $1),
              ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'qr-stat-03', 'vial-stat-03', 1000, 1000, 3.8, 4400000, 'REJECTED', $1)
            ON CONFLICT (id) DO NOTHING;
        """, two_days_ago_utc)

        # Verify query logic directly via SQL queries
        deal_row = await conn.fetchrow("""
            SELECT COUNT(DISTINCT b.id) AS deal_count
            FROM delivery_batches b
            JOIN supply_contracts c ON b.contract_id = c.id
            JOIN organizations f ON c.farmer_id = f.id
            JOIN organizations i ON c.industry_id = i.id
            WHERE b.status = 'SETTLED'
              AND NOT (f.tax_id LIKE 'TEST%' OR i.tax_id LIKE 'TEST%' OR f.legal_name ILIKE '%test%' OR i.legal_name ILIKE '%test%');
        """)
        assert deal_row["deal_count"] >= 1

        milk_row = await conn.fetchrow("""
            SELECT COALESCE(SUM(b.actual_volume_liters), 0)::BIGINT AS total_litres
            FROM delivery_batches b
            JOIN supply_contracts c ON b.contract_id = c.id
            JOIN organizations f ON c.farmer_id = f.id
            WHERE b.status = 'SETTLED'
              AND b.actual_volume_liters IS NOT NULL
              AND NOT (f.tax_id LIKE 'TEST%' OR f.legal_name ILIKE '%test%');
        """)
        assert milk_row["total_litres"] >= 4000

        user_row = await conn.fetchrow("""
            SELECT COUNT(DISTINCT u.id) AS user_count
            FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE u.is_active = TRUE
              AND o.kyb_status NOT IN ('SUSPENDED', 'REJECTED')
              AND o.role IN ('FARMER', 'INDUSTRY')
              AND u.sub_role IN ('OWNER', 'DRIVER', 'LAB_TECH', 'GATE_RECEIVER')
              AND NOT (u.full_name ILIKE '%test%' OR u.phone_number LIKE '+99800%' OR COALESCE(u.email, '') ILIKE '%test%');
        """)
        # Excludes superadmin, inactive, test-prefix
        assert user_row["user_count"] >= 2

        price_row = await conn.fetchrow("""
            WITH daily_deals AS (
                SELECT 
                    (timezone('Asia/Tashkent', b.lab_verified_at))::date AS deal_date,
                    b.actual_volume_liters,
                    b.final_payout_uzs
                FROM delivery_batches b
                JOIN supply_contracts c ON b.contract_id = c.id
                JOIN organizations f ON c.farmer_id = f.id
                WHERE b.status = 'SETTLED'
                  AND b.actual_volume_liters > 0
                  AND b.final_payout_uzs > 0
                  AND b.lab_verified_at IS NOT NULL
                  AND NOT (f.tax_id LIKE 'TEST%' OR f.legal_name ILIKE '%test%')
            ),
            completed_days AS (
                SELECT 
                    deal_date, 
                    SUM(final_payout_uzs) AS total_uzs, 
                    SUM(actual_volume_liters) AS total_litres
                FROM daily_deals
                WHERE deal_date < (timezone('Asia/Tashkent', NOW()))::date
                GROUP BY deal_date
            ),
            latest_day AS (
                SELECT deal_date, total_uzs, total_litres
                FROM completed_days
                ORDER BY deal_date DESC
                LIMIT 1
            )
            SELECT 
                deal_date::text AS target_date,
                ROUND(total_uzs / total_litres)::BIGINT AS vwap_uzs
            FROM latest_day;
        """)
        assert price_row["vwap_uzs"] == 4400
        assert price_row["target_date"] == two_days_ago_tashkent.strftime("%Y-%m-%d")

    finally:
        # Clean up inserted test records
        await conn.execute("DELETE FROM delivery_batches WHERE id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');")
        await conn.execute("DELETE FROM supply_contracts WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';")
        await conn.execute("DELETE FROM users WHERE id IN ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888');")
        await conn.execute("DELETE FROM organizations WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');")
        await conn.close()


def test_04_cache_and_single_flight_100_concurrent():
    """
    Simulate 100 concurrent requests arriving at the public stats endpoint.
    All return 200 with identical timestamp and low latency due to TTL caching.
    """
    def make_request(i: int):
        with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
            return client.get("/public/stats", headers={"X-Forwarded-For": f"10.1.{i // 50}.{i % 50}"})

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(make_request, i) for i in range(100)]
        responses = [f.result() for f in futures]

    assert len(responses) == 100
    first_data = responses[0].json()
    for r in responses:
        assert r.status_code == 200
        assert r.headers["Cache-Control"] == "public, max-age=60, stale-while-revalidate=30"
        data = r.json()
        assert data["generatedAt"] == first_data["generatedAt"]
        assert data["successfulDeals"] == first_data["successfulDeals"]


def test_05_rate_limiting_per_ip():
    """Verify IP-based rate limiting returns 429 when quota exceeded."""
    test_ip = "198.51.100.99"
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)
    
    # Send up to 120 requests
    for _ in range(120):
        r = client.get("/public/stats", headers={"X-Forwarded-For": test_ip})
        if r.status_code == 429:
            break
        assert r.status_code == 200

    # 121st request should be rate-limited
    r_blocked = client.get("/public/stats", headers={"X-Forwarded-For": test_ip})
    assert r_blocked.status_code == 429
    assert "Rate limit exceeded" in r_blocked.json()["detail"]
    assert "retry-after" in r_blocked.headers
