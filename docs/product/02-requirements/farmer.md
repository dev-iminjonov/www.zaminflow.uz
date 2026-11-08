# ZaminFlow Functional Requirements: Farmer Dashboard

**Document ID:** `DOC-REQ-FAR-001`  
**Role:** Farmer / Agricultural Cooperative  
**Canonical Route:** `/dashboard/farmer`  
**Target Viewports:** Mobile-First (360px–390px, responsive to 1440px)  
**Squad Leads:** Product Manager, Frontend Specialist, Backend Specialist  
**Status:** Approved Specification  

---

## 1. Role Capabilities & Security Boundary

- **Identity:** User associated with an organization where `role = 'FARMER'`.
- **Tenancy Boundary:** A farmer user can ONLY view batches, contracts, payouts, and lab titration results where `c.farmer_id = current_user.organization_id`.
- **Restricted Access:** Farmers cannot view other farmers' supply volumes, private buyer prices, unassigned driver telematics, or bank escrow ledger reserves.

---

## 2. User Stories & Given/When/Then Acceptance Criteria

### Story FAR-01: View Live Farm-Gate Price & Daily Status
- **As a** dairy farmer,
- **I want to** see today's baseline raw milk price and quality grade premiums immediately upon opening the dashboard,
- **So that** I know the commercial value of my morning milk batch before tanker pickup.

```gherkin
Scenario: Successful display of live farm-gate price
  Given I am logged in as a verified Farmer
  When I navigate to "/dashboard/farmer"
  Then I see the "Today's Price" KPI card displaying the volume-weighted average price in UZS / L
  And I see the standard quality grade benchmarks (Grade A+ fat >= 4.0%, SNF >= 8.6%)
  And the data is loaded from the backend API within 800ms
```

### Story FAR-02: List Daily Raw Milk Supply (GAP-04)
- **As a** dairy farmer,
- **I want to** submit my daily available milk volume, cooling tank temperature, and collection window,
- **So that** partner dairies can schedule tanker collection and lock escrow.

```gherkin
Scenario: Farmer lists milk volume for collection
  Given I have a verified farm profile
  When I click "+ List Supply" and enter volume "1,500 L", cooling temp "3.2°C", session "Morning"
  And I submit the supply form
  Then a new batch record is created with status "STORED"
  And the batch appears in my "My Milk" inventory table
  And an in-app confirmation displays the estimated escrow payout calculation
```

### Story FAR-03: Track Live Tanker Pickup & Route (GAP-02)
- **As a** dairy farmer,
- **I want to** see when the milk collection tanker is arriving and view driver details,
- **So that** I can prepare the cooling vat discharge valve.

```gherkin
Scenario: Real-time pickup status tracking
  Given I have a scheduled batch "ZF-0412" assigned to a tanker
  When I open the "Deliveries" subview
  Then I see the assigned driver's name, vehicle plate, and current cold-chain temperature
  And if the tanker is within 30 minutes, an estimated arrival badge is shown
```

### Story FAR-04: View Titration Quality Results & Escrow Payout (GAP-03)
- **As a** dairy farmer,
- **I want to** review certified lab titration results (fat %, SNF %, acidity °T) and the resulting payout calculation,
- **So that** I have full proof of quality and can verify that payment was unlocked.

```gherkin
Scenario: Dairy completes titration test
  Given a batch delivered to the dairy plant has status "SETTLED"
  When I view the batch details
  Then I see the verified laboratory measurements (e.g. Fat 4.10%, SNF 8.70%, Acidity 16.5°T)
  And I see the itemized price breakdown (base price + quality premium - zero penalty)
  And the escrow status shows "RELEASED" with partner bank transfer reference
```

### Story FAR-05: Dispute Divergent Titration Results (GAP-06)
- **As a** dairy farmer,
- **I want to** open an arbitration dispute if the dairy's lab report diverges by $>0.20\%$ from my dispatch baseline,
- **So that** my payment is not improperly penalized.

```gherkin
Scenario: Opening a titration dispute
  Given a batch has lab titration results that deviate from farm counter-sample
  When I click "Raise Dispute" on the batch view within 48 hours
  And I upload counter-sample photos and vial code
  Then the batch escrow payout is flagged "DISPUTE_FROZEN"
  And an urgent arbitration ticket is created in the Admin queue
```

---

## 3. UI States Specification

- **Loading State:** Shimmer skeleton matching 4 KPI cards and 3 table rows.
- **Empty State:** Friendly graphic of milking pail with text: *"Hozircha faol sut partiyalari mavjud emas. Birinchi partiyangizni qo'shing."* and CTA button `+ Sut partiyasini qo'shish`.
- **Error State:** Banner alert with retry action: *"Ma'lumotlarni yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring."*
- **Offline State:** Banner indicator: *"Oflayn rejim. So'nggi saqlangan ma'lumotlar ko'rsatilmoqda."*
- **Pending Verification State:** Amber warning card: *"Hisobingiz tekshirilmoqda. To'liq savdo qilish uchun ma'muryat tasdig'i kutilmoqda (24 soatgacha)."*

---

## 4. Out-of-Scope (Deferred to Post-Launch)
- Multi-currency conversion (platform operates strictly in UZS).
- Live camera video streaming of dairy lab testing.
- Automated cattle ear-tag Bluetooth synchronization.
