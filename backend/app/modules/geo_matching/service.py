from decimal import Decimal, ROUND_HALF_EVEN
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth_rbac.service import CurrentUser, require_roles

MATCHMAKING_SQL = """
WITH source_org AS (
    SELECT id, role, location, daily_capacity_liters
    FROM organizations WHERE id = :org_id
),
candidates AS (
    SELECT
        o.id,
        o.legal_name,
        o.trust_score,
        o.daily_capacity_liters,
        ST_Y(o.location::geometry) AS lat,
        ST_X(o.location::geometry) AS lng,
        o.std_fat_pct,
        o.std_snf_pct,
        ROUND(((ST_DistanceSphere(s.location::geometry, o.location::geometry) / 1000.0) * 1.30)::numeric, 2) AS road_km,
        ROUND((((ST_DistanceSphere(s.location::geometry, o.location::geometry) / 1000.0) * 1.30) / 50.0 * 60.0)::numeric, 1) AS est_drive_mins,
        s.daily_capacity_liters AS source_vol
    FROM organizations o
    CROSS JOIN source_org s
    WHERE o.role = :target_role
      AND o.kyb_status = 'VERIFIED'
      AND ST_DWithin(s.location, o.location, 95000) -- 95km spherical pre-filter
)
SELECT *,
    ROUND((
        0.40 * (1.0 - (est_drive_mins / 120.0)) +
        0.35 * (trust_score / 100.0) +
        0.25 * (1.0 - ABS(source_vol - daily_capacity_liters) / GREATEST(source_vol, daily_capacity_liters, 1))
    ) * 100.0, 2) AS match_score
FROM candidates
WHERE est_drive_mins <= :max_drive_mins
ORDER BY match_score DESC
LIMIT 20;
"""


def calculate_composite_match_score(
    est_drive_mins: Decimal,
    counterparty_trust_score: Decimal,
    v_farm: Decimal,
    v_factory_need: Decimal,
) -> Decimal:
    """Pure Decimal calculation of M_i,j matching Section 4.4 of the SRS."""
    drive_term = Decimal("0.40") * (
        Decimal("1.0") - (est_drive_mins / Decimal("120.0"))
    )
    trust_term = Decimal("0.35") * (counterparty_trust_score / Decimal("100.0"))
    denom = max(v_farm, v_factory_need, Decimal("1.0"))
    vol_term = Decimal("0.25") * (
        Decimal("1.0") - (abs(v_farm - v_factory_need) / denom)
    )
    score = (drive_term + trust_term + vol_term) * Decimal("100.0")
    return score.quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)


async def get_matchmaking_recommendations(
    db: AsyncSession,
    org_id: UUID,
    org_role: str,
    max_drive_mins: Decimal = Decimal("120.0"),
    min_daily_liters: Decimal = Decimal("0.0"),
    min_trust_score: Decimal = Decimal("0.0"),
) -> list[dict[str, Any]]:
    target_role = "INDUSTRY" if org_role == "FARMER" else "FARMER"
    capped_drive_mins = min(max_drive_mins, Decimal("120.0"))

    res = await db.execute(
        text(MATCHMAKING_SQL),
        {
            "org_id": str(org_id),
            "target_role": target_role,
            "max_drive_mins": capped_drive_mins,
        },
    )
    candidates = []
    for row in res.mappings().all():
        d = dict(row)
        vol = Decimal(str(d["daily_capacity_liters"]))
        trust = Decimal(str(d["trust_score"]))
        if vol < min_daily_liters or trust < min_trust_score:
            continue
        road_km = Decimal(str(d["road_km"]))
        d["estimated_transport_cost_per_liter_uzs"] = (
            road_km * Decimal("3.50")
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)
        d["recommended_base_price_uzs"] = Decimal("4500.00")
        d["on_time_payer_score"] = trust
        candidates.append(d)
    return candidates


router = APIRouter(prefix="/matching", tags=["Geospatial Matchmaking"])


@router.get("/recommendations")
async def get_recommendations_endpoint(
    max_drive_mins: Decimal = Query(default=Decimal("120.0"), le=Decimal("120.0")),
    min_daily_liters: Decimal = Query(default=Decimal("0.0")),
    min_trust_score: Decimal = Query(default=Decimal("0.0")),
    current_user: CurrentUser = Depends(require_roles(["FARMER", "INDUSTRY"])),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    return await get_matchmaking_recommendations(
        db=db,
        org_id=current_user.organization_id,
        org_role=current_user.role,
        max_drive_mins=max_drive_mins,
        min_daily_liters=min_daily_liters,
        min_trust_score=min_trust_score,
    )
