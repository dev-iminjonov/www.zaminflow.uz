# UI/UX Specification: Driver Dashboard

**Document ID:** `UX-SPEC-DRI-001`  
**Role:** Milk Collection Logistics Driver / Tanker Operator  
**Primary Device:** Ruggedized Android Smartphone or Cab Mount Tablet (360px–412px width)  
**Environmental Context:** Direct sunlight, truck cab vibration, work gloves, wet/dusty farm gates, no Wi-Fi  

---

## 1. Information Architecture & Navigation

- **Navigation Pattern:** Single-task vertical flow. Minimum UI Chrome. Large bottom action bar.
- **Top Bar:** Tanker Cold-Chain Temperature Badge (`3.4°C [OK]`), Connection Status (`Internet mavjud` / `Oflayn rejim`).
- **Main View Area:** Today's Route Stops List (ordered sequentially), with current active stop expanded.
- **Bottom Navigation (3 Simple Modes):**
  1. **Marshrut (Route):** Sequential stop list & turn-by-turn navigation deep-links.
  2. **Qabul (Current Pickup):** QR scanner, dipstick volume entry, dual signature canvas.
  3. **Yuk xati (Consignment / e-TTN):** Tanker manifest and total liters in compartment.

---

## 2. High-Contrast Sunlight Ergonomics

- **Sunlight Mode (High-Contrast Theme):**
  - Pure white background (`#ffffff`) with deep black typography (`#081c15`) or high-contrast midnight slate (`#0b132b`).
  - Strict minimum touch target: **`56px × 56px`** for all actionable elements.
  - Giant numeric indicators: `36px` bold font for volume and compartment temperature.
  - Zero subtle gray text: all secondary text has contrast ratio $> 7:1$ (WCAG AAA compliant).

---

## 3. Screen Breakdown & Workflows

### Screen DRI-SCR-01: Daily Route Sequence (`/dashboard/driver`)
- **Header:**
  - Marshrut: `Samarqand - Oqdaryo halqasi` (6 ta fermer xo'jaligi)
  - Sig'im: `6,400 L / 10,000 L` (Progress bar)
  - Sisterna harorati: `3.2°C` (yashil belgi)
- **Stops Card List:**
  - Stop 1: `Chashma Baraka` (1,200 L) — Status: `YAKUNLANDI (06:15)`
  - Stop 2: `Zarafshon Agro` (2,100 L) — Status: **`HOZIRGI TO'XTASH (Yo'lda: 4 km)`**
    - Quick CTA 1: "Yandex Navigatsiya" (Blue icon button)
    - Quick CTA 2: "Fermerga qo'ng'iroq" (Green phone button)
    - Primary CTA: "Qabulni boshlash" (Full-width 56px green button)
  - Stop 3: `Bog'i Shamol` (1,500 L) — Status: `Kutilmoqda`
  - Stop 4: `Samarqand Sut Zavodi` — Status: `Yakuniy topshirish punkti`

### Screen DRI-SCR-02: Farm Gate Pickup & Handover
- **Step 1: QR Scan & Volume Verification:**
  - Camera viewport with target reticle to scan Farmer's batch QR.
  - Input: O'lchagich (Dipstick) ko'rsatkichi: `2,100 L`
  - Sovutish harorati: `3.5°C`
  - Spirtli sinov (Alcohol test): [O'tdi (Passed)] / [Rad etildi (Failed)]
- **Step 2: Dual Digital Signature Canvas:**
  - Touch signature box 1: "Fermer imzosi"
  - Touch signature box 2: "Haydovchi imzosi"
- **Step 3: Completion:**
  - Button: "Qabulni tasdiqlash va yuklash"
  - Generates cryptographic e-TTN code: `#TTN-20261108-042`
  - Shows instant offline-safe success screen: "Yuk qabul qilindi. Keyingi manzilga o'ting."

### Screen DRI-SCR-03: Thermal Excursion Emergency Screen
- **Trigger:** Tanker compartment exceeds $4.5^\circ\text{C}$ for $> 3$ minutes.
- **Visual Display:**
  - Pulsing high-contrast amber/red screen with bold text: `OGOHLANTIRISH: SISTЕRNA HARORATI 5.2°C`
  - Step 1: "Sovutish agregati (kompressor) quvvatini tekshiring."
  - Step 2: "Dispetcher bilan bog'lanish" (Direct red emergency dial button).
  - Step 3: "Hodisani qayd etish" (Logs incident into audit log).
