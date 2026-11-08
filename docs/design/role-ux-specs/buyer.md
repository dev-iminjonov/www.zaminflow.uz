# UI/UX Specification: Buyer (Dairy Industry) Dashboard

**Document ID:** `UX-SPEC-BUY-001`  
**Role:** Dairy Processing Plant (Procurement Manager, Quality Chemist, Plant Director)  
**Primary Device:** Desktop Workstation (1440px / 1920px widescreen, dual-monitor setup)  
**Environmental Context:** Climate-controlled procurement office and plant intake control room  

---

## 1. Information Architecture & Navigation

- **Layout Structure:** Fixed Left Sidebar (260px width), Top Global Utility Bar (Facility selector, Plant Intake Live Ticker, Notifications, Profile), Multi-column Content Area.
- **Sidebar Navigation Items:**
  1. **Bosh sahifa (Dashboard Overview):** Intake volume vs. capacity, daily spending, active deliveries.
  2. **Xom sut bozori (Supply Catalog):** Filterable farm listings, cooperative profiles, milk specs.
  3. **Shartnomalar (Contracts):** Bilateral supply agreements, pricing formulas, escrow funding status.
  4. **Logistika va Harorat (Fleet Telematics Map):** Live GIS map of inbound tankers with cold-chain telemetry.
  5. **Qabul va Laboratoriya (Intake & Titration):** Weighbridge volume intake, lab chemistry entry, batch certification.
  6. **Moliya va Eskrou (Finance & Escrow):** Bank escrow reserves, payment history, 1C accounting export.

---

## 2. Visual Hierarchy & Data-Dense Layout System

- **Layout Grid:** 12-column responsive desktop grid with 24px gutters.
- **Data Tables:**
  - Row height: `44px` compact mode with alternating row zebra-striping.
  - Column sorting, multi-attribute filter chips, pinned actions column.
  - Numeric alignment: Right-aligned tabular numerals (`font-feature-settings: 'tnum'`).
- **Color Coding:**
  - Intake Cold Chain OK ($< 4.0^\circ\text{C}$): Deep Green `#2d6a4f`
  - Warning ($4.1^\circ\text{C} - 5.5^\circ\text{C}$): Amber `#d97706`
  - Critical Excursion ($> 5.5^\circ\text{C}$ / Antibiotics Positive): Crimson `#dc2626`

---

## 3. Screen Breakdown & Key Views

### Screen BUY-SCR-01: Procurement Overview (`/dashboard/dairy`)
- **Top Metric Cards (4 Cards across top):**
  1. **Bugungi qabul hajmi:** `48,500 L / 60,000 L` (81% plant capacity, circular progress ring)
  2. **O'rtacha yog'lilik (Fat Avg):** `3.92%` (vs. standard 3.60%)
  3. **Depozitdagi eskrou qoldig'i:** `845,000,000 UZS` (Sufficient for 14 days)
  4. **Yo'ldagi sisternalar:** `4 ta faol tanker` (Estimated arrival: next 90 min)
- **Split View:**
  - Left (60%): Live Intake Schedule & Status Table.
  - Right (40%): GIS Minimap showing inbound collection routes converging on the dairy plant.

### Screen BUY-SCR-02: Bilateral Contract Form Modal
- **Contract Header:** Partner Cooperative ("Agro Baraka", Fergana), Term (6 months).
- **Interactive Formula Builder:**
  - Base Farm-Gate Price: `4,800 UZS / L`
  - Base Fat Standard: `3.60%` | Premium: `+120 UZS per +0.10% fat` | Penalty: `-150 UZS per -0.10% fat`
  - Base SNF Standard: `8.50%` | Premium: `+100 UZS per +0.10% SNF`
  - Acidity Ceiling: `18.0 °T` (Rejection if $> 20.0^\circ\text{T}$)
- **Escrow Commitment Calculator:**
  - `5,000 L / day × 30 days × 4,800 UZS = 720,000,000 UZS`
  - Bank Guarantee Lock CTA: "Shartnomani imzolash va eskrou depozitini band qilish"

### Screen BUY-SCR-03: Plant Lab Titration Entry Sheet
- **Batch Identifier:** Tanker `#ZF-TNK-04` | Batch `#ZF-1049` | Farm: Chashma Baraka
- **Lab Form Grid:**
  - O'lchangan hajm: `4,980 L` (avtomatik flow meter orqali)
  - Yog'lilik (Fat %): `3.95%` [Gerber centrifuge]
  - SOY / Quruq qoldiq (SNF %): `8.70%`
  - Titrlash kislotaligi: `16.5 °T`
  - Antibiotik testi: Toggle [Salbiy (Negative) / Ijobiy (Positive)]
- **Instant Settlement Calculation Preview:**
  - Quality Multiplier: `+420 UZS/L`
  - Yakuniy narx: `5,220 UZS / L`
  - Jami to'lov miqdori: `25,995,600 UZS`
- **Actions:**
  - Primary: "Tahlilni tasdiqlash va to'lovni chiqarish" (Requires Lab Chemist PIN)
  - Secondary: "Qayta tahlil uchun laboratoriyaga yuborish"
