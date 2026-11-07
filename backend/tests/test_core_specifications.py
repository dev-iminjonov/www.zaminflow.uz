from decimal import Decimal
import hashlib
import hmac

from fastapi import HTTPException
import pytest

from app.core.security import (
    get_password_hash,
    sign_qr_payload,
    verify_password,
    verify_qr_payload,
)
from app.modules.geo_matching.service import calculate_composite_match_score
from app.modules.qr_logistics.service import validate_batch_transition
from app.modules.smart_contracts.service import (
    calculate_dynamic_payout,
    validate_contract_transition,
)
from app.modules.trust_rating.service import (
    compute_farmer_trust_score_formula,
    compute_industry_trust_score_formula,
)


def test_worked_example_unit_test_benchmark():
    """
    SRS Section 4.2 Worked Example (Unit Test Benchmark):
    Suppose V_actual = 1,000 L, P_base = 4,000 UZS, F_actual = 4.00% (F_std = 3.60%),
    S_actual = 8.70% (S_std = 8.50%), and T_actual = 3.8°C.
    Multiplier = 1 + 0.15(4.00 - 3.60) + 0.10(8.70 - 8.50) - 0 = 1 + 0.06 + 0.02 = 1.08.
    P_final = 1,000 * 4,000 * 1.08 = 4,320,000.00 UZS.
    """
    result = calculate_dynamic_payout(
        v_actual=Decimal("1000.00"),
        p_base=Decimal("4000.00"),
        f_actual=Decimal("4.00"),
        s_actual=Decimal("8.70"),
        t_actual=Decimal("3.80"),
        f_std=Decimal("3.60"),
        s_std=Decimal("8.50"),
        alpha=Decimal("0.1500"),
        beta=Decimal("0.1000"),
        payment_mode="ESCROW",
    )
    assert result["multiplier"] == Decimal("1.0800")
    assert result["final_payout_uzs"] == Decimal("4320000.00")
    assert result["factoring_fee_uzs"] == Decimal("0.00")
    assert result["net_farmer_payout_uzs"] == Decimal("4320000.00")


def test_dynamic_payout_with_cold_chain_penalty_and_factoring():
    """Tests gamma_temp penalty between 4.0°C and 8.0°C and 1.50% Instant Bank Factoring fee."""
    result = calculate_dynamic_payout(
        v_actual=Decimal("1000.00"),
        p_base=Decimal("4000.00"),
        f_actual=Decimal("3.60"),
        s_actual=Decimal("8.50"),
        t_actual=Decimal("6.00"),  # 2 degrees above 4.0C => 0.005 * 2 = 0.01 (1% deduction)
        payment_mode="FACTORING",
        factoring_fee_pct=Decimal("0.0150"),
    )
    assert result["multiplier"] == Decimal("0.9900")
    assert result["final_payout_uzs"] == Decimal("3960000.00")
    assert result["factoring_fee_uzs"] == Decimal("59400.00")
    assert result["net_farmer_payout_uzs"] == Decimal("3900600.00")


def test_trust_score_formulas():
    farmer_score = compute_farmer_trust_score_formula(
        q_consistency=Decimal("90.00"),
        v_accuracy=Decimal("95.00"),
        d_punctuality=Decimal("88.00"),
        a_clean=Decimal("100.00"),
    )
    # 0.35*90 + 0.30*95 + 0.25*88 + 0.10*100 = 31.5 + 28.5 + 22.0 + 10.0 = 92.00
    assert farmer_score == Decimal("92.00")

    industry_score = compute_industry_trust_score_formula(
        f_payment=Decimal("100.00"),
        g_speed=Decimal("80.00"),
        l_fairness=Decimal("100.00"),
        c_retention=Decimal("90.00"),
    )
    # 0.45*100 + 0.25*80 + 0.20*100 + 0.10*90 = 45 + 20 + 20 + 9 = 94.00
    assert industry_score == Decimal("94.00")


def test_postgis_composite_match_score():
    score = calculate_composite_match_score(
        est_drive_mins=Decimal("30.0"),
        counterparty_trust_score=Decimal("80.00"),
        v_farm=Decimal("1000.00"),
        v_factory_need=Decimal("1000.00"),
    )
    # 0.40*(1 - 0.25) + 0.35*(0.80) + 0.25*(1.0) = 0.30 + 0.28 + 0.25 = 0.83 -> 83.00
    assert score == Decimal("83.00")


def test_strict_state_machines():
    validate_contract_transition("DRAFT", "AWAITING_BANK_LOCK")
    validate_contract_transition("AWAITING_BANK_LOCK", "ACTIVE_FUNDED")
    with pytest.raises(HTTPException):
        validate_contract_transition("DRAFT", "ACTIVE_FUNDED")

    validate_batch_transition("IN_TRANSIT", "AT_GATE")
    validate_batch_transition("AT_GATE", "SETTLED")
    validate_batch_transition("AT_GATE", "DISPUTE_FROZEN")
    validate_batch_transition("DISPUTE_FROZEN", "RESOLVED_SPLIT")
    with pytest.raises(HTTPException):
        validate_batch_transition("IN_TRANSIT", "SETTLED")


def test_argon2_password_and_qr_hmac():
    password = "SecurePassword123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

    qr_token = sign_qr_payload({"contract_id": "abc", "temp_c": "3.8"})
    decoded = verify_qr_payload(qr_token)
    assert decoded["temp_c"] == "3.8"
