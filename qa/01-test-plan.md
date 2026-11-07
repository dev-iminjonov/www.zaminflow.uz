# Risk-Based Master Test Plan

**Document ID:** QA-PLAN-001  
**Project:** ZaminFlow B2B Agri-Tech & Escrow Platform  
**Target Release:** v3.0-RC1  
**Author:** Principal QA Engineer / SDET  
**Date:** 2026-11-07  
**Status:** Approved for Execution  

---

### 1. Executive Overview & Scope
ZaminFlow is an enterprise B2B platform digitizing the raw dairy supply chain in Uzbekistan. The core architecture comprises a Next.js 15 App Router frontend, a Python FastAPI modular monolith backend, PostgreSQL with PostGIS geo-spatial extensions, and an automated partner bank escrow ledger.

#### 1.1 In-Scope for Testing
* **Public & Marketing Surface:** Landing page (Hero, Our Company, Our Team carousel, Contact), global navigation, floating controls, theme switching (Light / Dark).
* **Live Statistics Engine (`#stats`):** Active trade metrics, WebSocket 800ms ticker tape, SSE / HTTP fallback, time-range filters (Today, 7D, 30D, 12M), regional filtering, vector chart interactions, quality tier distribution.
* **Authentication & Authorization (RBAC):** Credential sign-in, SMS OTP modal, public self-signup (Farmer, Dairy, Driver), route guards, middleware enforcement, session persistence, silent JWT token renewal.
* **Four Role Workspaces:**
  - Farmer Dashboard (`/dashboard/farmer`): milk supply listing, batch inspection, delivery schedule, escrow payout telemetry.
  - Dairy Industry Dashboard (`/dashboard/dairy`): procurement orders, shipment monitoring, intake titration reception, escrow funding.
  - Driver Dashboard (`/dashboard/driver`): trip dispatch, IoT temperature cold-chain monitoring, GPS route checkpoints, incident logging.
  - Admin Dashboard (`/dashboard/admin`): verification queue (KYB review), user directory, dispute mediation, market oversight.
* **Non-Functional Requirements:** Security (OWASP Top 10 / ASVS Level 2), Accessibility (WCAG 2.2 AA), Performance (Core Web Vitals), Cross-device responsiveness (360px to 1440px), Multilingual localization (EN, RU, UZ).

#### 1.2 Out-of-Scope
* Production physical hardware calibration of truck temperature sensors.
* Live real-money automated wire transfers with Central Bank of Uzbekistan (cleared via simulated ledger HMAC webhooks).

---

### 2. Risk Matrix & Testing Priorities

Testing effort is allocated according to financial, security, and operational failure impact:

| Risk Rank | Functional Area | Failure Impact | Test Strategy |
| :--- | :--- | :--- | :--- |
| **Rank 1 (Critical)** | **Escrow Ledger & Payout Math** | Wrong money disbursement, loss of capital, insolvency liability | 100% boundary value analysis, mathematical formula auditing ($L \times P = \text{Payout}$), double-spend checks, concurrency locks |
| **Rank 2 (Critical)** | **Authentication & RBAC Enforcement** | Account takeover, privilege escalation, unauthorized admin access | Automated penetration tests, JWT manipulation, client-side role spoofing, direct URL tampering, IDOR scans |
| **Rank 3 (Major)** | **Cold-Chain & Titration Rules** | Spoilage of perishable milk (10,000+ liters), food safety hazard | Temperature threshold verification (>4.0°C trigger), titration acid level grading (A+, A, B) |
| **Rank 4 (Major)** | **Session & Token Management** | User lockout, stale auth tokens, unexpected logout in the field | Silent refresh lifecycle testing, cookie security flags, network disconnection/reconnection |
| **Rank 5 (Moderate)**| **Accessibility & Design Fidelity** | Non-compliance with WCAG 2.2 AA, low contrast in direct sunlight | Automated axe-core scans, manual color contrast audits (4.5:1 threshold), screen reader navigation |
| **Rank 6 (Moderate)**| **Mobile Touch Usability (360–390px)** | In-cab driver failure, field farmer inability to submit milk | Viewport simulation, touch target size validation (min 24px/44px), form factor wrapping |

---

### 3. Test Environments & Tooling

* **Local Environment:** `http://localhost:3000` (Frontend: Next.js 15 container `dairy_frontend`), `http://localhost:8000` (Backend: FastAPI container `dairy_backend`), `localhost:5432` (PostgreSQL `dairy_db`).
* **Test Tooling:**
  - Automated API & Functional Testing: Python `requests` & `urllib` integration suites, Playwright headless browser runners.
  - Accessibility Auditing: axe-core engine, Chrome DevTools Lighthouse, Contrast Ratio Analyzers.
  - Security Testing: Non-destructive OWASP ZAP style request tampering, cookie flag inspection, injection probes.

---

### 4. Test Accounts & Role Baseline Matrix

| Role Key | Canonical Role | Test Login ID | Password | Destination Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| `farmer` | FARMER / OWNER | `farmer@zaminflow.uz` | `ZaminFlowFarmer2026!` | `/dashboard/farmer` |
| `dairy` | INDUSTRY / OWNER | `dairy@zaminflow.uz` | `ZaminFlowDairy2026!` | `/dashboard/dairy` |
| `driver` | INDUSTRY / DRIVER | `driver@zaminflow.uz` | `ZaminFlowDriver2026!` | `/dashboard/driver` |
| `admin` | ADMIN / SUPERADMIN | `admin@zaminflow.uz` | `ZaminFlowSuperAdmin2026!` | `/dashboard/admin` |

---

### 5. Browser & Viewport Matrix

* **Desktop Viewports:**
  - 1440 × 900 (Primary Design Baseline)
  - 1280 × 800 (Standard Laptop)
  - 1024 × 768 (Tablet Landscape)
* **Mobile & Handheld Viewports:**
  - 390 × 844 (iPhone 12/13/14/15 standard)
  - 360 × 800 (Samsung Galaxy / Android standard in Uzbekistan)
  - 768 × 1024 (iPad / Tablet Portrait)
* **Browsers:** Google Chrome (Blink), Microsoft Edge (Chromium), Mozilla Firefox (Gecko), Apple Safari (WebKit).
* **OS Scaling / Zoom:** 100%, 125%, 150% DPI scaling; 200% text zoom.

---

### 6. Entry & Exit Criteria

#### 6.1 Entry Criteria
* Clean production Docker build (`wwwzaminflowuz-frontend:latest`) running on `localhost:3000`.
* FastAPI modular monolith operational with healthy database connection on `localhost:8000`.
* Seed accounts provisioned and accessible.

#### 6.2 Exit Criteria for Release Approval (Go / No-Go Standard)
* Zero open **S1 (Critical)** defects.
* Zero open **S2 (Major)** defects in Authentication, Authorization, Escrow/Money calculations, or Data Scoping.
* All P0/P1 defects verified as fixed and tested against regression.
* WCAG 2.2 AA compliance verified for all core public and dashboard actions.
