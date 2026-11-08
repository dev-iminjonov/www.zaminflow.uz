# ZaminFlow Functional Requirements: Driver Dashboard

**Document ID:** `DOC-REQ-DRI-001`  
**Role:** Milk Collection Logistics Driver / Tanker Fleet Operator  
**Canonical Route:** `/dashboard/driver` (or `/driver`)  
**Target Viewports:** Mobile Outdoor First (360px–412px, high contrast for direct sunlight, touch targets >= 48px)  
**Squad Leads:** GIS & Mobile Specialist, Frontend Specialist, Backend Specialist  
**Status:** Approved Specification  

---

## 1. Role Capabilities & Security Boundary

- **Identity:** User associated with an organization where `role = 'DRIVER'`.
- **Tenancy Boundary:** A driver can ONLY access:
  - Dispatched pickup/drop-off route waypoints assigned to their user ID or vehicle ID.
  - Active batch custody handover forms for batches in their vehicle.
  - Their assigned tanker compartment telemetry readings.
- **Restricted Access:**
  - Cannot access commercial financial terms, contract prices, or dairy plant margins.
  - Cannot alter past GPS breadcrumbs or cold-chain temperature history.
  - Cannot reassign routes or view other drivers' unassigned trips unless granted Fleet Manager sub-role.

---

## 2. User Stories & Acceptance Criteria

### Story DRI-01: View Daily Milk Collection Route & Stops
- **As a** collection tanker driver,
- **I want to** see my optimized route list for today with farmer stop order, volumes to collect, and navigation links,
- **So that** I can complete the morning milk collection circuit before ambient temperatures peak.

```gherkin
Scenario: Daily collection route display
  Given I am logged in as an active Driver
  When I open the driver app at 05:30 AM
  Then I see "Today's Route: Circuit Samarkand-North (6 stops, 9,500 L planned)"
  And each stop card lists Farm Name, Village, Contact Phone, Planned Volume, and "Navigate" button (Yandex/Google Maps deep-link)
  And my current vehicle compartment temperature is shown in green (e.g. "3.4°C - Cold Chain OK")
```

### Story DRI-02: Farm Gate Pickup & Digital Custody Handover (GAP-02)
- **As a** collection tanker driver,
- **I want to** scan the farmer's batch QR code, verify dipstick volume and vat temperature, and sign the digital custody handover,
- **So that** liability for the milk transfers legally to the logistics fleet.

```gherkin
Scenario: Farmer pickup scanning and digital signature
  Given I have arrived at Farm Stop #2 ("Chashma Agrofirma")
  When I tap "Start Pickup" and scan the farmer's displayed QR code
  And I enter Dipstick Volume: "1,200 L", Vat Discharge Temp: "3.6°C", Alcohol Test: "Pass"
  And both the farmer and I sign on the mobile touch canvas
  Then a signed digital consignment note (e-TTN) is generated
  And the batch status updates to "IN_TRANSIT"
  And the next stop navigation unlocks automatically
```

### Story DRI-03: Real-Time Cold-Chain Telematics & Temperature Alerting (GAP-02)
- **As a** milk tanker driver,
- **I want to** receive immediate audio and high-contrast visual alerts if my refrigerated tank exceeds $4.0^\circ\text{C}$,
- **So that** I can inspect the chiller compressor before the milk spoils or is rejected at the plant.

```gherkin
Scenario: Cold-chain temperature exceedance warning
  Given the tanker is traveling on highway M39 towards Tashkent Dairy
  When the compartment temperature sensor reports 4.6°C for more than 5 consecutive minutes
  Then a high-priority vibrating audio alert fires
  And the mobile screen switches to a high-contrast amber warning banner: "CHILLER WARNING: 4.6°C! Check compressor unit."
  And an incident report timestamp is dispatched to plant logistics dispatch
```

### Story DRI-04: Offline Waypoint Execution & Store-and-Forward Sync
- **As a** driver operating in remote rural areas with zero cellular connectivity,
- **I want to** execute pickups, log dipstick volumes, and capture offline signatures without network errors,
- **So that** collection is never halted by dead cellular zones.

```gherkin
Scenario: Offline pickup completion and background synchronization
  Given my phone has 0 bars cellular service (No Internet)
  When I execute a pickup at Farm #4 and tap "Confirm Pickup Offline"
  Then the transaction is cryptographically signed and stored in local IndexedDB
  And the stop is marked with a grey "Queued for Sync" badge
  And when cellular connectivity resumes (LTE/3G detected)
  Then the queued pickups are automatically synced to the backend within 10 seconds
  And the status flips to green "Synced to Cloud"
```

### Story DRI-05: Plant Bay Discharge & Drop-off Confirmation
- **As a** tanker driver arriving at the dairy processing facility,
- **I want to** present the consolidated delivery QR code to the plant intake chemist,
- **So that** intake flow meters can receive the milk and release me from custody.

```gherkin
Scenario: Plant intake discharge handover
  Given I have completed all 6 stops and arrived at Dairy Intake Bay 1
  When I tap "Complete Route & Handover to Plant"
  Then a consolidated handover QR code is rendered on my screen
  And when scanned by the plant chemist, custody transfers to the dairy
  And my route status transitions to "COMPLETED"
```

---

## 3. UI States Specification

- **Sunlight Mode (High-Contrast):** Ultra-high contrast design with black text on white backgrounds or pure dark slate, 48px minimum touch buttons, large 28px numeric readouts for temperature and volume.
- **Offline Mode Indicator:** Persistent floating pill at bottom: *"Oflayn rejim (2 ta qabul xotirada saqlandi)"*.
- **Syncing State:** Spinning upload icon when returning to network coverage.
- **Empty / Off-Duty State:** Card stating: *"Bugun uchun faol marshrut tayinlanmagan. Dispetcher bilan bog'laning."* with a quick "Call Dispatch" button.
