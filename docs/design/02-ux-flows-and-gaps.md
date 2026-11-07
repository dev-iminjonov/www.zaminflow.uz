# ZaminFlow UX Flows, Role Journeys & Gaps Inventory

**Document ID:** `DOC-DSGN-003`  
**Reference:** `GAPS.md` and Design Review  

---

## 1. Role-Specific User Journeys

### 1.1 Smallholder Farmer Journey
- **Sign-Up & Verification:** Mobile phone number entered $\rightarrow$ SMS code verified $\rightarrow$ Farm name & region specified $\rightarrow$ Lands on `/dashboard/farmer`.
- **First Value:** Farmer views regional milk price index (e.g. 4,500 UZS/L) and lists available morning volume (e.g. 250 Liters).
- **Pickup & Handshake:** Logistics driver arrives $\rightarrow$ Farmer displays cryptographic QR code $\rightarrow$ Driver scans QR and verifies temperature $\le 8^\circ\text{C}$ $\rightarrow$ Milk transferred to tanker.
- **Settlement & Payout:** Dairy lab records acidity and fat test $\rightarrow$ Escrow released $\rightarrow$ Farmer receives payout notification.

### 1.2 Tanker Driver Journey
- **Trip Initialization:** Driver signs in $\rightarrow$ Views assigned collection route with geofenced pickup stops $\rightarrow$ Starts trip.
- **Collection Stops:** Arrives at farm stop $\rightarrow$ Performs milk visual check $\rightarrow$ Scans farmer's QR token $\rightarrow$ Logs temperature.
- **Plant Gate Handover:** Arrives at Dairy processing plant gate $\rightarrow$ Generates gate handover QR $\rightarrow$ Gate receiver scans and admits truck to discharge bay.

### 1.3 Dairy Processing Plant Journey
- **Procurement & Contracting:** Dairy views verified local farms within 40km radius $\rightarrow$ Sends digital supply contract $\rightarrow$ Locks escrow in partner bank.
- **Quality Intake (Lab Tech):** Tanker discharges milk into receiving silo $\rightarrow$ Lab technician enters titration acidity ($^\circ\text{T}$), fat %, SNF % $\rightarrow$ Automated quality pricing calculation releases bank escrow to farmer.

### 1.4 Admin Journey
- **KYB Approval:** Admin reviews uploaded legal certificates and tax IDs in `/dashboard/admin/verification`.
- **Dispute Resolution:** In case of temperature breach or titration disagreement, admin reviews third-party arbitration vial test results and executes split payout.

---

## 2. Gaps Protocol Inventory & Current Status

In accordance with the **Gaps Protocol**, placeholder screens are deployed for un-designed subflows rather than inventing speculative designs:

| Gap ID | Role | Referenced Action | Status in Code | Default Spec if Unspecified |
| :---: | :--- | :--- | :---: | :--- |
| **GAP-01** | Farmer | "List milk supply" button | Wired placeholder (`/dashboard/farmer/list-supply`) | Single-page modal: Declared volume (L), available date/time window, cooling tank temperature. |
| **GAP-02** | Farmer | "My milk" navigation link | Wired placeholder (`/dashboard/farmer/my-milk`) | Historical table of past collection batches, titration test scores, and payouts. |
| **GAP-03** | Farmer | "Deliveries & Payouts" links | Wired placeholders (`.../deliveries`, `.../payouts`) | Summary ledger of completed escrow transfers and bank wire statuses. |
| **GAP-04** | Dairy | "Place order" button | Wired placeholder (`/dashboard/dairy/place-order`) | Procurement contract creation form with target volume and base price. |
| **GAP-05** | Dairy | "Receive batch" button | Wired placeholder (`/dashboard/dairy/receive-batch`) | Lab titration entry form (Acidity, Fat, SNF, Antibiotics). |
| **GAP-06** | Driver | "Start next trip" button | Wired placeholder (`/dashboard/driver/start-trip`) | Route overview map with sequence of farmer collection pins. |
| **GAP-07** | Driver | "Report issue" button | Wired placeholder (`/dashboard/driver/report-issue`) | Breakdown/temperature breach report form with photo upload. |
| **GAP-08** | Admin | "Verification review" link | Implemented (`/dashboard/admin/verification/[id]`) | Detailed KYB audit view with document preview and approve/reject actions. |
