# Prioritized UI Artboards to Draw on Design Canvas

**Document ID:** `UX-ART-CANVAS-001`  
**Purpose:** Precise, prioritized specification of screens to be drawn or updated on the Claude/Figma design canvas (`https://claude.ai/artifact/EYvbNngzSf4AdoQ5y84bca`).

---

## 1. Prioritized Artboard Inventory

| Priority | Artboard Name | Target Role | Viewport | Key States to Render | Primary Data Elements |
|---|---|---|---|---|---|
| **P0 (Must)** | `Farmer-Mobile-Home` | Farmer | 375 × 812 (Mobile) | Normal, Active Batch In-Transit, Empty | Live Farm-Gate Price (UZS/L), "+ Sut qo'shish" CTA, Batch Status Stepper, Quick Earnings |
| **P0 (Must)** | `Buyer-Desktop-Intake` | Dairy Buyer | 1440 × 900 (Desktop) | Normal, Thermal Warning, Titration Certified | Inbound Tanker Queue, Compartment Temp Gauge (3.4°C vs 5.2°C), Flow Meter Gross Liters, Titration Form (Fat, SNF, °T, Antibiotics) |
| **P0 (Must)** | `Driver-Mobile-Route` | Driver | 375 × 812 (Mobile) | High-Contrast Sunlight, Offline Warning | Cold-chain temp badge (3.2°C), Route Stop Cards, One-tap Navigation, "+ Qabulni boshlash" |
| **P0 (Must)** | `Driver-Pickup-Handover` | Driver | 375 × 812 (Mobile) | Camera Scan Active, Dual Signature Canvas | QR Viewfinder, Dipstick Liters input, Alcohol Test pass toggle, Farmer & Driver touch signature pads |
| **P1 (Should)**| `Bank-Desktop-Escrow` | Bank | 1440 × 900 (Desktop) | Normal, Dispute Frozen Alert | Total Escrow Vault KPI, Locked Active Collateral, Immutable Ledger Grid, "ISO 20022 Export" CTA |
| **P1 (Should)**| `Admin-Dispute-Arbitration` | Admin | 1440 × 900 (Desktop) | Comparative Lab Delta, Verdict Signed | Farmer sample vs. Dairy lab side-by-side delta table, Vial photo attachments, Recalculated escrow payout split |
| **P2 (Could)** | `Farmer-Supply-Modal` | Farmer | 375 × 812 (Mobile Sheet) | Form Entry, Live UZS Calculation | Volume stepper, Morning/Evening radio, Cooling vat temperature, Estimated escrow guarantee |
| **P2 (Could)**| `Buyer-Contract-Builder` | Dairy Buyer | 1440 × 900 (Modal) | Pricing Curve Preview | Base price, Fat/SNF step premium sliders, Acidity ceiling, Bank escrow guarantee lock |

---

## 2. Detailed Artboard Specifications for the Designer

### Artboard 1: `Farmer-Mobile-Home` (P0)
- **Dimensions:** `375px × 812px`
- **Colors:** Light theme background `#d8f3dc` (10% tint) and pure `#ffffff` cards. Deep forest green button `#2d6a4f`.
- **Top Bar:** 
  - Left: Farm Name ("Chashma Baraka Fermasi") + Green verified badge.
  - Right: Language toggle (`UZ` active, `RU`).
- **Hero Card:**
  - Label: "Bugungi xom sut bazaviy narxi"
  - Large Metric: `4,850 UZS / L`
  - Subtext: `Yog'lilik >= 3.8% bo'lganda +350 UZS qo'shiladi`
- **Action Button:**
  - Full width `54px` height: `+ Sut partiyasini qo'shish`
- **Active Delivery Stepper:**
  - Card title: "Bugungi jo'natma (#ZF-1049)"
  - 4 dots: `1. Ro'yxatda` (Green check) -> `2. Tanker yo'lda` (Pulsing green ring with ETA 25 min) -> `3. Zavodda` (Grey) -> `4. To'lov` (Grey).

### Artboard 2: `Buyer-Desktop-Intake` (P0)
- **Dimensions:** `1440px × 900px`
- **Sidebar:** Left navigation (260px) in dark slate `#081c15`.
- **Intake Control Panel:**
  - Left Column (40%): Live Intake Bay Queue.
    - Card: "Bay 1: Tanker #04 (Chashma Baraka - 4,950 L)" -> Status: `Namuna olinmoqda` (Temp: `3.4°C`).
    - Card: "Bay 2: Tanker #09 (Zarafshon Agro - 12,000 L)" -> Status: `OGOHLANTIRISH: Harorat 5.4°C` (Amber border).
  - Right Column (60%): Certified Titration Entry Sheet.
    - Fields:
      - Yog'lilik (Fat %): `3.95 %`
      - SOY (SNF %): `8.70 %`
      - Kislotalik (°T): `16.5 °T`
      - Antibiotik: `SALBIY (O'tdi)`
    - Real-time Price Computation Box:
      - Bazaviy narx: `4,800 UZS` + Sifat ustamasi: `+420 UZS` = Yakuniy narx: `5,220 UZS / L`
      - Jami mablag': `25,839,000 UZS`
    - CTA Button: `Tahlilni tasdiqlash va to'lovni chiqarish`

### Artboard 3: `Driver-Pickup-Handover` (P0)
- **Dimensions:** `375px × 812px`
- **Header:** "Fermer punktidan qabul qilish (#ZF-1049)"
- **Visuals:**
  - QR Code scanner preview box (centered `240px × 240px` with corner targeting marks).
  - Dipstick volume input: `[ 1,200 ] Litr` (Giant numeric display).
  - Vat temperature input: `[ 3.4 ] °C`.
  - Alcohol test toggle: `[ O'tdi (75° Spirt) ]` (Green selected pill).
  - Two adjacent signature boxes (Farmer / Driver) with realistic signature scribble placeholder.
  - Bottom CTA: `Qabulni tasdiqlash va e-TTN yaratish` (Full-width, 56px height, high-contrast).
