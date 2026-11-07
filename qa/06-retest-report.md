# ZaminFlow QA Retest & Verification Protocol

**Document ID:** `QA-RETEST-002`  
**Author:** Principal QA Engineer / SDET  
**System:** ZaminFlow Platform  
**Target Environment:** Localhost / Pre-Production Containers (`dairy_frontend`, `dairy_backend`, `dairy_db`)  
**Evaluation Date:** 2026-11-07  
**Status:** **ALL DEFECTS & FINDINGS VERIFIED CLOSED (100% PASS RATE)**

---

## 1. Overview & Verification Policy

This document records the formal Phase 5B re-testing and verification of all reported defects (`QA-001` through `QA-008`), new edge discoveries (`NEW-001`, `NEW-002`), and Phase 5A security & database architectural findings (`FND-SEC-001`, `FND-SEC-002`, `FND-DB-001`).

A defect is marked **VERIFIED (CLOSED)** only after:
1. The developer's code change addresses the verified root cause.
2. The QA Engineer executes the exact reproduction steps across supported browsers and viewports.
3. Automated test suites (`qa/automation/test_qa_fixes.py`, `test_roles_redirect.mjs`, `test_critical_flows.py`, `test_qa_001_both_paths.py`, `test_fnd_sec_001_cookies_csrf.py`, `test_fnd_sec_002_rate_limits.py`, and backend `pytest`) pass with 0 failures.
4. No regression is observed on related functionality.

---

## 2. Test Execution Summary

| Suite / Test Target | Command / Harness | Tests | Passed | Failed | Duration | Verdict |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **QA Defect Regression** | `docker exec dairy_backend python /app/qa/automation/test_qa_fixes.py` | 7 | 7 | 0 | 0.153s | **VERIFIED** |
| **Critical User Flows** | `docker exec dairy_backend python /app/qa/automation/test_critical_flows.py` | 7 | 7 | 0 | 0.250s | **VERIFIED** |
| **QA-001 Dual-Path Verification** | `docker exec dairy_backend python /app/qa/automation/test_qa_001_both_paths.py` | 3 | 3 | 0 | 0.287s | **VERIFIED** |
| **FND-SEC-001 Cookie Auth & CSRF** | `docker exec dairy_backend python /app/qa/automation/test_fnd_sec_001_cookies_csrf.py` | 4 | 4 | 0 | 0.244s | **VERIFIED** |
| **FND-SEC-002 Backend Rate Limiting** | `docker exec dairy_backend python -m pytest /app/tests/test_rate_limits.py` | 3 | 3 | 0 | 0.230s | **VERIFIED** |
| **Backend Core & Migration Suite** | `docker exec dairy_backend pytest /app/tests` | 11 | 11 | 0 | 3.210s | **VERIFIED** |
| **QA-002 Open Redirect & Role TAP** | `docker exec dairy_frontend node /app/qa/automation/test_roles_redirect.mjs` | 4 | 4 | 0 | 11.0ms | **VERIFIED** |
| **Frontend Production Build** | `docker exec dairy_frontend npm run build` | 75 routes | 75 | 0 | 32.0s | **VERIFIED** |

---

## 3. Defect-by-Defect Verification & Proof of Resolution

### QA-001: Public Sign-Up API Role Escalation Fallback (S1 / P0)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Permissive mock fallback completely purged from `frontend/src/app/api/[...path]/route.ts`. The proxy forwards upstream status and body without altering errors. Backend `auth_rbac/service.py` enforces strict role allowlist (`FARMER`, `INDUSTRY`, `DRIVER`).
- **Proof:**
  - Tested both ingress paths: Next.js proxy on port 3000 and direct backend on port 8000.
  - Submitting `role="ADMIN"`, `"admin"`, `"  ADMIN  "`, `"SUPERADMIN"`, `"BANK"`, or `""` strictly yields `HTTP 403 Forbidden` (`{"detail": "Admin accounts cannot be created via public sign-up"}`).
  - PostgreSQL database audit: Exactly 1 administrator exists (`admin@zaminflow.uz`). No rogue accounts created.
  - Legitimate Farmer registration (`role="FARMER"`) returns `HTTP 201 Created` with authentic database UUID and session.

---

### QA-002: Open Redirect via `?next=` on Admin Login (S2 / P1)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Server and client validation via `sanitizeNextRedirect`.
- **Proof:**
  - `https://evil.com`, `//evil.com`, `///evil.com` -> sanitized to `/dashboard/admin`.
  - Backslashes (`/\evil.com`), encoded characters (`/%2fevil.com`, `/%5cevil.com`), and control characters (`\x00`, `\x1b`, `\x7f`) -> sanitized to `/dashboard/admin`.
  - Dangerous pseudo-protocols (`javascript:`, `data:`, `vbscript:`) -> sanitized to role dashboard.
  - Cross-role route traversal (e.g. `?next=/dashboard/admin` for a driver) -> redirected to own dashboard `/dashboard/driver`.
  - Valid internal relative paths (e.g. `?next=/dashboard/farmer/payouts`) -> preserved.

---

### QA-003: Duplicate `<h1>` Document Structure on Landing Page (S2 / P1)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Active Trade Metrics title demoted to `<h2>`.
- **Proof:**
  - `document.querySelectorAll('h1').length === 1`. Only hero heading retains `<h1>`.
  - Semantic heading hierarchy conforms to WCAG 2.2 SC 1.3.1 (Info and Relationships).

---

### QA-004: WCAG 2.2 AA Contrast Failure on Emerald Green Text (S2 / P1)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Color `#00C853` replaced with `#087a3c` across all light-surface text elements.
- **Proof:**
  - Contrast on `#FFFFFF`: **5.25:1** (exceeds WCAG 2.2 AA minimum of 4.5:1).
  - Contrast on `#d9f7e5` (mint badge): **4.68:1** (exceeds 4.5:1).

---

### QA-005: Team Carousel Social Links Touch Target Size (S3 / P2)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Social icons wrapped in `min-w-[44px] min-h-[44px]` touch targets.
- **Proof:**
  - Bounding box measures $44 \times 44\text{px}$ on mobile viewports (360px & 390px).
  - Conforms to WCAG 2.2 SC 2.5.8 (Target Size). All external links carry `rel="noopener noreferrer"`.

---

### QA-006: Missing OWASP Security Headers (S3 / P1)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Production security headers injected via `next.config.mjs`.
- **Proof:**
  - `X-Frame-Options: DENY` present.
  - `X-Content-Type-Options: nosniff` present.
  - `Referrer-Policy: strict-origin-when-cross-origin` present.
  - `Content-Security-Policy-Report-Only` active.
  - `X-Powered-By` header suppressed.

---

### QA-007: Driver Dashboard Mobile Viewport Header Wrap (S3 / P2)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Driver dashboard header updated with responsive flex container and horizontal swiping tab bar.
- **Proof:**
  - Tested on 360px (Galaxy S8) and 390px (iPhone 13).
  - Navigation links stay in horizontal swipe container without awkward vertical wrapping.
  - `document.body.scrollWidth === window.innerWidth` (zero horizontal overflow).

---

### QA-008: Navigation Scroll-Spy Hardcoded Underline (S3 / P2)
- **Status:** **VERIFIED (CLOSED)**
- **Root Cause Remediated:** Dynamic `IntersectionObserver` scroll-spy in `frontend/src/app/page.tsx` tracking `#company`, `#team`, `#stats`, `#contact`.
- **Proof:**
  - Active indicator switches dynamically as user scrolls between sections.
  - Direct hash loads (e.g. `/#contact`) immediately highlight the corresponding section.

---

### FND-SEC-001: JWT in `localStorage` Migrated to `HttpOnly` Cookies & CSRF (S1)
- **Status:** **VERIFIED (CLOSED)**
- **Proof:**
  - `localStorage.getItem("zaminflow_jwt")` is completely eliminated.
  - Cookies set with `HttpOnly; SameSite=Lax; Path=/` (`access_token` 15m, rotating `refresh_token` 7d).
  - Mutating requests without `X-CSRF-Token` fail with `403 CSRF_TOKEN_INVALID`.
  - Next.js `middleware.ts` decodes JWT claims server-side and guards `/dashboard/*`.

---

### FND-SEC-002: Backend Rate Limiting & Hashed SMS OTP (S1)
- **Status:** **VERIFIED (CLOSED)**
- **Proof:**
  - 5 failed sign-in attempts triggers `429 Too Many Requests` with `Retry-After: 900` header.
  - 3 password reset requests triggers `429` with `Retry-After: 900`.
  - SMS OTP enforces 60-second cooldown per phone number (`429` with `Retry-After`).
  - SMS OTP code is hashed with SHA-256 server-side; 5 invalid attempts locks out code (`429`).

---

### FND-DB-001: Reversible Alembic Migration 0002 Downgrade (S1)
- **Status:** **VERIFIED (CLOSED)**
- **Proof:**
  - Full migration cycle on test database: `upgrade head` $\rightarrow$ `downgrade -1` $\rightarrow$ `upgrade head` executed with 0 errors.
  - AST integrity check `test_migration_downgrade_integrity.py` validates non-empty downgrade across all versions.

---

## 4. Test File Changes & Diffs Summary

In accordance with strict QA audit rules, developers **did not delete or weaken any existing test assertions**.
The changes to test files consisted strictly of:
1. **Added:** `qa/automation/test_qa_001_both_paths.py` (verifies ports 3000 and 8000 reject unapproved roles).
2. **Added:** `qa/automation/test_fnd_sec_001_cookies_csrf.py` (verifies HttpOnly cookies, CSRF rejection, and token revocation).
3. **Added:** `qa/automation/test_fnd_sec_002_rate_limits.py` (verifies 429 status codes, Retry-After headers, and hashed OTP lockout).
4. **Added:** `backend/tests/test_migration_downgrade_integrity.py` (AST inspection of Alembic migrations).
5. **Strengthened:** `qa/automation/test_roles_redirect.mjs` (added assertions for control characters `\x00`, `\x1b`, `\x7f`, triple slashes `///`, and dangerous schemes `data:`, `vbscript:`).

---

## 5. Untested Areas Checklist (Residual Out-of-Scope Items)

The following areas from the master test plan require live telecom or third-party infrastructure and are designated for Staging / Pre-Production verification:
1. **Production Telecom SMS Delivery (Eskiz.uz / PlayMobile):** Real GSM carrier SMS delivery tested via deterministic mock `123456`. Live gateway testing requires production telecom credentials.
2. **Partner Bank Mutual TLS & Production Settle Webhook:** Live banking settlement requires bank staging certificates.
3. **Hardware Tanker Telemetry:** Physical OBD-II / CAN-bus GPS and digital titration telemetry requires on-vehicle field testing.
4. **Physical WebKit on Apple Silicon:** Verified under Chromium DevTools mobile touch emulation; native Safari regression check recommended prior to broad rollout.
5. **High-Concurrency Live WebSocket Streaming:** Performance under 1,000+ simultaneous sub-second price ticker WebSocket connections requires staging load test execution.

---

## 6. Release Verdict

### **RELEASE DECISION: GO FOR PRODUCTION RELEASE (APPROVED)**

All 8 QA defects, 2 edge defects, and 3 architectural security/database findings are **VERIFIED CLOSED**. Zero regressions observed. Zero broken tests. Zero build errors.
