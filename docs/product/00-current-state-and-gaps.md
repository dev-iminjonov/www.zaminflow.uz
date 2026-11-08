# ZaminFlow Role-Based Dashboards: Current State & Gap Analysis

**Document ID:** `DOC-PROD-GAP-001`  
**Squad Leads:** Product Manager, Frontend Architect, Backend Architect, Security Engineer  
**Date:** 2026-11-08  
**Status:** Phase 1 Complete (Baseline Established)  

---

## 1. Executive Summary & Inventory Findings

This gap analysis benchmarks the current implementation against the target operational requirements for a multi-role B2B dairy supply and financial escrow platform in Uzbekistan.

### Key Architectural Findings:
1. **Frontend Mock Disconnect:** The four primary dashboard pages (`/dashboard/farmer`, `/dashboard/dairy`, `/dashboard/driver`, `/dashboard/admin`) rely on `frontend/src/lib/roleDashboardService.ts` with `USE_MOCK_DATA = true`, rendering static synthetic arrays rather than connecting to live backend endpoints.
2. **Sub-Route Storage Isolation:** Actions in sub-routes (e.g., `list-supply/page.tsx`, `receive-batch/page.tsx`) mutate client-side in-memory stores (`farmerStore.ts`, `dairyStore.ts`) rather than executing authenticated transactional API mutations.
3. **Database Schema Readiness vs Frontend Role Definitions:**
   - PostgreSQL schema (`0001_initial_schema.py`) already contains tables for `organizations` (roles: `FARMER`, `INDUSTRY`, `BANK`, `ADMIN`), `bank_profiles`, `financial_ledger`, `supply_contracts`, and `delivery_batches`.
   - In contrast, frontend `ROLES` (`roles.ts`) and `middleware.ts` only recognize 4 roles (`farmer`, `dairy`, `driver`, `admin`), omitting `bank` entirely from the canonical role type and route protection map.
   - Legacy prototype routes exist under `/(portal)/bank/*` and `/(field)/*`, causing routing fragmentation and dual-maintenance overhead.
4. **Security & Route Guard Vulnerability:**
   - `frontend/src/middleware.ts` lines 37-44 contains a development fallback allowing authentication via plain client cookies (`zaminflow_role` and `zaminflow_logged_in`). Any client can forge these cookies to bypass middleware path checks if the JWT cookie is absent.
   - Backend authorization uses `require_roles(["BANK", "ADMIN"])` in some routers, but lacks consistent Object-Level Attribute-Based Access Control (ABAC) to verify that a user belongs to the organization that owns the contract or shipment.

---

## 2. Role-by-Role Gap Analysis Matrix

### 2.1. Farmer Role (`/dashboard/farmer`)

| Element / Feature | Current State in Code | Target Production State | Gap Classification | Remediation Plan |
|:---|:---|:---|:---:|:---|
| **KPI: Today Price** | Hardcoded `4,380 UZS / L (+12%)` from `roleDashboardService.ts` | Volume-weighted average farm-gate price from `/api/v1/public/stats` | **Data Gap** | Wire to live daily pricing aggregate endpoint. |
| **KPI: Supplied This Month** | Synthetic `24,500 L` in mock service | `SUM(actual_volume_liters)` of `SETTLED` batches for farmer's organization | **Backend Gap** | Create `GET /api/v1/farmer/dashboard/kpis` with tenant scoping. |
| **KPI: Escrow Payout Due** | Synthetic `18,450,000 UZS` | `SUM(final_payout_uzs)` of batches in status `TESTING_ACCEPTED` awaiting bank wire | **Backend Gap** | Query `financial_ledger` for pending credits to farmer's IBAN. |
| **Action: + List Supply** | Form writes to local `farmerStore.ts` array | Submits supply contract or batch listing to `POST /api/v1/contracts` | **Functional Gap** | Connect form to backend contract/batch endpoint; remove `farmerStore`. |
| **Subpage: My Milk (`/my-milk`)** | Reads mock array from `farmerStore.ts` | Displays real cold-chain storage tank telemetry and certified lab titration results | **Functional Gap** | Wire to `GET /api/v1/farmer/batches`. |
| **Subpage: Deliveries (`/deliveries`)** | Mock table with static statuses | Live shipment tracking with tanker plate, driver contact, and GPS status | **Functional Gap** | Wire to `GET /api/v1/batches` scoped to `farmer_id`. |
| **Subpage: Payouts (`/payouts`)** | Mock list with fake bank reference numbers | Real ledger entries from `financial_ledger` with escrow release status | **Functional Gap** | Wire to `GET /api/v1/farmer/payouts`. |
| **Subpage: Dispute (`/dispute`)** | Mock dispute form | Real titration dispute ticket creation in `disputes` table | **Functional Gap** | Wire to `POST /api/v1/disputes/open`. |

---

### 2.2. Buyer / Dairy Industry Role (`/dashboard/dairy`)

| Element / Feature | Current State in Code | Target Production State | Gap Classification | Remediation Plan |
|:---|:---|:---|:---:|:---|
| **KPI: Received Today** | Hardcoded `48,200 L (+8%)` | `SUM(actual_volume_liters)` for dairy intake on current calendar date | **Data Gap** | Backend KPI endpoint scoped to `industry_id`. |
| **KPI: Active Shipments** | Hardcoded `6 Tankers (All cold-chain OK)` | Count of `delivery_batches` in `IN_TRANSIT` bound for this dairy | **Data Gap** | Query active logistics batches with real temperature. |
| **KPI: Escrow Balance** | Hardcoded `420,000,000 UZS` | Sum of funded escrow minus released payouts in `financial_ledger` | **Financial Gap** | Calculate exact balance from double-entry ledger. |
| **Action: + Place Order** | UI form in `/place-order` | Creates signed bilateral supply contract with farmer cooperative | **Functional Gap** | Wire to `POST /api/v1/contracts/create`. |
| **Action: Receive Batch** | Form in `/receive-batch` mutates client store | Submits lab titration test results (fat, SNF, acidity °T, temp) to backend | **Functional Gap** | Wire to `POST /api/v1/batches/{id}/gate-titration` with lab tech auth. |
| **Subpage: Shipments (`/shipments`)** | Mock table | Real-time transit list with GPS ping age and cold-chain alert flag | **Functional Gap** | Wire to `GET /api/v1/dairy/shipments`. |
| **Subpage: Escrow (`/escrow`)** | Mock statement | Real transaction history with bank reference IDs and deposit wire instructions | **Financial Gap** | Wire to `GET /api/v1/dairy/escrow-ledger`. |
| **Subpage: Regional Pricing** | Mock bar chart with hardcoded cities | Daily regional average prices from settled contract transactions | **Data Gap** | Aggregate query by farmer region. |

---

### 2.3. Driver Logistics Role (`/dashboard/driver`)

| Element / Feature | Current State in Code | Target Production State | Gap Classification | Remediation Plan |
|:---|:---|:---|:---:|:---|
| **KPI: Today Trips** | Hardcoded `3 Completed` | Real completed shipments assigned to driver's user UUID | **Data Gap** | Query `delivery_batches` WHERE `driver_id = current_user.id`. |
| **KPI: Cold-Chain Sensor** | Hardcoded `3.2°C (Optimal)` | Most recent reading from tanker BLE/telematics logger | **IoT / Data Gap** | Query latest ping from `driver_telemetry_pings`. |
| **Action: Start Next Trip** | Route `/start-trip` | Transitions batch state from `ASSIGNED` to `IN_TRANSIT` | **State Gap** | Call `POST /api/v1/batches/{id}/start-trip`. |
| **Action: Confirm Pickup** | QR scanner mock in `/confirm-pickup` | Scans farm vat QR, logs pickup volume and temp, signs waybill | **Functional Gap** | Wire to `POST /api/v1/batches/{id}/pickup-telemetry`. |
| **Action: Gate Handover** | Mock route `/driver/gate-handover` | Dairy lab scans driver QR to confirm tanker arrival at intake gate | **Functional Gap** | Unify under `/dashboard/driver/handover`. |
| **Offline Behavior** | Entirely online web application | ServiceWorker / IndexedDB local queue for storing pickups offline | **Architecture Gap** | Implement offline-first local queue with sync protocol. |

---

### 2.4. Bank Role (`/dashboard/bank` - Currently Missing from Canonical Routes)

| Element / Feature | Current State in Code | Target Production State | Gap Classification | Remediation Plan |
|:---|:---|:---|:---:|:---|
| **Route & Dashboard** | Only exists as legacy prototype `/(portal)/bank/dashboard` | Canonical `/dashboard/bank` protected by strict role guards | **Architecture Gap** | Migrate from `(portal)` to `/dashboard/bank`; add `bank` to `roles.ts`. |
| **KPI: Total Escrow Held** | Endpoint `GET /api/v1/bank/dashboard-kpis` exists in backend | Real-time total of locked buyer funds awaiting titration release | **Frontend Gap** | Wire canonical `/dashboard/bank` to backend KPI endpoint. |
| **Audit Ledger View** | Endpoint `GET /api/v1/bank/ledger` exists in backend | Dense table showing debit/credit accounts, ISO 20022 IDs, bank references | **Frontend Gap** | Wire to `GET /api/v1/bank/ledger` with date/status filters. |
| **CSV Export** | Endpoint `GET /api/v1/bank/ledger/export-csv` exists | One-click download of ISO 20022 compliant banking ledger CSV | **Frontend Gap** | Wire button to backend export endpoint. |
| **Underwriting / Factoring** | Prototype `/(portal)/bank/underwriting` | Credit review queue for early factoring requests based on trust scores | **Domain Gap** | Evaluate regulatory compliance; align with Question #4. |

---

### 2.5. Admin / Platform Operator Role (`/dashboard/admin`)

| Element / Feature | Current State in Code | Target Production State | Gap Classification | Remediation Plan |
|:---|:---|:---|:---:|:---|
| **KPIs: Verification Queue** | Hardcoded `12 pending` in mock service | Real count of organizations with `kyb_status = 'SUBMITTED'` | **Data Gap** | Wire to `GET /api/v1/admin/kpis`. |
| **Subpage: Users (`/users`)** | Mock table of 8 users | Real table of all organizations and users with active/blocked toggles | **Functional Gap** | Wire to `GET /api/v1/admin/users`. |
| **Subpage: Verification (`/verification`)** | Mock dossier view | Review farm Guvohnoma, tax IDs, veterinary certificates, approve/reject | **Functional Gap** | Wire to `GET /api/v1/profiles/pending-kyb` and `POST approve/reject`. |
| **Subpage: Disputes (`/disputes`)** | Mock table | Review third-party lab counter-titration evidence and release/refund escrow | **Functional Gap** | Wire to `GET /api/v1/disputes` and `POST /api/v1/disputes/{id}/resolve`. |
| **System Settings (`/settings`)** | Prototype under `(portal)/admin` | Configurable pricing tolerance ($0.20\%$), regional baselines, audit export | **Functional Gap** | Unify under `/dashboard/admin/settings`. |

---

## 3. Legacy Route Fragmentation Inventory

The repository contains orphan prototype routes that must be consolidated into `/dashboard/*`:
- `frontend/src/app/(portal)/*`: Contains `/bank/dashboard`, `/bank/ledger`, `/bank/underwriting`, `/industry/*`, `/admin/*`.
- `frontend/src/app/(field)/*`: Contains `/farmer/*` and `/driver/*`.

**Architectural Decision:** All role dashboards must reside strictly under `/dashboard/{farmer,dairy,driver,bank,admin}/*`. All orphan `(portal)` and `(field)` folders must be safely deprecated and archived to eliminate security bypass vectors.
