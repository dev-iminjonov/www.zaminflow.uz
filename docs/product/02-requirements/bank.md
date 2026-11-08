# ZaminFlow Functional Requirements: Bank & Escrow Dashboard

**Document ID:** `DOC-REQ-BNK-001`  
**Role:** Partner Bank Compliance Officer / Escrow Custodian / Trade Finance Manager  
**Canonical Route:** `/dashboard/bank` (or `/bank`)  
**Target Viewports:** Desktop Enterprise (1440px / 1920px widescreen, dual-monitor financial workstation)  
**Squad Leads:** Security Engineer & Compliance Specialist, Backend Specialist, Product Manager  
**Status:** Approved Specification  

---

## 1. Role Capabilities & Security Boundary

- **Identity:** User associated with an organization where `role = 'BANK'`.
- **Tenancy Boundary:** Bank users have read/audit and execution access over:
  - All escrow allocation accounts, reserve balances, and settlement ledger entries (`financial_ledger`).
  - KYB/KYC verification verification packs for institutional borrowers/buyers.
  - ISO 20022 payment message generator and Central Bank of Uzbekistan (CBU) compliance audit logs.
- **Restricted Access:**
  - Cannot alter farm titration chemistry lab results (separation of duties).
  - Cannot modify transport logistics routes or cold-chain telematics.
  - Cannot delete or overwrite financial ledger rows (immutable append-only constraint).

---

## 2. User Stories & Acceptance Criteria

### Story BNK-01: Live Escrow Liquidity & Collateral Solvency Overview
- **As a** partner bank escrow custodian,
- **I want to** monitor total escrow reserves, locked pre-funding commitments, pending settlement liabilities, and daily net payouts,
- **So that** bank liquidity is guaranteed and zero unsettled obligations occur.

```gherkin
Scenario: View daily escrow reserve position
  Given I am logged in as an authorized Bank officer
  When I load "/dashboard/bank"
  Then the Liquidity Summary cards display:
    | Metric                     | Value Example      |
    | Total Escrow Reserve Pool  | 14,850,000,000 UZS |
    | Locked Active Contracts    | 9,200,000,000 UZS  |
    | Released Payouts (Today)   | 1,420,000,000 UZS  |
    | Unallocated Buffer Liquidity| 4,230,000,000 UZS  |
  And the ledger health indicator confirms 100% cryptographic checksum reconciliation
```

### Story BNK-02: Escrow Lock, Release & Auto-Disbursement Audit
- **As a** bank risk auditor,
- **I want to** review every automatic escrow state transition triggered by intake plant lab certifications,
- **So that** disbursements follow banking law and bilateral contract covenants.

```gherkin
Scenario: Audit an automated escrow release
  Given batch "ZF-0892" was certified at Tashkent Dairy plant
  When I search transaction ref "TX-ESC-20261108-0041" in the Bank Ledger
  Then I see the exact immutable transaction sequence:
    1. ESCROW_LOCKED on contract signature (debit buyer operational account, credit escrow reserve)
    2. INTAKE_CERTIFIED with titration hash matching plant lab report
    3. ESCROW_RELEASED (credit farmer account, debit escrow reserve)
  And the associated audit log shows user ID, timestamp, and client IP
```

### Story BNK-03: Supply Chain Factoring & Working Capital Financing (Launch-Deferred / Phase 2)
- **As a** commercial bank trade finance officer,
- **I want to** evaluate verified milk delivery history and quality scorecards of agricultural cooperatives,
- **So that** the bank can extend pre-approved working capital micro-loans or invoice factoring with automated escrow repayment deductions.

```gherkin
Scenario: Factoring eligibility check
  Given a farmer cooperative with 180 consecutive days of Grade A milk deliveries and zero defaults
  When they apply for working capital feed financing
  Then the bank portal generates an automated credit solvency profile
  And if approved, factoring advances 80% against verified in-transit batches
  And loan service payments are automatically deducted at batch escrow release
```

### Story BNK-04: Central Bank Regulatory Audit & ISO 20022 Export
- **As a** bank compliance officer,
- **I want to** export Central Bank of Uzbekistan (CBU) structured XML transaction journals and ISO 20022 `pacs.008` payment settlement instructions,
- **So that** daily clearing complies with national banking regulations.

```gherkin
Scenario: Export daily ISO 20022 clearing file
  Given 42 batches were settled today across the platform
  When I click "Generate Daily ISO 20022 Clearing Batch"
  Then an XML payload compliant with `pacs.008.001.08` is created
  And the SHA-256 integrity hash is logged to the immutable audit trail
  And the file downloads securely with double-factor confirmation
```

---

## 3. UI States Specification

- **Loading State:** Monospace financial table skeleton with loading indicators on KPI currency figures.
- **Audit Verification State:** Green shield badge: *"Ledger Integrity Verified: 0 Cheating / 0 Discrepancies"*.
- **Dispute Freeze State:** Flashing crimson badge next to any transaction under arbitration: *"FROZEN - ARBITRATION ACTIVE - DISBURSEMENT BLOCKED"*.
- **Empty State:** Neutral financial summary card: *"Bugungi sana uchun yangi tranzaksiyalar mavjud emas."*
