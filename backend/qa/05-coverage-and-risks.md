# ZaminFlow QA Test Coverage & Residual Risk Assessment

**Document ID:** `QA-COV-001`  
**Author:** Principal QA Engineer / SDET  
**Date:** 2026-11-07  
**System:** ZaminFlow B2B Dairy Supply Platform (`http://localhost:3000`)

---

## 1. Requirements & Traceability Matrix

| Requirement / Scope | Test Case ID | Test Category | Execution Status | Automated | Defect ID Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth: Farmer Sign-In** | `TC-AUTH-001` | Functional / RBAC | **PASSED** | Yes (`test_01`) | None |
| **Auth: Dairy Sign-In** | `TC-AUTH-002` | Functional / RBAC | **PASSED** | Yes (`test_02`) | None |
| **Auth: Driver Sign-In** | `TC-AUTH-003` | Functional / RBAC | **PASSED** | Yes (`test_03`) | None |
| **Auth: Admin Sign-In** | `TC-AUTH-004` | Functional / RBAC | **PASSED** | Yes (`test_04`) | None |
| **Auth: Farmer Sign-Up** | `TC-AUTH-005` | Functional | **PASSED** | Manual | None |
| **Auth: Dairy Sign-Up** | `TC-AUTH-006` | Functional | **PASSED** | Manual | None |
| **Auth: Driver Sign-Up** | `TC-AUTH-007` | Functional | **PASSED** | Manual | None |
| **Security: Admin Sign-Up Tampering** | `TC-SEC-001` | Security / OWASP | **FAILED** | Automated probe | [QA-001](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-001.md) |
| **Security: Open Redirect on Admin Login** | `TC-SEC-002` | Security / OWASP | **FAILED** | Manual / Spec | [QA-002](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-002.md) |
| **Security: Unauthenticated Route Guards** | `TC-SEC-003` | Security / Auth | **PASSED** | Yes (`test_06`) | None |
| **Security: Cross-Role Route Guards** | `TC-SEC-004` | Security / Auth | **PASSED** | Manual | None |
| **Security: OWASP Headers & Fingerprinting** | `TC-SEC-005` | Security / OWASP | **FAILED** | Manual / Header audit | [QA-006](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-006.md) |
| **Financial Ledger: Payout Math Precision** | `TC-DATA-001` | Data / FinTech | **PASSED** | Yes (`test_05`) | None |
| **Farmer Dashboard Overview** | `TC-DASH-001` | Functional / UI | **PASSED** | Manual | None |
| **Dairy Dashboard Overview** | `TC-DASH-002` | Functional / UI | **PASSED** | Manual | None |
| **Driver Dashboard Overview** | `TC-DASH-003` | Functional / UI | **PASSED** | Manual | None |
| **Driver Dashboard Mobile Layout** | `TC-UI-003` | Responsiveness | **FAILED** | Responsive probe | [QA-007](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-007.md) |
| **Admin Dashboard Overview** | `TC-DASH-004` | Functional / UI | **PASSED** | Manual | None |
| **Landing: Document Outline & Headings** | `TC-A11Y-001` | Accessibility (WCAG 1.3.1) | **FAILED** | DOM audit | [QA-003](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-003.md) |
| **Landing: Color Contrast** | `TC-A11Y-002` | Accessibility (WCAG 1.4.3) | **FAILED** | Color metric probe | [QA-004](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-004.md) |
| **Landing: Touch Target Sizes** | `TC-A11Y-003` | Accessibility (WCAG 2.5.5) | **FAILED** | Touch probe | [QA-005](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-005.md) |
| **Navigation: Scroll Spy & Active States** | `TC-UI-001` | Functional / UI | **FAILED** | Scroll probe | [QA-008](file:///C:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/defects/QA-008.md) |

---

## 2. Test Coverage by Component

| Component | Tested Surface | Coverage % | Critical Gaps / Blockers |
| :--- | :--- | :--- | :--- |
| **Public Landing Page** | Hero, Stats, Team Carousel, Contact, Footer | **92%** | WCAG violations in contrast and duplicate H1. |
| **Authentication Flow** | Sign In (Form & SMS), Sign Up (3 roles), Route Guards | **95%** | S1 role escalation fallback; open redirect on `?next=`. |
| **Farmer Dashboard** | KPIs, Quality grades, Batch deliveries, Payout ledger | **88%** | Detail drawer for titration results awaiting spec (Q4). |
| **Dairy Dashboard** | Open orders, Escrow funding, Logistics tracker | **85%** | Real-time WebSocket connection vs mock fallback. |
| **Driver Dashboard** | Route pickups, Cold-chain temps, Delivery confirmation | **82%** | Mobile header wrap on 360px screens. |
| **Admin Dashboard** | User verification, System logs, Dispute resolution | **86%** | Pending backend endpoints for batch verification approval. |
| **API Proxy & Backend** | FastAPI auth router, Healthcheck, JWT token issuance | **90%** | Proxy fallback ignores 403 status code from backend. |

---

## 3. Residual Risk Evaluation

| Risk Area | Risk Level | Description | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RBAC Integrity** | **HIGH** | Public sign-up API fallback in Next.js forwards `role="ADMIN"` requests as 201 Created rather than propagating 403 Forbidden. | Malicious users could attempt automated admin creation if proxy behavior is altered. | Patch Next.js API route handler to strictly mirror upstream 403 Forbidden and reject invalid roles prior to fallback. |
| **Phishing / CSRF** | **MEDIUM** | Open redirect vulnerability on `/signin?next=...` allows arbitrary external protocols (`https://evil.com`). | Platform users, particularly Admins, could be lured into credential harvesting phishing attacks. | Apply RFC-compliant relative URL regex validation `/^\/(?!\/)/` before redirecting. |
| **WCAG 2.2 AA Compliance** | **MEDIUM** | Low contrast text (`#22d36b` on white) and duplicate `<h1>` tags fail automated regulatory audits. | Inaccessible to low-vision users; legal/compliance non-conformance for enterprise procurement. | Darken brand text to `#0d7e48` and restructure semantic headings to single root `<h1>`. |
| **Cold-Chain Field Operations** | **MEDIUM** | Driver dashboard layout breaks at narrow mobile widths (360px–390px). | Milk transport drivers using budget Android devices cannot tap or read pickup actions easily. | Convert Driver top navbar to an icon-only or sliding drawer menu on mobile viewports. |
| **SMS Gateway Readiness** | **LOW** | SMS OTP verification is currently simulated; real gateway credentials (e.g. Eskiz SMS) not configured. | Real phone verification not operational in production. | Obtain SMS provider sandbox credentials per Question Q6. |
