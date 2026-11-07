# ZaminFlow Architecture & Engineering Changelog

All notable changes, architectural reviews, security hardening, and defect fixes are documented in this file.

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
