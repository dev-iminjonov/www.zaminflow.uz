# ZaminFlow Claims Audit & Legal Truthfulness Review

**Document ID:** `DOC-CNT-003`  
**Squad:** Content Management Specialist & Compliance Lead  
**Status:** Audit Complete  
**Date:** 2026-11-08  

---

## 1. Audit Principles

In accordance with Section 5 of the Launch Squad Protocol:
- Every factual, financial, quality, and legal claim on the public website and customer-facing flows must be audited.
- Status categories:
  - **VERIFIED:** Backed by database queries, verified code logic, or executing smart contracts.
  - **NEEDS EVIDENCE:** Feasible or planned feature, but lacks signed external contract, telecom handshake, or hardware telemetry proof.
  - **REMOVE / RELABEL:** Unsupported claim, misleading live indicator, or speculative guarantee that presents commercial/legal risk.

---

## 2. Public Claims Register

| # | Exact Copy / Claim | Location | Claim Type | Status | Evidence / Analysis | Recommended Remediation |
|:---|:---|:---|:---:|:---:|:---|:---|
| **C-01** | *"Live Statistics: Real deals, real milk, real prices... refreshed every minute"* | `LandingLiveStatistics.tsx` L10-40 | Operational / Data | **VERIFIED** | Backed by `GET /api/v1/public/stats`, in-process TTL cache (60s), single-flight lock, querying Postgres directly. 0 fake numbers. | Retain as is. |
| **C-02** | *"Bank vault secured escrow"* / *"Bank locked"* | `HeroEcosystemVisual.tsx` L130 | Financial / Legal | **NEEDS EVIDENCE** | While the double-entry escrow ledger exists in PostgreSQL (`financial_ledger`), external automated escrow lock with a licensed Uzbek bank (e.g. Agrobank) requires commercial contract execution. | Relabel to *"Smart Escrow Account"* or *"Digital Escrow Protection"*. Avoid naming specific partner banks until formal signing. |
| **C-03** | *"Live pricing: 4,380 UZS / L (+12.4%)"* | `HeroEcosystemVisual.tsx` L41-65 | Market / Price | **REMOVE / RELABEL** | The floating card is a static UI asset with a blinking green dot (`animate-ping`). A competitor or farmer could perceive this as an active market quote. | Relabel the card header from *"Live Pricing"* to *"Sample Contract Pricing"* or wire it to the live daily average price from `/api/v1/public/stats`. |
| **C-04** | *"Logistics: Cold-chain locked • ETA 14 min"* | `HeroEcosystemVisual.tsx` L100-120 | Logistics / IoT | **NEEDS EVIDENCE** | Tanker GPS telematics table exists in schema, but physical OBD-II / BLE cold-chain sensors are not yet streaming in production. | Mark as *"Cold-Chain Telemetry (Demo Preview)"* or clarify that sensor tracking applies to participating fleet haulers. |
| **C-05** | *"Automated factoring within 24 hours"* | `authTranslations` & Farmer Dashboard | Financial / Lending | **NEEDS EVIDENCE** | Factoring formulas exist in `test_core_specifications.py`, but licensed bank factoring disbursement requires banking license or factoring partnership. | Frame factoring as *"Factoring Application Available"* rather than *"Guaranteed 24h Payout"*. |
| **C-06** | *"Auto-release upon titration"* | Hero & Feature List | Operational / Quality | **VERIFIED** | Backend code triggers escrow release when certified titration results (fat %, SNF %, temperature, acidity) are committed by an authorized lab tech (`LAB_TECH`). | Retain; clarify that release occurs upon authorized laboratory entry. |
| **C-07** | *"Platform Users: Whole number"* | `LandingLiveStatistics.tsx` | Telemetry / Scale | **VERIFIED** | Real-time aggregate count from `users` table excluding admins, test accounts, and deleted users. Shows exact database state (currently 0). | Retain; verified with automated pytest suite. |
| **C-08** | *"All data stored in accordance with Law ZRU-547"* | Footer & Legal notices | Compliance / Legal | **NEEDS EVIDENCE** | Architecture supports local deployment, but hosting infrastructure must be physically situated inside the Republic of Uzbekistan. | Await executive confirmation on hosting target (Question #2 & #3). |

---

## 3. Mandatory Copy Adjustments (Pre-Launch)

1. **Hero Bento Cards:** Replace simulated blinking `"Live pricing"` badge with an illustrative label (*"Platform Rate Indicator"* or link directly to the live statistics aggregate).
2. **Bank Claims:** Remove all references to specific uncontracted banks. Use standard term *"Partner Bank Escrow"* or *"Segregated Escrow Accounts"*.
3. **Contact Us:** Remove the non-functional `#privacy` anchor and link to a dedicated `/privacy` modal or page outlining data processing under Law ZRU-547.
