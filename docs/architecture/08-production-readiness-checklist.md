# ZaminFlow Production Readiness Checklist (Phase 7 Scorecard)

**Document ID:** `DOC-PRC-001`  
**Status:** In Progress / Awaiting Approval Gate  
**Scores:** Pass | Fail | Awaiting Decision | Blocked  

---

| Category | Readiness Item | Status | Evidence / Verification Link |
| :--- | :--- | :---: | :--- |
| **Security** | No public sign-up for Admin role | **Pass** | Verified in QA-001 fix & `test_qa_fixes.py` (rejects `role=ADMIN` with 403). |
| **Security** | Safe redirects without open redirect vulnerabilities | **Pass** | Verified in QA-002 fix & `test_roles_redirect.mjs` (4/4 passed). |
| **Security** | Production HTTP Security Headers (HSTS, CSP, X-Frame-Options) | **Pass** | Verified in QA-006 fix & `next.config.mjs` header audit. |
| **Security** | Edge rate limiting for sign-in brute-force protection | **Pass** | Verified in NEW-001 fix (20 attempts/min IP throttle). |
| **Security** | Transition JWT storage from `localStorage` to `HttpOnly` cookies | **Awaiting Decision** | Logged as **FND-SEC-001** (RED change awaiting Approval Gate). |
| **Data & DB** | Reversible migrations with tested rollback (`downgrade`) | **Awaiting Decision** | Logged as **FND-DB-001** (`0002_onboarding_gating.py` downgrade pass). |
| **Data & DB** | Money handling strictly using integer/Decimal arithmetic | **Pass** | `NUMERIC(19, 4)` in DB; verified in `test_core_specifications.py`. |
| **Data & DB** | Automated off-site WAL archiving & restore drill | **Awaiting Decision** | Logged as **FND-OPS-001**; Runbook 02 written. |
| **Compliance**| Uzbek Law ZRU-547 citizen personal data localization sign-off | **Awaiting Decision** | Logged as **FND-COMP-001** / Question #3. |
| **Reliability**| Healthcheck endpoints for backend and database | **Pass** | Both `/health` and `pg_isready` configured in `docker-compose.yml`. |
| **Reliability**| Double-entry escrow ledger prevents double-spend | **Pass** | Verified in `test_critical_flows.py` (idempotency key protection). |
| **Experience**| WCAG 2.2 AA Contrast Compliance on all surfaces | **Pass** | Verified in QA-004 fix (token `#087a3c` applied to chips, text, buttons). |
| **Experience**| Touch target size $\ge 44 \times 44\text{px}$ across mobile viewports | **Pass** | Verified in QA-005 fix (social icons & interactive buttons). |
| **Experience**| Single `<h1>` per page semantic heading structure | **Pass** | Verified in QA-003 fix (`StatsPage.tsx` and Landing page). |
| **Experience**| Localization catalogs for `uz` (Latin), `ru`, and `en` | **Awaiting Decision** | Logged as **FND-LOC-001** / Question #9. |
