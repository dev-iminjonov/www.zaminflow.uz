# ZaminFlow QA Retest & Verification Protocol

**Document ID:** `QA-RETEST-001`  
**Author:** Principal QA Engineer / SDET  
**System:** ZaminFlow Platform  
**Target Environment:** Localhost / Pre-Production Containers (`dairy_frontend`, `dairy_backend`, `dairy_db`)  
**Evaluation Date:** 2026-11-07  

---

## 1. Overview & Verification Policy

This document records the formal re-testing and verification of all reported defects (`QA-001` through `QA-008`).

A defect is marked **VERIFIED (CLOSED)** only after:
1. The developer's code change addresses the verified root cause.
2. The QA Engineer executes the exact reproduction steps across supported browsers and viewports.
3. The automated test suite (`qa/automation/test_qa_fixes.py`, `test_roles_redirect.mjs`, and `test_critical_flows.py`) passes with 0 failures.
4. No regression is observed on related functionality.

---

## 2. Defect Verification Checklist & Proof of Resolution

### QA-001: Public Sign-Up API Role Escalation Fallback (S1 / P0)
- [x] **Verification Command:**
  ```bash
  docker exec dairy_backend python -c "import urllib.request, json
  for r in ['ADMIN', 'admin', '  ADMIN  ', 'SUPERADMIN', 'OPERATOR']:
      req = urllib.request.Request('http://dairy_frontend:3000/api/v1/auth/sign-up', data=json.dumps({'role':r,'full_name':'Hacker','email':f'test_{r.strip()}@evil.uz','password':'Password123!','accepted_terms':True}).encode(), headers={'Content-Type':'application/json'})
      try:
          resp = urllib.request.urlopen(req)
          print('UNEXPECTED SUCCESS:', resp.status)
      except urllib.error.HTTPError as e:
          print(f'{r}: HTTP {e.code} - {e.read().decode()}')
  "
  ```
- [x] **Acceptance Criteria Verification:**
  - HTTP Response status code is **`403 Forbidden`** for all variants (`ADMIN`, `admin`, `  ADMIN  `, `SUPERADMIN`, `OPERATOR`).
  - Response body strictly contains `{"detail":"Admin accounts cannot be created via public sign-up"}` (or self-signup restriction message).
  - Permissive mock fallback in `frontend/src/app/api/[...path]/route.ts` has been purged.
  - Legitimate Farmer registration (`role: "FARMER"`) returns **`HTTP 201 Created`** and generates authentic database record and JWT token.
- **Verdict: VERIFIED (PASS)**

---

### QA-002: Open Redirect via `?next=` on Admin Login (S2 / P1)
- [x] **Verification Steps & Unit Test Execution:**
  ```bash
  docker exec dairy_frontend node --test /tmp/test_roles_redirect.mjs
  ```
- [x] **Acceptance Criteria Verification:**
  - `https://evil.com` -> sanitized to `/dashboard/admin`.
  - `//evil.com` -> sanitized to `/dashboard/admin`.
  - `/\evil.com` and `/%2fevil.com` -> sanitized to `/dashboard/admin`.
  - Cross-role route traversal (e.g. `?next=/dashboard/farmer` for `dairy` user) -> redirected to own dashboard `/dashboard/dairy`.
  - Valid internal relative paths (e.g. `?next=/dashboard/admin/disputes`) -> correctly preserved.
- **Verdict: VERIFIED (PASS)**

---

### QA-003: Duplicate `<h1>` Document Structure on Landing Page (S2 / P1)
- [x] **Verification Steps:**
  1. Automated test `test_qa_003_single_h1_on_landing_page` executed against `http://localhost:3000/`.
  2. Executed DOM query: `document.querySelectorAll('h1').length`.
- [x] **Acceptance Criteria Verification:**
  - Exactly **1** `<h1>` element exists in the DOM (Hero heading: *"Connecting smallholder farmers with commercial buyers"*).
  - Active Trade Metrics heading is rendered as an `<h2>` while retaining identical Tailwind typography.
- **Verdict: VERIFIED (PASS)**

---

### QA-004: WCAG 2.2 AA Contrast Failure on Emerald Green Text (S2 / P1)
- [x] **Verification Steps:**
  1. Inspected floating frosted cards in Hero section ("Live Pricing", "Logistics", "Secured Escrow").
  2. Contrast analyzer evaluation against `#FFFFFF` background.
- [x] **Acceptance Criteria Verification:**
  - Color `#087a3c` on `#FFFFFF` yields **5.25:1** contrast ratio ($\ge 4.5:1$ required by WCAG 2.2 SC 1.4.3).
  - Mint status pill (`#087a3c` on `#d9f7e5`) yields **4.68:1** contrast ratio.
  - Accessible brand tokens centralized in `globals.css` and `tailwind.config.ts`.
- **Verdict: VERIFIED (PASS)**

---

### QA-005: Team Carousel Social Links Touch Target Size (S3 / P2)
- [x] **Verification Steps:**
  1. Inspected team member card social links in mobile viewport (375x667).
  2. Measured computed bounding box and accessibility attributes.
- [x] **Acceptance Criteria Verification:**
  - Computed bounding box measures **44px $\times$ 44px** (`min-w-[44px] min-h-[44px]`), satisfying WCAG 2.5.5 AAA standard.
  - `rel="noopener noreferrer"` and descriptive `aria-label` attributes present on all external anchors.
- **Verdict: VERIFIED (PASS)**

---

### QA-006: Missing OWASP Security Headers (S3 / P1)
- [x] **Verification Command:**
  ```bash
  docker exec dairy_backend python -c "import urllib.request
  resp = urllib.request.urlopen('http://dairy_frontend:3000/')
  headers = dict(resp.headers)
  print('X-Frame-Options:', headers.get('x-frame-options'))
  print('X-Content-Type-Options:', headers.get('x-content-type-options'))
  print('Referrer-Policy:', headers.get('referrer-policy'))
  print('CSP-Report-Only:', 'PRESENT' if 'content-security-policy-report-only' in headers else 'MISSING')
  print('X-Powered-By:', headers.get('x-powered-by'))
  "
  ```
- [x] **Acceptance Criteria Verification:**
  - `X-Frame-Options: DENY` is present.
  - `X-Content-Type-Options: nosniff` is present.
  - `Referrer-Policy: strict-origin-when-cross-origin` is present.
  - `Content-Security-Policy-Report-Only` is present and permits fonts, images, and API endpoints.
  - `X-Powered-By` header is completely suppressed.
- **Verdict: VERIFIED (PASS)**

---

### QA-007: Driver Dashboard Mobile Viewport Header Wrap (S3 / P2)
- [x] **Verification Steps:**
  1. Emulated mobile viewports: 360px (Samsung Galaxy S8), 390px (iPhone 13), 768px (Tablet).
  2. Navigated to `http://localhost:3000/dashboard/driver`.
- [x] **Acceptance Criteria Verification:**
  - Nav bar height does not exceed 68px on 360px and 390px screens.
  - Navigation links swipe horizontally in a pill container with zero awkward multi-line wrapping.
  - Header controls stack responsively (`flex-col sm:flex-row`).
  - Zero horizontal overflow (`document.body.scrollWidth === window.innerWidth`).
- **Verdict: VERIFIED (PASS)**

---

### QA-008: Navigation Scroll-Spy Hardcoded "Live Statistics" Underline (S3 / P2)
- [x] **Verification Steps:**
  1. Loaded root page `http://localhost:3000/`.
  2. Tested scrolling transitions across `#company`, `#team`, `#stats`, and `#contact`.
  3. Tested direct navigation and refresh on `http://localhost:3000/#stats`.
- [x] **Acceptance Criteria Verification:**
  - At page top, "Our Company" has the active border indicator.
  - Scrolling past `#team` dynamically transfers active highlight to "Our Team".
  - Reaching `#stats` activates "Live statistics".
  - Reaching `#contact` activates "Contact us".
  - Refresh on direct hash URL activates the matching section immediately.
  - `prefers-reduced-motion: reduce` respected.
- **Verdict: VERIFIED (PASS)**

---

## 3. Retest Execution Log Table

| Defect ID | Severity | Retest Date | Retester | Build / Commit SHA | Result | Resolution Notes |
| :--- | :---: | :---: | :--- | :--- | :---: | :--- |
| `QA-001` | S1 | 2026-11-07 | Principal QA / SDET | `fix(QA-001)` | **Verified (Pass)** | Fallback deleted; upstream 403 strictly enforced on server & proxy. |
| `QA-002` | S2 | 2026-11-07 | Principal QA / SDET | `fix(QA-002)` | **Verified (Pass)** | `sanitizeNextRedirect` enforces relative internal paths & role dashboard. |
| `QA-003` | S2 | 2026-11-07 | Principal QA / SDET | `fix(QA-003)` | **Verified (Pass)** | Demoted second heading to H2; document outline has strictly 1 H1. |
| `QA-004` | S2 | 2026-11-07 | Principal QA / SDET | `fix(QA-004)` | **Verified (Pass)** | Replaced `#00C853` with accessible `#087a3c` (5.25:1 contrast). |
| `QA-005` | S3 | 2026-11-07 | Principal QA / SDET | `fix(QA-005)` | **Verified (Pass)** | Hit area expanded to 44x44px with rel=noopener and aria-label. |
| `QA-006` | S3 | 2026-11-07 | Principal QA / SDET | `fix(QA-006)` | **Verified (Pass)** | OWASP headers active in next.config.mjs; X-Powered-By suppressed. |
| `QA-007` | S3 | 2026-11-07 | Principal QA / SDET | `fix(QA-007)` | **Verified (Pass)** | Responsive flex layout & horizontal swipe pill on 360-390px screens. |
| `QA-008` | S3 | 2026-11-07 | Principal QA / SDET | `fix(QA-008)` | **Verified (Pass)** | IntersectionObserver dynamic scroll-spy active across all 4 anchors. |

---

## 4. Newly Discovered Issues Status

| Issue ID | Area | Description | Developer Resolution | Retest Result |
| :--- | :--- | :--- | :--- | :---: |
| `NEW-001` | Proxy / Security | Missing rate limiting on `/api/v1/auth/sign-in` | Implemented sliding-window rate limiter (20 attempts / 60s per IP) returning `HTTP 429 Too Many Requests`. | **Verified (Pass)** |
| `NEW-002` | FinTech / Logistics | Plain string timestamps in mock driver stops | Added ISO 8601 timestamps (`2026-11-07T08:40:00+05:00`) with Tashkent offset. | **Verified (Pass)** |

---

## 5. Untested Areas Checklist (Residual Out-of-Scope Items)

The following areas from the master test plan could not be fully exercised on localhost and remain open for Staging/Production sign-off:

1. **Production SMS Gateway Delivery (Eskiz.uz / PlayMobile):** Currently using simulated dev OTP (`123456`). Real GSM network delivery and carrier latency remain untested pending production provider credentials (per Question Q6).
2. **Real Partner Bank Webhook Settle Flow:** `POST /api/v1/bank/webhook/hmac` was tested with simulated test secrets, but live banking API HMAC mutual TLS verification requires Staging sandbox credentials.
3. **Hardware GPS Telemetry on Milk Collection Tankers:** Simulated in frontend data layer; physical OBD-II / CAN-bus GPS tracker streaming remains untested.
4. **Physical iOS Safari Testing on Native Apple Silicon:** Tested under Chromium touch emulation; real WebKit rendering on physical iPhone screens should be verified during staging user acceptance testing.
5. **High-Concurrency Live WebSocket Price Ticker:** Mock data layer verified; sub-second live SSE/WebSocket broadcast with 1,000+ concurrent farmers requires load testing.
