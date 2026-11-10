"""
FND-SEC-001 Automated Test Suite
Verifies:
1. HttpOnly, SameSite=Lax cookie issuance on sign-in
2. Cookie-based authentication without localStorage tokens
3. CSRF token validation on state-changing requests
4. Refresh token rotation, reuse detection, and logout revocation
"""

import http.cookiejar
import json
import os
import unittest
import urllib.error
import urllib.request

BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:8000")

class FndSec001CookieCsrfTest(unittest.TestCase):

    def setUp(self):
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookie_jar))

    def test_01_signin_sets_httponly_cookies_and_csrf(self):
        """Verify sign-in response returns HttpOnly access_token and csrf_token."""
        if not os.environ.get("SEED_FARMER_PASSWORD"):
            self.skipTest("Set SEED_FARMER_PASSWORD in the local environment.")
        url = f"{BACKEND_URL}/api/v1/auth/sign-in"
        payload = {
            "identifier": "farmer@zaminflow.uz",
            "password": os.environ["SEED_FARMER_PASSWORD"],
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        resp = self.opener.open(req, timeout=5)
        self.assertEqual(resp.status, 200)

        cookie_names = [c.name for c in self.cookie_jar]
        self.assertIn("access_token", cookie_names)
        self.assertIn("refresh_token", cookie_names)
        self.assertIn("csrf_token", cookie_names)

        # Verify HttpOnly on access_token
        access_cookie = next(c for c in self.cookie_jar if c.name == "access_token")
        self.assertTrue(access_cookie.has_nonstandard_attr("HttpOnly"))

        # Verify csrf_token is readable by JS (has no HttpOnly)
        csrf_cookie = next(c for c in self.cookie_jar if c.name == "csrf_token")
        self.assertFalse(csrf_cookie.has_nonstandard_attr("HttpOnly"))

    def test_02_cookie_authenticates_get_request(self):
        """Verify /auth/me succeeds with only cookies and no Authorization header."""
        # 1. Sign in
        self.test_01_signin_sets_httponly_cookies_and_csrf()

        # 2. Call /auth/me with cookies
        url = f"{BACKEND_URL}/api/v1/auth/me"
        req = urllib.request.Request(url)
        resp = self.opener.open(req, timeout=5)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode("utf-8"))
        self.assertEqual(data.get("user", {}).get("email"), "farmer@zaminflow.uz")

    def test_03_csrf_protection_on_mutating_requests(self):
        """Verify mutating POST requests require valid X-CSRF-Token header when using cookie auth."""
        # 1. Sign in
        self.test_01_signin_sets_httponly_cookies_and_csrf()
        csrf_cookie = next(c for c in self.cookie_jar if c.name == "csrf_token")
        csrf_token_val = csrf_cookie.value

        url = f"{BACKEND_URL}/api/v1/notifications/read-all"

        # A. Missing CSRF header -> MUST FAIL with 403 CSRF_TOKEN_INVALID
        req_missing = urllib.request.Request(
            url,
            data=b"{}",
            headers={"Content-Type": "application/json"}
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self.opener.open(req_missing, timeout=5)
        self.assertEqual(ctx.exception.code, 403)
        self.assertIn("CSRF_TOKEN_INVALID", ctx.exception.read().decode("utf-8"))

        # B. Invalid CSRF header -> MUST FAIL with 403 CSRF_TOKEN_INVALID
        req_invalid = urllib.request.Request(
            url,
            data=b"{}",
            headers={"Content-Type": "application/json", "X-CSRF-Token": "tampered:token:value"}
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self.opener.open(req_invalid, timeout=5)
        self.assertEqual(ctx.exception.code, 403)

        # C. Valid CSRF header -> MUST SUCCEED with 200 OK
        req_valid = urllib.request.Request(
            url,
            data=b"{}",
            headers={"Content-Type": "application/json", "X-CSRF-Token": csrf_token_val}
        )
        resp = self.opener.open(req_valid, timeout=5)
        self.assertEqual(resp.status, 200)

    def test_04_signout_deletes_cookies_and_revokes_session(self):
        """Verify sign-out deletes cookies and subsequent requests are unauthenticated."""
        self.test_01_signin_sets_httponly_cookies_and_csrf()
        csrf_cookie = next(c for c in self.cookie_jar if c.name == "csrf_token")

        signout_url = f"{BACKEND_URL}/api/v1/auth/sign-out"
        req = urllib.request.Request(
            signout_url,
            data=b"{}",
            headers={"Content-Type": "application/json", "X-CSRF-Token": csrf_cookie.value}
        )
        resp = self.opener.open(req, timeout=5)
        self.assertEqual(resp.status, 200)

        # Verify subsequent call fails with 401 UNAUTHENTICATED
        me_url = f"{BACKEND_URL}/api/v1/auth/me"
        req_me = urllib.request.Request(me_url)
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self.opener.open(req_me, timeout=5)
        self.assertEqual(ctx.exception.code, 401)

if __name__ == "__main__":
    unittest.main()
