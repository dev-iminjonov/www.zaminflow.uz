# ZaminFlow Functional Requirements: Admin Dashboard

**Document ID:** `DOC-REQ-ADM-001`  
**Role:** ZaminFlow Platform Administrator & Operations Arbitrator  
**Canonical Route:** `/dashboard/admin` (or `/admin`)  
**Target Viewports:** Desktop Operational (1440px / 1920px)  
**Squad Leads:** Backend Specialist, Security Engineer, Product Manager  
**Status:** Approved Specification  

---

## 1. Role Capabilities & Security Boundary

- **Identity:** User associated with an organization where `role = 'ADMIN'`.
- **System Authority:** Platform admins oversee:
  - Organization verification (KYC/KYB document validation for Farmers, Dairies, Logistics, Banks).
  - Dispute arbitration queue (investigating titration variances between farm counter-sample and plant lab).
  - System health, background worker queues, cold-chain anomaly monitoring, and audit log inspection.
- **Strict Constraints:**
  - **Zero Self-Registration:** Admin accounts can NEVER be created through the public sign-up flow. Creation requires seed script or super-admin database privilege.
  - **No Silent Ledger Manipulation:** Admins CANNOT silently edit financial ledger rows. Any balance adjustment requires a signed arbitration journal entry with reference to a dispute docket.

---

## 2. User Stories & Acceptance Criteria

### Story ADM-01: Organization KYB/KYC Verification & Gating
- **As a** platform operations administrator,
- **I want to** review submitted business registrations, veterinary certificates, and tax IDs (STIR/INN) for newly registered farmers and dairy plants,
- **So that** only legitimate agricultural entities can trade on ZaminFlow.

```gherkin
Scenario: Approve a farmer cooperative registration
  Given an agricultural cooperative has registered and uploaded INN certificate and veterinary license
  When I open the "Pending Approvals" queue in `/dashboard/admin`
  And I inspect the documents against the State Tax Committee registry
  And I click "Verify & Activate Organization"
  Then the organization status transitions to "ACTIVE"
  And the primary user receives an SMS/Email notification: "Hisobingiz muvaffaqiyatli tasdiqlandi"
  And trading features are unlocked for that organization
```

### Story ADM-02: Quality Dispute Arbitration & Escrow Release Resolution (GAP-06)
- **As an** arbitration specialist,
- **I want to** review disputes where a dairy's lab report diverges by $>0.20\%$ from a farmer's certified counter-sample, examine accredited 3rd-party lab results, and render a binding verdict,
- **So that** escrow funds are distributed justly.

```gherkin
Scenario: Resolve an acidity/fat dispute with independent laboratory test
  Given dispute "DISP-2026-088" has frozen batch "ZF-0941" (18,400,000 UZS in dispute)
  When I review the independent Uzstandard laboratory counter-test report
  And I set the final binding parameters: Fat=3.85%, Acidity=17.0°T
  And I click "Execute Settlement Arbitration"
  Then the escrow engine recalculates payout according to the original contract formula
  And the exact split is released to the farmer and buyer
  And the dispute docket is permanently sealed with full audit logging
```

### Story ADM-03: Real-Time Logistics Telematics & Cold-Chain Fleet Heatmap
- **As a** platform logistics manager,
- **I want to** observe all active milk collection routes across Uzbekistan in real-time,
- **So that** transit delays, route deviations, and refrigeration failures can be resolved proactively.

```gherkin
Scenario: Real-time telemetry monitoring and emergency rerouting
  Given 18 milk collection tankers are active in Tashkent and Samarkand regions
  When I view the "Fleet Operations" map
  Then all tanker vectors, current speeds, compartment temperatures, and route progress are rendered
  And clicking any tanker displays driver contact, assigned batches, and current route ETA
```

### Story ADM-04: System Audit Trail & Security Incident Response
- **As a** platform security officer,
- **I want to** query immutable audit logs by user, action, IP address, and resource ID,
- **So that** any suspicious authentication attempts, permission violations, or financial anomalies can be investigated immediately.

```gherkin
Scenario: Query audit logs for privilege escalation attempts
  Given an anonymous or low-privilege user attempted to access `/api/v1/bank/ledger`
  When I filter audit logs by `action = 'UNAUTHORIZED_ACCESS_ATTEMPT'`
  Then the log displays User ID, Source IP, User-Agent, Attempted Route, and Timestamp
  And a single click can freeze the offending session or IP range
```

---

## 3. UI States Specification

- **Operational Health Overview:** Top banner displaying platform health (API latency, active DB connections, Celery/Redis queue depth, failed jobs = 0).
- **Dispute Queue Alert:** Persistent counter badge in navigation (e.g. `Arbitration (2 active)`).
- **Empty Queues State:** Green celebration badge: *"Barcha tasdiqlar va nizolar ko'rib chiqilgan. Yangi vazifalar yo'q."*
