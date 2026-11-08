# ZaminFlow Architecture & Engineering Changelog

All notable changes, architectural reviews, security hardening, and defect fixes are documented in this file.

---

## [v2.0.0-rc3] - Launch Squad Multi-Disciplinary Audit - 2026-11-08

### Launch Squad Baseline & Audit Findings
- **Launch Readiness Governance:** Completed Phase 0 & Phase 1 comprehensive audits across Content Management, Web Performance, Website Design, and Quality Assurance. Published [`docs/launch/00-LAUNCH-READINESS-REPORT.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/launch/00-LAUNCH-READINESS-REPORT.md) and [`01-findings-register.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/launch/01-findings-register.md).
- **Executive Questions Register:** Published consolidated, numbered register in [`docs/launch/questions.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/launch/questions.md) following the mandatory Ask-Me Protocol.
- **Performance Baselines:** Established verified production build baselines: Landing JS bundle at 126.3 kB gzip (under 170 kB budget), HTML TTFB at 2.20 ms p50, and Public Stats API latency at 0.65 ms p50. Identified 735 kB hero image compression requirement (`FND-001`) and external font `@import` optimization (`FND-002`).
- **Content & Claims:** Completed content inventory across 14 surfaces (312 strings), claims truthfulness audit (`03-claims-audit.md`), and standardized trilingual glossary (`04-glossary-and-tone.md`).
- **Design System & Polish:** Audited fidelity across 5 viewports (1440px to 360px), verified 5.25:1 brand contrast, documented Coolors palette tokens, and catalogued missing edge states (`04-missing-screens-list.md`).
- **QA & Reliability:** Confirmed 0 open S1/S2 defects, 37 automated Pytest suites green (100% pass), and delivered plain-language UAT execution script (`05-uat-script.md`).

---

## [v2.0.0-rc2] - Phase 5A Implementation - 2026-11-07

### Security Hardening & Session Protection
- `fix(QA-001)`: Removed permissive proxy fallback in `frontend/src/app/api/[...path]/route.ts`. The proxy now strictly forwards upstream response status and body unchanged, returning 502/503 when backend is unreachable without generating synthetic sessions. Enforced strict allowlist on backend sign-up (`FARMER`, `INDUSTRY`, `DRIVER`) rejecting admin attempts with 403 Forbidden.
- `fix(QA-002)`: Implemented strict client and server validation for `?next=` parameter rejecting backslashes, control characters, external schemes/hosts, and cross-role destinations.
- `fix(FND-SEC-001)`: Migrated authentication from `localStorage` (`zaminflow_jwt`) to `HttpOnly; SameSite=Lax; Secure` cookies with `__Host-` prefix on HTTPS. Implemented double-submit CSRF protection with Origin/Host checks and `X-CSRF-Token` headers. Added server-side JWT claim decoding in Next.js middleware for role-based dashboard protection.
- `fix(FND-SEC-002)`: Implemented backend rate limiting backed by PostgreSQL `login_attempts` table in FastAPI: 5 failures/15m on sign-in (returns 429 with `Retry-After: 900`), 10 registrations/hour on sign-up, 3 resets/15m on forgot-password, and 60-second cooldown with max 5 requests/15m on SMS OTP. Hashed SMS OTP storage using SHA-256 with 5-minute expiry and attempt lockout.

### Database Reliability
- `fix(FND-DB-001)`: Implemented real reversible `downgrade()` for Alembic migration `0002_onboarding_gating.py` and added automated AST integrity test `test_migration_downgrade_integrity.py`. Fully validated upgrade/downgrade/upgrade cycle against test database.

---

## [v2.0.0-rc1] - 2026-11-07

### Architecture & Design Review (ARB Review)
- **Inventory & Architecture:** Generated comprehensive C4 Context, Container, Component diagrams, ERD, and Data-flow diagrams in [`docs/architecture/00-overview.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/architecture/00-overview.md).
- **Findings Register:** Established consolidated findings register [`docs/architecture/01-findings-register.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/architecture/01-findings-register.md) and `.csv`.
- **Architecture Decision Records (ADRs):**
  - `ADR-001`: Modular Monolith Architecture over Microservices.
  - `ADR-002`: Transition to HttpOnly Secure Cookie Authentication & Anti-CSRF (`FND-SEC-001`).
  - `ADR-003`: Double-Entry Financial Ledger & Escrow Accounting.
  - `ADR-004`: PostGIS Cold-Chain Telemetry Modeling & Retention Policy (`FND-GIS-001`).
  - `ADR-005`: Caddy Edge Reverse Proxy & Multi-Layer Rate Limiting (`FND-SEC-002`).
- **Domain & API Documentation:** Documented complete data model in [`03-data-model.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/architecture/03-data-model.md) and 51 API endpoints in [`04-api-inventory.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/architecture/04-api-inventory.md).
- **Security:** Completed STRIDE threat model in [`05-threat-model.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/architecture/05-threat-model.md).
- **Reliability & Runbooks:** Formulated SLIs/SLOs in [`06-nfr-and-slos.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/architecture/06-nfr-and-slos.md) and operational runbooks for Incident Response (`RB-01`), Database Backup/Restore (`RB-02`), and Deployment/Rollback (`RB-03`).
- **Design Review:** Formulated design audit ([`00-design-audit.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/design/00-design-audit.md)), design system specification ([`01-design-system-spec.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/design/01-design-system-spec.md)), UX flows and gaps protocol ([`02-ux-flows-and-gaps.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/design/02-ux-flows-and-gaps.md)), WCAG 2.2 AA accessibility audit ([`03-accessibility-audit.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/design/03-accessibility-audit.md)), and localization guide ([`04-content-and-localization-guide.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/design/04-content-and-localization-guide.md)).
- **Open Questions:** Published official executive questions list in [`docs/questions.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docs/questions.md).

### QA Defect Fixes & Hardening (Phase Preceding)
- `fix(QA-001)`: Removed permissive fallback in `frontend/src/app/api/[...path]/route.ts`. Enforced strict role whitelisting in FastAPI backend (`FARMER`, `INDUSTRY`, `DRIVER`).
- `fix(QA-002)`: Implemented strict validation for `?next=` parameter preventing open redirects and cross-role privilege escalation.
- `fix(QA-003)`: Standardized semantic heading structure to ensure a single `<h1>` per page.
- `fix(QA-004)`: Updated text and button contrast tokens to accessible green `#087a3c` (4.5:1 WCAG AA).
- `fix(QA-005)`: Enlarged touch targets on social media links and buttons to $\ge 44 \times 44\text{px}$.
- `fix(QA-006)`: Applied production security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) in `next.config.mjs`.
- `fix(QA-007)`: Implemented active scroll-spy navigation tracking `#company`, `#team`, `#stats`, `#contact`.
- `fix(QA-008)`: Fixed driver dashboard responsive flex wrapping at 360px viewport.
- `fix(NEW-001)`: Added edge IP rate limiting for sensitive authentication endpoints (20 attempts/min).
- `fix(NEW-002)`: Formatted driver stop timestamps to strict ISO 8601 strings.
- `feat(team)`: Replaced team section with authentic executive portraits and active professional links.
