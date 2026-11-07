# ZaminFlow Architecture & Dashboard Gaps Registry (`GAPS.md`)

This registry tracks all screens, actions, business rules, and workflows identified during the audit of the four role dashboards (`Farmer`, `Dairy Industry`, `Driver`, and `Admin`).

Status Legend:
- `open`: Audited and waiting for user specification/designs.
- `answered`: User provided rules, fields, or designs.
- `built`: Fully implemented, wired, and verified with production-grade code.

---

## 1. Farmer Dashboard Gaps (Gaps 1–6) — Status: 100% BUILT

| ID | Item / Screen | Location / Trigger | Status | Description & Implementation Link |
|:---|:---|:---|:---:|:---|
| **GAP-01** | My Milk Supply Inventory | Top Nav: `My milk` | `built` | Batch inventory with cold storage status, filter tabs, volume trackers, and live telemetry links at [`/dashboard/farmer/my-milk`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/farmer/my-milk/page.tsx). |
| **GAP-02** | Deliveries Log & History | Top Nav: `Deliveries` | `built` | 5-step milestone tracking stepper, tanker temperatures, driver contact info, and plant filters at [`/dashboard/farmer/deliveries`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/farmer/deliveries/page.tsx). |
| **GAP-03** | Payouts & Escrow Ledger | Top Nav: `Payouts` | `built` | Agrobank IBAN verification, itemized pricing formula table, locked vs settled balances, and XLSX tax export at [`/dashboard/farmer/payouts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/farmer/payouts/page.tsx). |
| **GAP-04** | "List Milk Supply" Form | Header CTA: `List milk supply →` | `built` | Multi-step listing wizard with live grade calculation, spot rate premium calculation, and instant publication at [`/dashboard/farmer/list-supply`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/farmer/list-supply/page.tsx). |
| **GAP-05** | Batch Telemetry Detail | Deliveries card: click batch row | `built` | Live GPS route visualizer, continuous IoT 2°–4°C temperature log graph, and official lab titration certificate at [`/dashboard/farmer/batches/[id]`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/farmer/batches/[id]/page.tsx). |
| **GAP-06** | Quality Dispute Protocol | Deliveries card: `Titration pending` | `built` | Farm vs. plant test variance breakdown, escrow freeze safeguard, and submission to the arbitration tribunal at [`/dashboard/farmer/dispute`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/farmer/dispute/page.tsx). |

---

## 2. Dairy Industry Dashboard Gaps (Gaps 7–12) — Status: 100% BUILT

| ID | Item / Screen | Location / Trigger | Status | Description & Implementation Link |
|:---|:---|:---|:---:|:---|
| **GAP-07** | Orders Management | Top Nav: `Orders` | `built` | Procurement contract pipeline, fulfillment percentage bars, and smallholder cooperative quotas at [`/dashboard/dairy/orders`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/dairy/orders/page.tsx). |
| **GAP-08** | Shipments Tracking Fleet | Top Nav: `Shipments` | `built` | Live incoming tanker fleet cards, cold-chain temperature telemetry, gate arrival ETAs, and receiving action at [`/dashboard/dairy/shipments`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/dairy/shipments/page.tsx). |
| **GAP-09** | Escrow Accounts & Funding | Top Nav: `Escrow` | `built` | Prefunded vault overview, locked vs available working capital, interactive wire deposit modal, and audit ledger at [`/dashboard/dairy/escrow`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/dairy/escrow/page.tsx). |
| **GAP-10** | "Place Order" Form | Header CTA: `Place order →` | `built` | Procurement wizard with volume target, required grade, price ceiling, and automated escrow capital calculator at [`/dashboard/dairy/place-order`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/dairy/place-order/page.tsx). |
| **GAP-11** | Gate Receiving & Titration Input | Shipments card: `At dairy` / `Titration pending` | `built` | Plant intake flow meter verification, lab spectrometer inputs (Fat %, SNF %, °T), and instant bank escrow release at [`/dashboard/dairy/receive-batch`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/dairy/receive-batch/page.tsx). |
| **GAP-12** | Regional Pricing Configurator | Right Card: `Supplier price, UZS/L` | `built` | Farm-gate spot price configurator across Andijan, Samarqand, Fergana, Namangan, and Tashkent with liquidity depth at [`/dashboard/dairy/regional-pricing`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/dairy/regional-pricing/page.tsx). |

---

## 3. Driver Dashboard Gaps (Gaps 13–18) — Status: 100% BUILT

| ID | Item / Screen | Location / Trigger | Status | Description & Implementation Link |
|:---|:---|:---|:---:|:---|
| **GAP-13** | My Trips Manifest | Top Nav: `My trips` | `built` | Stop-by-stop daily collection manifest with farm contacts, scheduled pickup times, and volume haulage at [`/dashboard/driver/my-trips`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/driver/my-trips/page.tsx). |
| **GAP-14** | Route Navigation Map | Top Nav: `Route` | `built` | Waypoint map route, live speed/ETA tracking, turn-by-turn guidance, and Yandex Navigator deep link at [`/dashboard/driver/route`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/driver/route/page.tsx). |
| **GAP-15** | Trip History & Distance | Top Nav: `History` | `built` | Complete mileage archive, kilometers logged, liters hauled, 100% cold-chain compliance rating, and compensation ledger at [`/dashboard/driver/history`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/driver/history/page.tsx). |
| **GAP-16** | "Start Next Trip" Pre-Check | Header CTA: `Start next trip →` | `built` | 4-point CIP sanitization checklist, internal tank chilling test (≤4°C), odometer input, and telemetry activation at [`/dashboard/driver/start-trip`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/driver/start-trip/page.tsx). |
| **GAP-17** | Confirm Pickup Verification | Active Trip card: `Confirm pickup` | `built` | Digital proof of pickup with pump flow meter reading, temperature reading, anti-tamper seal ID, and farmer OTP at [`/dashboard/driver/confirm-pickup`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/driver/confirm-pickup/page.tsx). |
| **GAP-18** | Incident & Delay Reporting | Active Trip card: `Report issue` | `built` | Emergency incident report for refrigeration unit alarms, breakdowns, highway closures, and automatic SLA timer pause at [`/dashboard/driver/report-issue`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/driver/report-issue/page.tsx). |

---

## 4. Admin Dashboard Gaps (Gaps 19–22) — Status: 100% BUILT

| ID | Item / Screen | Location / Trigger | Status | Description & Implementation Link |
|:---|:---|:---|:---:|:---|
| **GAP-19** | User Directory & Permissions | Top Nav: `Users` | `built` | Enterprise directory of 2,140 accounts with role tabs, search bar, TIN/INN, KYB status badges, and management actions at [`/dashboard/admin/users`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/admin/users/page.tsx). |
| **GAP-20** | Verification Review Queue | Top Nav: `Verification` & CTA: `Review queue →` | `built` | Priority KYB queue showing pending dossiers, submission times, Soliq.uz automated TIN checks, and review links at [`/dashboard/admin/verification`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/admin/verification/page.tsx). |
| **GAP-21** | Disputes Arbitration Center | Top Nav: `Disputes` | `built` | Formal arbitration tribunal for contested titration grades and frozen escrow, with 1-click binding settlement rulings at [`/dashboard/admin/disputes`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/admin/disputes/page.tsx). |
| **GAP-22** | Individual KYB Review Drawer | Queue rows: `Review` button | `built` | Document inspection workspace with Soliq tax verification, bank IBAN validation, health passports, and approval/rejection at [`/dashboard/admin/verification/[id]`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/dashboard/admin/verification/[id]/page.tsx). |

---

## 5. Global & Business Rules Gaps (Gaps 23–26) — Status: 100% BUILT

| ID | Domain | Status | Description & Implementation Link |
|:---|:---|:---:|:---|
| **GAP-23** | Quality-Price Valuation Matrix | `built` | Mathematical formula converting Base Spot Rate + Butterfat % + Solids-Not-Fat (SNF) % - Acidity (°T) into settlement UZS/L in [`businessRulesEngine.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/businessRulesEngine.ts). |
| **GAP-24** | Escrow Banking Settlement Engine | `built` | 100% prefunding lock upon order creation, milestone custody locking, and instant IBAN payout upon gate lab pass in [`businessRulesEngine.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/businessRulesEngine.ts). |
| **GAP-25** | Cold-Chain SLA & Breach Penalties | `built` | 2.0°–4.0°C optimal range rules, warning thresholds for <45m excursions, and 15% deduction/re-test triggers in [`businessRulesEngine.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/businessRulesEngine.ts). |
| **GAP-26** | Real-Time Notification System | `built` | Telegram bot and SMS dispatch event generator for milk collection, arrival notices, lab test results, and escrow releases in [`businessRulesEngine.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/businessRulesEngine.ts). |
