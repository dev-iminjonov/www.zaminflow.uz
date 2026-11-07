"""
QA-001 Dual-Path Verification Test
Tests both Next.js Proxy (port 3000) and Backend/Caddy (port 8000)
"""

import json
import os
import time
import unittest
import urllib.error
import urllib.request

PROXY_URL = os.environ.get("PROXY_URL", "http://dairy_frontend:3000")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:8000")

class QA001DualPathTest(unittest.TestCase):

    def _test_rejected_roles_on_url(self, base_url: str):
        disallowed = ["ADMIN", "admin", "  ADMIN  ", "SUPERADMIN", "superadmin", "BANK", "bank", "operator", "root", ""]
        for role in disallowed:
            url = f"{base_url}/api/v1/auth/sign-up"
            payload = {
                "role": role,
                "full_name": "Test User",
                "email": f"hacker_{int(time.time()*1000)}@evil.uz",
                "password": "Password123!",
                "accepted_terms": True,
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                urllib.request.urlopen(req, timeout=5)

            self.assertEqual(ctx.exception.code, 403, f"Expected 403 for role '{role}' at {base_url}, got {ctx.exception.code}")

    def test_qa_001_next_proxy_rejects_admin(self):
        """Test proxy path (port 3000) rejects disallowed roles with 403."""
        self._test_rejected_roles_on_url(PROXY_URL)

    def test_qa_001_backend_direct_rejects_admin(self):
        """Test direct backend path (port 8000) rejects disallowed roles with 403."""
        self._test_rejected_roles_on_url(BACKEND_URL)

    def _test_valid_role_on_url(self, base_url: str, role_input: str, expected_role: str, expected_dash: str):
        t_now = int(time.time() * 1000)
        url = f"{base_url}/api/v1/auth/sign-up"
        payload = {
            "role": role_input,
            "full_name": f"Valid {expected_role}",
            "email": f"val_{expected_role}_{t_now}@zaminflow.uz",
            "phone_number": f"+998 91 {t_now % 10000000:07d}",
            "password": "Password123!",
            "accepted_terms": True,
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        resp = urllib.request.urlopen(req, timeout=5)
        self.assertEqual(resp.status, 201)
        data = json.loads(resp.read().decode("utf-8"))
        self.assertEqual(data.get("canonical_role"), expected_role)
        self.assertEqual(data.get("dashboard_path"), expected_dash)

    def test_qa_001_valid_roles_on_both_paths(self):
        """Test legitimate signups on both paths."""
        self._test_valid_role_on_url(PROXY_URL, "farmer", "farmer", "/dashboard/farmer")
        self._test_valid_role_on_url(BACKEND_URL, "  DAIRY  ", "dairy", "/dashboard/dairy")
        self._test_valid_role_on_url(PROXY_URL, "Driver", "driver", "/dashboard/driver")

if __name__ == "__main__":
    unittest.main()
