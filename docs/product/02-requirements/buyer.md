# ZaminFlow Functional Requirements: Buyer (Dairy Industry) Dashboard

**Document ID:** `DOC-REQ-BUY-001`  
**Role:** Dairy Processing Industry (Procurement Manager, Quality Lab Specialist, Plant Finance)  
**Canonical Route:** `/dashboard/dairy` (or `/dairy`)  
**Target Viewports:** Desktop-First (1440px / 1280px, responsive to tablet 768px)  
**Squad Leads:** Product Manager, Frontend Specialist, Backend Specialist  
**Status:** Approved Specification  

---

## 1. Role Capabilities & Security Boundary

- **Identity:** User associated with an organization where `role = 'INDUSTRY'`.
- **Tenancy Boundary:** A buyer organization can ONLY view:
  - Supply contracts where `c.buyer_id = current_user.organization_id`.
  - Delivery batches assigned to their contracts or intake plant.
  - Lab titration intake sheets logged by their plant chemists.
  - Escrow allocations deposited from their organization's corporate bank account.
- **Restricted Access:** 
  - Cannot view other dairy processors' contract rates, purchase volumes, or supplier lists.
  - Cannot access Bank reserve vaults or system-wide admin user manipulation endpoints.
  - Cannot alter a driver's raw GPS/cold-chain telematics records retroactively.

---

## 2. User Stories & Acceptance Criteria

### Story BUY-01: Real-Time Raw Milk Procurement Feed & Filterable Catalog
- **As a** dairy procurement manager,
- **I want to** search and filter verified milk supply batches by region (Samarkand, Tashkent, Fergana), certified fat/SNF specs, and volume,
- **So that** I can secure continuous raw milk supply matching plant processing capacity.

```gherkin
Scenario: Filter available raw milk batches by volume and fat content
  Given I am logged in as a verified Dairy Industry user
  When I navigate to the "Supply Catalog" tab
  And I apply filters: Region="Tashkent Viloyati", Min Fat="3.8%", Min Daily Volume="2,000 L"
  Then the data table updates within 300ms showing matching verified farms
  And each row displays Farm Name, Location, Daily Capacity, Grade Rating, and Cooling Vat Temp (<=4.0°C)
  And clicking "Initiate Contract" opens the contract creation modal
```

### Story BUY-02: Bilateral Supply Contract & Quality Pricing Rule Agreement
- **As a** dairy procurement officer,
- **I want to** establish forward supply contracts specifying baseline price per liter (UZS), base fat (e.g. 3.6%), base SNF (8.5%), and step premium/penalty tiers (e.g. +150 UZS per 0.1% fat above base, -200 UZS penalty below 3.4%),
- **So that** payment calculations upon delivery are 100% deterministic and legally auditable.

```gherkin
Scenario: Propose a quality-indexed supply contract
  Given I select an agricultural cooperative "Agro Baraka"
  When I draft a contract specifying:
    | Parameter      | Value                  |
    | Start Date     | 2026-12-01             |
    | End Date       | 2027-05-31             |
    | Daily Target   | 5,000 L                |
    | Base Price     | 4,800 UZS / L          |
    | Fat Premium    | 120 UZS per 0.1% fat   |
    | SNF Premium    | 100 UZS per 0.1% SNF   |
    | Max Acidity    | 18.0 °T                |
  And I click "Submit & Lock Escrow Guarantee"
  Then the contract enters status "PENDING_FARMER_ACCEPTANCE"
  And the partner bank reserves 15 days worth of escrow deposit (360,000,000 UZS)
```

### Story BUY-03: Live Inbound Logistics & Cold-Chain Telematics Fleet Map
- **As a** dairy plant operations controller,
- **I want to** view an interactive GIS map displaying all inbound milk collection tankers en route to our processing facility,
- **So that** plant intake bays can be prepared and temperature violations detected before unloading.

```gherkin
Scenario: Inbound milk tanker temperature alert
  Given tanker "ZF-TNK-09" is transporting 12,000 L with an estimated arrival in 45 minutes
  When the tanker's cold-chain telematics reports a compartment temperature of 5.8°C (threshold: 4.5°C)
  Then the fleet map marker turns amber/red with an audible warning
  And an alert is appended to the Plant Intake Queue: "Thermal Excursion: Tanker #09 (5.8°C for 22 min)"
  And the intake chemist is prompted to quarantine the batch for acidity titration
```

### Story BUY-04: Digital Plant Intake & Certified Lab Titration Entry (GAP-03)
- **As a** plant laboratory technician,
- **I want to** enter verified intake measurements (volume received via flow meter, fat %, SNF %, titration acidity °T, density, antibiotic test) into the digital intake certificate,
- **So that** the settlement formula executes and escrow payment is calculated.

```gherkin
Scenario: Certified titration result entry and auto-settlement
  Given tanker "ZF-TNK-09" arrives at Bay 2 with Batch "BATCH-8902"
  When the lab technician enters:
    | Parameter         | Measurement |
    | Gross Volume      | 4,950 L     |
    | Fat Percentage    | 3.90 %      |
    | SNF Percentage    | 8.65 %      |
    | Acidity           | 16.5 °T     |
    | Antibiotics       | NEGATIVE    |
  And clicks "Certify & Settle" with cryptographic technician PIN
  Then the system computes: Final Unit Price = 5,160 UZS/L (Base 4,800 + 360 premium)
  And Total Settlement Value = 25,542,000 UZS
  And the batch status updates to "SETTLED"
  And an escrow release instruction is dispatched to the Partner Bank API
```

### Story BUY-05: Escrow Funding, Bank Reconciliation & VAT Invoice Export
- **As a** dairy plant financial controller,
- **I want to** monitor the pre-funded escrow reserve account, replenish funds via B2B banking rails, and export 1C/Soliq-compliant settlement ledgers,
- **So that** tax documentation and supplier accounts payable are fully reconciled.

```gherkin
Scenario: Export monthly settled raw milk transactions for 1C accounting
  Given I am in the "Finance & Escrow" dashboard tab
  When I select the date range "2026-10-01 to 2026-10-31" and format "1C Enterprise XML / Excel"
  And I click "Export Settlement Register"
  Then a structured ledger report downloads within 1.5s
  And the report includes Contract ID, Farmer TIN, Batch Code, Certified Volume, Quality Adjustments, Escrow Release Ref, and VAT Breakdown
```

---

## 3. UI States Specification

- **Loading State:** Data-dense table skeleton with active pagination and filter dropdown shimmers.
- **Empty State:** High-contrast illustration of processing facility with text: *"Hozircha faol shartnomalar yoki kiruvchi yuklar yo'q. Yangi ta'minotchilar bilan shartnoma tuzing."* and CTA `+ Yangi shartnoma tuzish`.
- **Error State:** In-table inline alert banner with diagnostic error code and instant "Qayta yuklash" action.
- **Critical Alert State:** Red blinking banner across top of intake view if incoming tanker temperature exceeds $6.0^\circ\text{C}$ or antibiotic test returns POSITIVE.
