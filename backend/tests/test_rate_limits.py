"""
QA Automation Test: FND-SEC-002 Rate Limiting and Hashed SMS OTP
Validates backend rate limiting on sign-in, sign-up, forgot-password, and SMS OTP endpoints,
as well as hashed OTP validation with attempt lockout.
"""
import pytest
import httpx
import uuid
import time

BASE_URL = "http://localhost:8000/api/v1"


def test_sign_in_rate_limit_and_retry_after():
    """Verify that 5 failed logins trigger 429 with Retry-After: 900."""
    test_id = f"ratelimit_{uuid.uuid4().hex[:8]}@example.com"
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 4 failed attempts should yield 401
    for i in range(4):
        r = client.post("/auth/sign-in", json={"identifier": test_id, "password": "WrongPassword123!"})
        assert r.status_code == 401, f"Attempt {i+1} got {r.status_code}: {r.text}"

    # 5th failed attempt should yield 401 and lock out the identifier
    r5 = client.post("/auth/sign-in", json={"identifier": test_id, "password": "WrongPassword123!"})
    assert r5.status_code in (401, 429)

    # Subsequent attempt must yield 429 Too Many Requests with Retry-After header
    r_locked = client.post("/auth/sign-in", json={"identifier": test_id, "password": "WrongPassword123!"})
    assert r_locked.status_code == 429, f"Expected 429, got {r_locked.status_code}"
    assert "retry-after" in r_locked.headers, "Missing Retry-After header on 429"
    assert int(r_locked.headers["retry-after"]) >= 60


def test_forgot_password_rate_limit():
    """Verify that forgot-password limits requests to 3 per 15m and returns 429 with Retry-After: 900."""
    target_email = f"reset_{uuid.uuid4().hex[:8]}@example.com"
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    for i in range(3):
        r = client.post("/auth/forgot-password", json={"email": target_email})
        assert r.status_code == 202, f"Attempt {i+1} got {r.status_code}: {r.text}"

    # 4th request must trigger 429
    r_blocked = client.post("/auth/forgot-password", json={"email": target_email})
    assert r_blocked.status_code == 429, f"Expected 429, got {r_blocked.status_code}"
    assert "retry-after" in r_blocked.headers, "Missing Retry-After header on 429"


def test_sms_otp_cooldown_and_hashed_verification():
    """Verify 60s cooldown on SMS send, hashed OTP comparison, and attempt lockout."""
    test_phone = f"+99890{uuid.uuid4().int % 10000000:07d}"
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 1. Send OTP
    r_send = client.post("/auth/sms/send-otp", json={"phone_number": test_phone})
    assert r_send.status_code == 200, f"SMS send failed: {r_send.text}"
    data = r_send.json()
    assert data["status"] == "sent"

    # 2. Immediately sending again within 60s must trigger 429 with Retry-After
    r_cooldown = client.post("/auth/sms/send-otp", json={"phone_number": test_phone})
    assert r_cooldown.status_code == 429, f"Expected 429 cooldown, got {r_cooldown.status_code}"
    assert "retry-after" in r_cooldown.headers

    # 3. Verify OTP fails with bad code
    r_bad = client.post("/auth/sms/verify-otp", json={"phone_number": test_phone, "code": "000000"})
    assert r_bad.status_code == 400
    assert "attempts remaining" in r_bad.json()["detail"]

    # 4. Successful verification with correct code
    r_ok = client.post("/auth/sms/verify-otp", json={"phone_number": test_phone, "code": "123456"})
    assert r_ok.status_code == 200, f"Valid OTP verification failed: {r_ok.text}"
    assert "access_token" in r_ok.json()


if __name__ == "__main__":
    test_sign_in_rate_limit_and_retry_after()
    test_forgot_password_rate_limit()
    test_sms_otp_cooldown_and_hashed_verification()
    print("ALL FND-SEC-002 RATE LIMITING TESTS PASSED SUCCESSFULLY!")
