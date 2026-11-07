from decimal import Decimal, ROUND_HALF_EVEN
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, get_db
from app.modules.auth_rbac.service import CurrentUser, get_current_user
from app.modules.profiles_kyb.service import update_organization_trust_score


def compute_farmer_trust_score_formula(
    q_consistency: Decimal,
    v_accuracy: Decimal,
    d_punctuality: Decimal,
    a_clean: Decimal,
) -> Decimal:
    """
    R_farmer = 0.35*(Q_consistency) + 0.30*(V_accuracy) + 0.25*(D_punctuality) + 0.10*(A_clean)
    """
    score = (
        Decimal("0.35") * q_consistency
        + Decimal("0.30") * v_accuracy
        + Decimal("0.25") * d_punctuality
        + Decimal("0.10") * a_clean
    )
    return max(
        Decimal("0.00"),
        min(
            Decimal("100.00"),
            score.quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN),
        ),
    )


def compute_industry_trust_score_formula(
    f_payment: Decimal,
    g_speed: Decimal,
    l_fairness: Decimal,
    c_retention: Decimal,
) -> Decimal:
    """
    R_industry = 0.45*(F_payment) + 0.25*(G_speed) + 0.20*(L_fairness) + 0.10*(C_retention)
    """
    score = (
        Decimal("0.45") * f_payment
        + Decimal("0.25") * g_speed
        + Decimal("0.20") * l_fairness
        + Decimal("0.10") * c_retention
    )
    return max(
        Decimal("0.00"),
        min(
            Decimal("100.00"),
            score.quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN),
        ),
    )


async def recalculate_farmer_trust_score(
    db: AsyncSession, farmer_id: UUID
) -> dict[str, Decimal]:
    stmt = text(
        """
        SELECT b.declared_volume_liters, b.actual_volume_liters,
               b.actual_fat_pct, b.actual_temp_c, b.pickup_signed_at,
               b.status, b.arbitration_dishonest_role,
               c.std_fat_pct, c.pickup_window_start, c.pickup_window_end
        FROM delivery_batches b
        JOIN supply_contracts c ON c.id = b.contract_id
        WHERE c.farmer_id = :farmer_id
          AND b.status IN ('SETTLED', 'RESOLVED_SPLIT', 'REJECTED')
          AND b.created_at >= NOW() - INTERVAL '90 days'
        """
    )
    res = await db.execute(stmt, {"farmer_id": str(farmer_id)})
    rows = res.mappings().all()
    if not rows:
        baseline = Decimal("75.00")
        await update_organization_trust_score(db, farmer_id, baseline)
        return {
            "overall_score": baseline,
            "q_consistency": baseline,
            "v_accuracy": baseline,
            "d_punctuality": baseline,
            "a_clean": baseline,
        }

    total = Decimal(str(len(rows)))
    consistent_count = Decimal("0")
    vol_acc_sum = Decimal("0.00")
    punctual_count = Decimal("0")
    clean_count = Decimal("0")

    for r in rows:
        f_act = Decimal(str(r["actual_fat_pct"] or "0"))
        f_std = Decimal(str(r["std_fat_pct"] or "3.60"))
        t_act = Decimal(str(r["actual_temp_c"] or "4.00"))
        if f_act >= f_std and t_act <= Decimal("4.00"):
            consistent_count += Decimal("1")

        v_decl = Decimal(str(r["declared_volume_liters"] or "1"))
        v_act = Decimal(str(r["actual_volume_liters"] or v_decl))
        acc = max(
            Decimal("0.00"),
            (Decimal("1.00") - abs(v_decl - v_act) / v_decl)
            * Decimal("100.00"),
        )
        vol_acc_sum += acc

        signed_dt = r["pickup_signed_at"]
        if signed_dt:
            signed_time = signed_dt.timetz().replace(tzinfo=None)
            w_start = r["pickup_window_start"]
            w_end = r["pickup_window_end"]
            if w_start <= signed_time <= w_end:
                punctual_count += Decimal("1")
            else:
                punctual_count += Decimal("1")
        else:
            punctual_count += Decimal("1")

        if (
            r["status"] != "REJECTED"
            and r["arbitration_dishonest_role"] != "FARMER"
        ):
            clean_count += Decimal("1")

    q_consistency = (consistent_count / total * Decimal("100.00")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_EVEN
    )
    v_accuracy = (vol_acc_sum / total).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_EVEN
    )
    d_punctuality = (punctual_count / total * Decimal("100.00")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_EVEN
    )
    a_clean = (clean_count / total * Decimal("100.00")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_EVEN
    )

    overall = compute_farmer_trust_score_formula(
        q_consistency, v_accuracy, d_punctuality, a_clean
    )
    await update_organization_trust_score(db, farmer_id, overall)
    return {
        "overall_score": overall,
        "q_consistency": q_consistency,
        "v_accuracy": v_accuracy,
        "d_punctuality": d_punctuality,
        "a_clean": a_clean,
    }


async def recalculate_industry_trust_score(
    db: AsyncSession, industry_id: UUID
) -> dict[str, Decimal]:
    stmt = text(
        """
        SELECT b.gate_arrived_at, b.lab_verified_at,
               b.arbitration_dishonest_role
        FROM delivery_batches b
        JOIN supply_contracts c ON c.id = b.contract_id
        WHERE c.industry_id = :industry_id
          AND b.status IN ('SETTLED', 'RESOLVED_SPLIT', 'REJECTED')
          AND b.created_at >= NOW() - INTERVAL '90 days'
        """
    )
    res = await db.execute(stmt, {"industry_id": str(industry_id)})
    rows = res.mappings().all()
    if not rows:
        baseline = Decimal("75.00")
        await update_organization_trust_score(db, industry_id, baseline)
        return {
            "overall_score": baseline,
            "f_payment": Decimal("100.00"),
            "g_speed": baseline,
            "l_fairness": Decimal("100.00"),
            "c_retention": Decimal("100.00"),
        }

    f_payment = Decimal("100.00")
    speed_scores = []
    overturned_count = Decimal("0")

    for r in rows:
        if r["gate_arrived_at"] and r["lab_verified_at"]:
            diff_mins = Decimal(
                str(
                    (
                        r["lab_verified_at"] - r["gate_arrived_at"]
                    ).total_seconds()
                    / 60.0
                )
            )
            if diff_mins <= Decimal("30.0"):
                speed_scores.append(Decimal("100.00"))
            elif diff_mins >= Decimal("120.0"):
                speed_scores.append(Decimal("0.00"))
            else:
                s = (
                    (Decimal("120.0") - diff_mins)
                    / Decimal("90.0")
                    * Decimal("100.0")
                )
                speed_scores.append(s)
        else:
            speed_scores.append(Decimal("100.00"))

        if r["arbitration_dishonest_role"] == "INDUSTRY":
            overturned_count += Decimal("1")

    g_speed = (
        sum(speed_scores) / Decimal(str(len(speed_scores)))
    ).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)
    l_fairness = max(
        Decimal("0.00"),
        Decimal("100.00") - overturned_count * Decimal("20.00"),
    )
    c_retention = Decimal("100.00")

    overall = compute_industry_trust_score_formula(
        f_payment, g_speed, l_fairness, c_retention
    )
    await update_organization_trust_score(db, industry_id, overall)
    return {
        "overall_score": overall,
        "f_payment": f_payment,
        "g_speed": g_speed,
        "l_fairness": l_fairness,
        "c_retention": c_retention,
    }


async def background_recalculate_trust_scores(
    farmer_id: UUID, industry_id: UUID
) -> None:
    async with AsyncSessionLocal() as db:
        await recalculate_farmer_trust_score(db, farmer_id)
        await recalculate_industry_trust_score(db, industry_id)
        await db.commit()


router = APIRouter(prefix="/trust", tags=["Trust Score Engine"])


@router.get("/my-scorecard")
async def get_my_trust_scorecard_endpoint(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    if current_user.role == "FARMER":
        metrics = await recalculate_farmer_trust_score(
            db, current_user.organization_id
        )
    else:
        metrics = await recalculate_industry_trust_score(
            db, current_user.organization_id
        )
    await db.commit()
    return metrics
