import asyncio
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import logging
import os
import time
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/public", tags=["Public Stats"])

# In-memory IP rate limiter: 120 requests per minute
_ip_rate_limits: Dict[str, list[float]] = {}
_IP_RATE_LIMIT_WINDOW = 60.0
_IP_MAX_REQUESTS = 120


class AvgRawMilkPrice(BaseModel):
    value: int = Field(..., description="Volume-weighted average raw milk price in UZS")
    currency: str = Field(default="UZS", description="Currency ISO code")
    unit: str = Field(default="L", description="Unit of measurement")
    date: str = Field(..., description="Date of the volume-weighted average (YYYY-MM-DD)")


class PublicStatsResponse(BaseModel):
    successfulDeals: int = Field(..., description="Count of settled delivery deals")
    totalUsers: int = Field(..., description="Count of active platform users across public roles")
    milkDeliveredLitres: int = Field(..., description="Total confirmed delivered milk litres")
    avgRawMilkPrice: AvgRawMilkPrice
    generatedAt: str = Field(..., description="ISO-8601 UTC timestamp of computation")


class PublicStatsService:
    def __init__(self, ttl_seconds: int = 60):
        self.ttl_seconds = ttl_seconds
        self._lock = asyncio.Lock()
        self._cached_data: Optional[Dict[str, Any]] = None
        self._cached_at: float = 0.0
        self.computation_count: int = 0

    def is_cache_valid(self) -> bool:
        if self._cached_data is None:
            return False
        return (time.time() - self._cached_at) < self.ttl_seconds

    def cache_age_seconds(self) -> float:
        if self._cached_at == 0.0:
            return float("inf")
        return time.time() - self._cached_at

    async def compute_stats_from_db(self, db: AsyncSession) -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        # 1. Statement timeout safeguard (3000ms)
        await db.execute(text("SET LOCAL statement_timeout = '3000';"))

        # 2. Definition 1: Successful Deals (SETTLED only, non-test)
        deals_query = text("""
            SELECT COUNT(DISTINCT b.id) AS deal_count
            FROM delivery_batches b
            JOIN supply_contracts c ON b.contract_id = c.id
            JOIN organizations f ON c.farmer_id = f.id
            JOIN organizations i ON c.industry_id = i.id
            WHERE b.status = 'SETTLED'
              AND NOT (
                  f.tax_id LIKE 'TEST%' OR i.tax_id LIKE 'TEST%' 
                  OR f.legal_name ILIKE '%test%' OR i.legal_name ILIKE '%test%'
              );
        """)
        deals_res = await db.execute(deals_query)
        successful_deals = int(deals_res.scalar_one_or_none() or 0)

        # 3. Definition 2: Platform Users (Active, non-test, non-suspended, non-seed)
        users_query = text("""
            SELECT COUNT(DISTINCT u.id) AS user_count
            FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE u.is_active = TRUE
              AND o.kyb_status NOT IN ('SUSPENDED', 'REJECTED')
              AND COALESCE(u.email, '') NOT IN ('farmer@zaminflow.uz', 'dairy@zaminflow.uz', 'driver@zaminflow.uz', 'admin@zaminflow.uz', 'bank@zaminflow.uz')
              AND NOT (
                  COALESCE(u.full_name, '') ILIKE '%test%' 
                  OR COALESCE(u.phone_number, '') LIKE '+99800%' 
                  OR COALESCE(u.email, '') ILIKE '%test%'
                  OR COALESCE(u.email, '') ILIKE 'val_%'
                  OR COALESCE(u.email, '') ILIKE 'verified_%'
                  OR COALESCE(u.email, '') ILIKE 'legit_%'
              );
        """)
        users_res = await db.execute(users_query)
        total_users = int(users_res.scalar_one_or_none() or 0)

        # 4. Definition 3: Milk Traded & Delivered (Actual delivered litres in settled deals)
        milk_query = text("""
            SELECT COALESCE(SUM(b.actual_volume_liters), 0) AS total_litres
            FROM delivery_batches b
            JOIN supply_contracts c ON b.contract_id = c.id
            JOIN organizations f ON c.farmer_id = f.id
            WHERE b.status = 'SETTLED'
              AND b.actual_volume_liters IS NOT NULL
              AND NOT (f.tax_id LIKE 'TEST%' OR f.legal_name ILIKE '%test%');
        """)
        milk_res = await db.execute(milk_query)
        milk_raw = milk_res.scalar_one_or_none() or 0
        milk_delivered_litres = int(Decimal(str(milk_raw)).quantize(Decimal("1")))

        # 5. Definition 4: Daily Average Raw Milk Price (Volume-weighted average in Tashkent timezone)
        price_query = text("""
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
        price_res = await db.execute(price_query)
        price_row = price_res.first()

        now_utc = datetime.now(timezone.utc)
        
        # Tashkent calendar yesterday as standard fallback date
        tashkent_now = now_utc + timedelta(hours=5)
        fallback_date = (tashkent_now - timedelta(days=1)).strftime("%Y-%m-%d")

        if price_row and price_row[0] and price_row[1] is not None:
            price_date = str(price_row[0])
            price_val = int(price_row[1])
        else:
            # When no historical completed deals exist yet, price is 0 (frontend displays dash placeholder)
            price_date = fallback_date
            price_val = 0

        elapsed = time.perf_counter() - start_time
        logger.info("Public stats computed from database in %.4fs", elapsed)

        return {
            "successfulDeals": successful_deals,
            "totalUsers": total_users,
            "milkDeliveredLitres": milk_delivered_litres,
            "avgRawMilkPrice": {
                "value": price_val,
                "currency": "UZS",
                "unit": "L",
                "date": price_date,
            },
            "generatedAt": now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }

    async def get_stats(self) -> Dict[str, Any]:
        # Fast path: Serve from cache without lock if still within TTL
        if self.is_cache_valid() and self._cached_data is not None:
            return self._cached_data

        # Single-flight lock: only one coroutine computes when cache expires
        async with self._lock:
            # Double check within lock
            if self.is_cache_valid() and self._cached_data is not None:
                return self._cached_data

            try:
                async with AsyncSessionLocal() as session:
                    fresh_data = await self.compute_stats_from_db(session)
                    self._cached_data = fresh_data
                    self._cached_at = time.time()
                    self.computation_count += 1
                    return fresh_data
            except Exception as exc:
                logger.error("Failed to compute fresh public stats: %s", exc)
                # If cached data is available, check age
                if self._cached_data is not None:
                    age = self.cache_age_seconds()
                    if age > 300:
                        logger.warning("Public stats snapshot older than 5 minutes (age=%.1fs)", age)
                    return self._cached_data
                raise


public_stats_service = PublicStatsService(ttl_seconds=60)


def check_ip_rate_limit(request: Request) -> None:
    client_ip = (
        request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or request.headers.get("X-Real-IP")
        or (request.client.host if request.client else "127.0.0.1")
    )
    now = time.time()
    
    timestamps = _ip_rate_limits.setdefault(client_ip, [])
    # Keep only requests within the active window
    valid_timestamps = [t for t in timestamps if now - t < _IP_RATE_LIMIT_WINDOW]
    
    if len(valid_timestamps) >= _IP_MAX_REQUESTS:
        _ip_rate_limits[client_ip] = valid_timestamps
        retry_after = int(_IP_RATE_LIMIT_WINDOW - (now - valid_timestamps[0])) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Please retry in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )
    
    valid_timestamps.append(now)
    _ip_rate_limits[client_ip] = valid_timestamps


@router.get(
    "/stats",
    response_model=PublicStatsResponse,
    summary="Get live aggregated platform statistics",
    description="Returns public aggregated numbers refreshed at most once per 60 seconds with single-flight locking.",
)
async def get_public_stats(
    request: Request,
    response: Response,
    _rate_check: None = Depends(check_ip_rate_limit),
) -> PublicStatsResponse:
    stats = await public_stats_service.get_stats()
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=30"
    return PublicStatsResponse(**stats)
