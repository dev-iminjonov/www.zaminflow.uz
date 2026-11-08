# UI/UX Specification: Farmer Dashboard

**Document ID:** `UX-SPEC-FAR-001`  
**Role:** Farmer / Cooperative Head  
**Primary Device:** Budget Android Smartphone (Samsung Galaxy A-series, Xiaomi Redmi, 360px–390px viewport width)  
**Environmental Context:** Morning milking parlor, bright outdoor sunlight, dusty hands, intermittent 2G/3G connectivity  

---

## 1. Information Architecture & Navigation

- **Layout Structure:** Bottom Navigation Bar on Mobile (4 tabs), Collapsible Slim Sidebar on Tablet/Desktop.
- **Mobile Bottom Tabs:**
  1. **Asosiy (Home):** Farm-gate price, today's batch status, quick-action "+ Sut qo'shish".
  2. **Partiyalar (My Milk):** Active batches, past history, lab titration grades.
  3. **Yuklar (Pickups):** Assigned tanker, arrival countdown, driver contact.
  4. **Hisob (Payouts):** Escrow settlements, bank card / account, earnings statement.

---

## 2. Visual Hierarchy & Design System Mapping

- **Color Tokens (from Coolors brand palette):**
  - Primary Green: `#2d6a4f` (buttons, key accents)
  - Light Background: `#d8f3dc` / `#ffffff`
  - High-Contrast Text: `#081c15`
  - Warning (Acidity/Temp alert): `#d97706`
  - Critical/Error: `#dc2626`
- **Typography:**
  - Large Metric Numbers: `32px` Bold Inter (`font-variant-numeric: tabular-nums`)
  - Headings: `20px` Semibold
  - Body & Labels: `15px` Regular (high legibility)
- **Touch Target Sizes:**
  - Primary CTA ("+ Sut qo'shish"): Minimum height `54px`, full mobile width.
  - Secondary buttons & table rows: Minimum `48px` tap target.

---

## 3. Screen Breakdown & Component Layout

### Screen FAR-SCR-01: Farmer Dashboard Home (`/dashboard/farmer`)
- **Header:** Farm Name ("Chashma Baraka"), Verification Badge (Green Shield "Tasdiqlangan"), Language Switcher (`UZ` / `RU`).
- **Primary Hero Card (Today's Baseline):**
  - Metric: `4,850 UZS / L` (Volume-weighted baseline for Grade A)
  - Indicator: `+50 UZS kechagidan yuqori` (green trend badge)
  - Grade Requirements tooltip: `Yog'lilik >= 3.8% | SOY >= 8.5%`
- **Primary Action:** Large prominent button: `+ Sut partiyasini ro'yxatdan o'tkazish`
- **Active Batch Status Card (if batch exists today):**
  - Batch Code: `#ZF-1049` (1,200 L)
  - Visual Stepper:
    1. Ro'yxatga olindi (Check)
    2. Tanker yo'lda (Active Pulsing Indicator, Driver: Olimov J.)
    3. Zavodga yetkazildi
    4. Tahlil & To'lov
- **Quick Earnings Card:**
  - `14,550,000 UZS` (Oxirgi 7 kunlik to'lovlar)
  - Link: "Barcha to'lovlarni ko'rish ->"

### Screen FAR-SCR-02: Supply Listing Modal / Screen
- **Input Fields:**
  - Hajm (Litr): Large numeric keypad input with stepper buttons (+100, +500)
  - Sog'im vaqti: Radio pills [Ertalabki] [Kechki]
  - Sovutish harorati: Number input default `3.4°C` (Warning banner if entered $> 4.0^\circ\text{C}$)
- **Estimated Settlement Preview:**
  - Dynamically calculates: `1,200 L × 4,850 UZS = 5,820,000 UZS (Taxminiy kafolatlangan depozit)`
- **Submit Action:** "Tasdiqlash va depozitni band qilish" (54px height)

### Screen FAR-SCR-03: Batch Quality & Titration Modal
- **Data Display:**
  - Gross Volume: `1,195 L` (Weighbridge flow meter certified)
  - Fat %: `4.05%` (Baseline 3.60% -> `+540 UZS/L Premium`)
  - SNF %: `8.65%` (Baseline 8.50% -> `+150 UZS/L Premium`)
  - Acidity: `16.5 °T` (Optimal fresh milk)
  - Net Unit Price: `5,540 UZS / L`
  - Total Escrow Payout: `6,620,300 UZS` (Bank Reference: `BNK-UZ-9921`)
- **Actions:**
  - "Natijalarni qabul qilish" (Primary)
  - "E'tiroz bildirish (Dispute)" (Secondary outline red button)
