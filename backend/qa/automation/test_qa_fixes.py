"""
Automated Verification Suite for QA Defects QA-001 through QA-008
ZaminFlow Full-Stack Engineering
"""

import os
import re
import json
import urllib.request
import urllib.error
import unittest

BASE_URL = os.environ.get("BASE_URL", "http://dairy_frontend:3000")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:8000")

class ZaminFlowQAFixesTest(unittest.TestCase):

    def test_qa_001_public_signup_rejects_admin_variants(self):
        """QA-001: Verify public sign-up rejects ADMIN variants with HTTP 403 Forbidden."""
        disallowed_roles = ["ADMIN", "admin", "  ADMIN  ", "SUPERADMIN", "OPERATOR", "root"]
        for role in disallowed_roles:
            url = f"{BASE_URL}/api/v1/auth/sign-up"
            payload = {
                "role": role,
                "full_name": f"Hacker {role.strip()}",
                "email": f"hacker_{role.strip().lower()}@evil.uz",
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
            
            self.assertEqual(ctx.exception.code, 403, f"Expected 403 Forbidden for role '{role}', got {ctx.exception.code}")
            error_body = ctx.exception.read().decode("utf-8")
            self.assertTrue(
                "Admin accounts cannot be created via public sign-up" in error_body
                or "Self-signup is only permitted" in error_body,
                f"Unexpected error body: {error_body}"
            )

    def test_qa_001_public_signup_accepts_valid_farmer(self):
        """QA-001: Verify public sign-up accepts legitimate Farmer and returns HTTP 201 Created."""
        import time
        t_now = int(time.time() * 1000)
        email = f"verified_farmer_{t_now}@zaminflow.uz"
        phone = f"+998 90 {t_now % 10000000:07d}"
        url = f"{BASE_URL}/api/v1/auth/sign-up"
        payload = {
            "role": "FARMER",
            "full_name": "Agro Producer",
            "email": email,
            "phone_number": phone,
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
        self.assertEqual(data.get("canonical_role"), "farmer")
        self.assertEqual(data.get("dashboard_path"), "/dashboard/farmer")

    def test_qa_006_security_headers_and_no_powered_by(self):
        """QA-006: Verify OWASP security headers (X-Frame-Options, X-Content-Type-Options, etc.) and removal of X-Powered-By."""
        req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=5)
        headers = dict(resp.headers)
        
        # 1. X-Frame-Options
        self.assertEqual(headers.get("x-frame-options") or headers.get("X-Frame-Options"), "DENY")
        
        # 2. X-Content-Type-Options
        self.assertEqual(headers.get("x-content-type-options") or headers.get("X-Content-Type-Options"), "nosniff")
        
        # 3. Referrer-Policy
        self.assertEqual(headers.get("referrer-policy") or headers.get("Referrer-Policy"), "strict-origin-when-cross-origin")
        
        # 4. Content-Security-Policy-Report-Only
        csp = headers.get("content-security-policy-report-only") or headers.get("Content-Security-Policy-Report-Only")
        self.assertIsNotNone(csp, "Missing Content-Security-Policy-Report-Only header")
        
        # 5. X-Powered-By must be absent
        powered_by = headers.get("x-powered-by") or headers.get("X-Powered-By")
        self.assertIsNone(powered_by, f"X-Powered-By was disclosed: {powered_by}")

    def test_qa_003_single_h1_on_landing_page(self):
        """QA-003: Verify strictly one <h1> element exists on the root landing page."""
        req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=5).read().decode("utf-8")
        h1_matches = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.DOTALL | re.IGNORECASE)
        self.assertEqual(len(h1_matches), 1, f"Expected exactly 1 <h1>, found {len(h1_matches)}: {h1_matches}")
        
        # Verify Live Statistics section uses an <h2>
        self.assertTrue(re.search(r"<h2[^>]*>.*?(?:Real deals|Haqiqiy bitimlar|Live statistics).*?</h2>", html, re.DOTALL | re.IGNORECASE))

    def test_qa_004_contrast_brand_token_usage(self):
        """QA-004: Verify #087a3c accessible brand green is present in HTML markup for text labels."""
        req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=5).read().decode("utf-8")
        self.assertIn("#087a3c", html, "Accessible brand token #087a3c not found in rendered landing page markup")

    def test_qa_005_touch_target_size_and_attributes(self):
        """QA-005: Verify 44x44px touch target classes and rel=noopener on team social links."""
        req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=5).read().decode("utf-8")
        self.assertIn("min-w-[44px]", html)
        self.assertIn("min-h-[44px]", html)
        self.assertIn('rel="noopener noreferrer"', html)

    def test_qa_008_scroll_spy_navigation_attributes(self):
        """QA-008: Verify landing page navigation implements dynamic scroll spy anchors."""
        req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=5).read().decode("utf-8")
        self.assertIn('href="#company"', html)
        self.assertIn('href="#team"', html)
        self.assertIn('href="#stats"', html)
        self.assertIn('href="#contact"', html)
        self.assertIn('id="contact"', html)

if __name__ == "__main__":
    unittest.main()
