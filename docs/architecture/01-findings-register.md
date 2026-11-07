# ZaminFlow Architecture & Design Review: Consolidated Findings Register

**Document ID:** `DOC-FND-001`  
**Date:** 2026-11-07  
**Status:** Open / Pending Approval Gate  

---

### Findings Summary Matrix
| ID | Lens | Title | Severity | Effort | Risk | Change Class | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FND-SEC-001** | Security | Insecure JWT storage in `localStorage` exposed to XSS | **High** | M | Low | **RED** | Open (Pending Approval) |
| **FND-SEC-002** | Security | Caddy direct proxy bypasses Next.js edge rate limiting | **High** | S | Low | **YELLOW** | Ready for Implementation |
| **FND-DB-001** | Database | Alembic migration 0002 has empty `downgrade()` | **High** | S | Very Low | **GREEN** | Ready for Implementation |
| **FND-COMP-001** | Compliance | Uzbek Law ZRU-547 data residency sign-off pending | **Blocker** | M | High | **RED** | Open (Awaiting Legal Decision) |
| **FND-REL-001** | Reliability | Missing transactional outbox for partner bank webhooks | **Medium** | M | Med | **YELLOW** | Ready for Implementation |
| **FND-DOM-001** | Domain | Decimal & UZS integer precision verification across ledger | **High** | S | Low | **RED** | Open (Pending Approval) |
| **FND-OPS-001** | Operations | Missing automated backup restore drill & WAL shipping | **Medium** | M | Med | **YELLOW** | Ready for Implementation |
| **FND-ARCH-001** | Architecture | Unused legacy prototype routes in `(field)` & `(portal)` | **Low** | S | Very Low | **GREEN** | Ready for Implementation |
| **FND-A11Y-001** | Accessibility | Live statistics charts missing text table alternative | **Medium** | S | Very Low | **GREEN** | Ready for Implementation |
| **FND-DSGN-001** | Design | One-off hard-coded color values in dashboard subviews | **Low** | S | Very Low | **GREEN** | Ready for Implementation |
| **FND-LOC-001** | Localization | Hard-coded English strings across role dashboards | **Medium** | L | Med | **YELLOW** | Ready for Implementation |
| **FND-GIS-001** | Database | GPS driver location pings lack table partitioning | **Medium** | M | Med | **RED** | Open (Pending Approval) |

---

## Detailed Findings

### FND-SEC-001: Insecure JWT Storage in `localStorage`
- **Lens:** Security Architect
- **Severity:** High
- **Evidence:** `frontend/src/lib/api.ts` line 18 reads `localStorage.getItem("zaminflow_jwt")`.
- **Impact:** Any XSS vulnerability or rogue frontend dependency can extract the token and hijack the user's session.
- **Options Considered:**
  1. *Option A (Recommended):* Rely solely on `HttpOnly; Secure; SameSite=Strict` cookies issued by FastAPI `/api/v1/auth/sign-in` with anti-CSRF headers for mutating requests.
  2. *Option B:* Keep in `localStorage` with shortened 5-minute expiry. (Rejected: still vulnerable to exfiltration during active session).
- **Recommendation:** Adopt Option A.
- **Change Class:** **RED** (Auth session handling change).

---

### FND-SEC-002: Caddy Direct Proxy Bypasses Next.js Edge Rate Limiting
- **Lens:** Security Architect & DevOps Engineer
- **Severity:** High
- **Evidence:** `Caddyfile` line 9 routes `/api/*` directly to `backend:8000`. The rate limiter in `frontend/src/app/api/[...path]/route.ts` line 18 is only executed if traffic hits Next.js on port 3000.
- **Impact:** Production brute-force sign-in attacks reaching port 80/443 bypass the 20-attempts/minute limit.
- **Options Considered:**
  1. *Option A (Recommended):* Implement slowapi / rate-limiting middleware in FastAPI backed by DB table `login_attempts` or memory, plus configure Caddy `rate_limit` directive.
  2. *Option B:* Route all `/api/*` traffic through Next.js proxy. (Rejected: adds latency and doubles resource usage).
- **Recommendation:** Implement Option A.
- **Change Class:** **YELLOW** (Security infrastructure hardening).

---

### FND-DB-001: Alembic Migration 0002 Has Empty `downgrade()`
- **Lens:** Database Engineer
- **Severity:** High
- **Evidence:** `backend/alembic/versions/0002_onboarding_gating.py` line 184 has `def downgrade() -> None: pass`.
- **Impact:** `alembic downgrade -1` fails to revert changes, preventing safe rollback in CI/CD or production recovery.
- **Options Considered:**
  1. *Option A (Recommended):* Implement full reversible DDL dropping the added columns, indexes, and tables.
  2. *Option B:* Leave as one-way migration. (Rejected: violates production readiness standards).
- **Recommendation:** Implement Option A.
- **Change Class:** **GREEN** (Safe migration bugfix, behavior-preserving).

---

### FND-COMP-001: Uzbek Law ZRU-547 Data Residency Sign-off Pending
- **Lens:** Security & Compliance Architect
- **Severity:** Blocker
- **Evidence:** Law of the Republic of Uzbekistan No. ZRU-547 Article 27¹ mandates storing citizen personal data inside Uzbekistan.
- **Impact:** Regulatory sanction or domain blocking by O'zkomnazorat if primary database is hosted in overseas datacenters.
- **Options Considered:**
  1. *Option A (Recommended):* Host PostgreSQL database and document storage on certified Uzbek infrastructure (Uztelecom Cloud / Server.uz).
  2. *Option B:* International hosting with legal waiver. (High risk).
- **Recommendation:** Await executive answer to Question #3 before deploying production database.
- **Change Class:** **RED** (Legal & infrastructure decision).

---

### FND-REL-001: Missing Transactional Outbox for Partner Bank Webhooks
- **Lens:** Staff Backend Engineer & SRE
- **Severity:** Medium
- **Evidence:** `financial_ledger.webhook_status` has states `PENDING`, `DELIVERED`, `FAILED_RETRY`, but there is no persistent background worker running exponential backoff retries when bank endpoints return 500/503.
- **Impact:** If partner bank is temporarily offline during milk batch settlement, escrow release webhook can be permanently lost.
- **Recommendation:** Implement an APScheduler job that queries `webhook_status = 'FAILED_RETRY'` and retries up to 5 times with jittered exponential backoff.
- **Change Class:** **YELLOW** (Reliability improvement).

---

### FND-DOM-001: Currency & Precision Consistency in Milk Ledger
- **Lens:** Staff Backend Engineer
- **Severity:** High
- **Evidence:** `supply_contracts.base_price_per_liter` and `delivery_batches.final_payout_uzs` are defined as `NUMERIC(19, 4)`. Python service calculations must strictly use Python `Decimal` with rounding `ROUND_HALF_UP` to whole UZS.
- **Impact:** Floating point arithmetic introduces fractional tiyin discrepancies in bank wire totals.
- **Recommendation:** Enforce strict integer or 2-decimal rounding with unit test assertion on every settlement calculation.
- **Change Class:** **RED** (Financial business rule validation).

---

### FND-ARCH-001: Dead Prototype Routes in `(field)` and `(portal)`
- **Lens:** Staff Frontend Engineer
- **Severity:** Low
- **Evidence:** `frontend/src/middleware.ts` lines 70-93 redirects all requests to `/farmer/*`, `/industry/*`, `/driver/*`, `/admin/*`, and `/bank/*` to the modernized artboard routes under `/dashboard/*`. The files in `(field)` and `(portal)` are unused.
- **Impact:** Adds $\sim 180\text{kB}$ of dead JavaScript to the production build and slows compilation.
- **Recommendation:** Archive and remove these prototype routes cleanly.
- **Change Class:** **GREEN** (Dead code removal).

---

### FND-A11Y-001: Price Charts Missing Accessible Data Table Alternative
- **Lens:** Accessibility & Localization Specialist
- **Severity:** Medium
- **Evidence:** `ActiveTradeMetrics.tsx` displays SVG milk price curves without a collapsible or hidden accessible `<table aria-label="Milk price trend data">` for screen readers (WCAG 2.2 AA SC 1.1.1 Non-text Content).
- **Impact:** Visually impaired users cannot access milk pricing trends.
- **Recommendation:** Add an accessible screen-reader data summary table adjacent to the SVG canvas.
- **Change Class:** **GREEN** (Accessibility enhancement).
