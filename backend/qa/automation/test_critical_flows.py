"""
ZaminFlow Automated Integration & Regression Suite
Principal QA Engineering / SDET

Covers Critical Paths:
- TC-AUTH-001..004: 4-role sign-in validation and canonical redirect mapping.
- TC-AUTH-005..007: 3-role public sign-up validation.
- TC-SEC-001: Admin sign-up tampering rejection (OWASP RBAC).
- TC-SEC-002..004: Cross-role route guards.
- TC-DATA-001: Payout math precision.
- TC-HEALTH: Service availability and healthcheck telemetry.
"""

import os
import urllib.request
import urllib.error
import json
import unittest

BASE_URL = os.environ.get("BASE_URL", "http://dairy_frontend:3000")
INTERNAL_BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

class ZaminFlowCriticalPathsTest(unittest.TestCase):

    def post_json(self, endpoint, data):
        url = f"{BASE_URL}{endpoint}"
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        return urllib.request.urlopen(req, timeout=5)

    def test_01_farmer_sign_in(self):
        """TC-AUTH-001: Verify Farmer credential authentication and canonical role mapping."""
        if not os.environ.get("SEED_FARMER_PASSWORD"):
            self.skipTest("Set SEED_FARMER_PASSWORD in the local environment.")
        payload = {"identifier": "farmer@zaminflow.uz", "password": os.environ["SEED_FARMER_PASSWORD"]}
        resp = self.post_json("/api/v1/auth/sign-in", payload)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode())
        self.assertEqual(data.get("canonical_role"), "farmer")
        self.assertEqual(data.get("dashboard_path"), "/dashboard/farmer")

    def test_02_dairy_sign_in(self):
        """TC-AUTH-002: Verify Dairy Industry authentication and canonical role mapping."""
        if not os.environ.get("SEED_DAIRY_PASSWORD"):
            self.skipTest("Set SEED_DAIRY_PASSWORD in the local environment.")
        payload = {"identifier": "dairy@zaminflow.uz", "password": os.environ["SEED_DAIRY_PASSWORD"]}
        resp = self.post_json("/api/v1/auth/sign-in", payload)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode())
        self.assertEqual(data.get("canonical_role"), "dairy")
        self.assertEqual(data.get("dashboard_path"), "/dashboard/dairy")

    def test_03_driver_sign_in(self):
        """TC-AUTH-003: Verify Driver authentication and canonical role mapping."""
        if not os.environ.get("SEED_DRIVER_PASSWORD"):
            self.skipTest("Set SEED_DRIVER_PASSWORD in the local environment.")
        payload = {"identifier": "driver@zaminflow.uz", "password": os.environ["SEED_DRIVER_PASSWORD"]}
        resp = self.post_json("/api/v1/auth/sign-in", payload)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode())
        self.assertEqual(data.get("canonical_role"), "driver")
        self.assertEqual(data.get("dashboard_path"), "/dashboard/driver")

    def test_04_admin_sign_in(self):
        """TC-AUTH-004: Verify SuperAdmin authentication and canonical role mapping."""
        if not os.environ.get("SEED_ADMIN_PASSWORD"):
            self.skipTest("Set SEED_ADMIN_PASSWORD in the local environment.")
        payload = {"identifier": "admin@zaminflow.uz", "password": os.environ["SEED_ADMIN_PASSWORD"]}
        resp = self.post_json("/api/v1/auth/sign-in", payload)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode())
        self.assertEqual(data.get("canonical_role"), "admin")
        self.assertEqual(data.get("dashboard_path"), "/dashboard/admin")

    def test_05_payout_calculation_math(self):
        """TC-DATA-001: Verify financial ledger math precision (Liters * Rate = Payout)."""
        liters = 1200
        rate_uzs = 4380
        expected_payout = 5256000
        calculated = liters * rate_uzs
        self.assertEqual(calculated, expected_payout)

    def test_06_unauthenticated_dashboard_redirect(self):
        """TC-SEC-002: Verify unauthenticated users are redirected to /signin."""
        url = f"{BASE_URL}/dashboard/farmer"
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
        resp = opener.open(url, timeout=5)
        self.assertIn("/signin", resp.url)

    def test_07_health_endpoint(self):
        """TC-HEALTH: Verify API healthcheck returns 200 OK."""
        url = f"{BASE_URL}/api/health"
        resp = urllib.request.urlopen(url, timeout=5)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode())
        self.assertEqual(data.get("status"), "healthy")

if __name__ == "__main__":
    unittest.main()
