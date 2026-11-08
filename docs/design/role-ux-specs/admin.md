# UI/UX Specification: Platform Admin Dashboard

**Document ID:** `UX-SPEC-ADM-001`  
**Role:** ZaminFlow Platform Operations Administrator & Quality Arbitrator  
**Primary Device:** Desktop Operations Console (1440px / 1920px)  
**Environmental Context:** Central Operations Command Center  

---

## 1. Information Architecture & Navigation

- **Layout Structure:** Persistent left sidebar navigation with badge counters for pending action queues.
- **Top Bar:** System Status Indicator (`API Latency: 42ms | DB Pool: 14/50 | Celery: 0 lag`), User Identity, Environment Badge (`PRODUCTION`).
- **Navigation Tabs:**
  1. **Tizim ko'rinishi (Operations Overview):** Platform metrics, active trade volume, live tanker count, open tickets.
  2. **Tashkilotlarni tasdiqlash (KYB/KYC Verifications):** Onboarding approval queue for new farmers, dairies, and logistics fleets.
  3. **Nizolar arbitraji (Dispute Resolution):** Titration quality discrepancies, frozen batch arbitration dockets.
  4. **Logistika xaritasi (Fleet Telematics):** Nationwide GIS map of all active collection tankers with real-time speed/temp.
  5. **Xavfsizlik va Audit (Audit Trails & Security):** Tamper-proof event logs, failed auth attempts, role permissions.

---

## 2. Visual Hierarchy & Operational Density

- **Density:** Compact operational density with quick inline actions and modal review drawers.
- **Badge Indicators:**
  - Pending KYB: Red pill badge with count (e.g. `12`)
  - Active Disputes: Flashing amber pill (e.g. `2`)
- **Action Buttons:** Standardized destructive action patterns with double-confirmation dialogs for freezing accounts or executing binding arbitration payouts.

---

## 3. Screen Breakdown & Workflows

### Screen ADM-SCR-01: Operations Command Center (`/dashboard/admin`)
- **Metric Tiles:**
  - Jami faol fermerlar: `1,240 ta`
  - Qayta ishlovchi korxonalar: `18 ta zavod`
  - Bugungi umumiy sut hajmi: `184,500 L`
  - Muzlatilgan nizolar qiymati: `42,500,000 UZS`
- **Critical Action Queues (Split View):**
  - Left: "Tasdiq kutilayotgan korxonalar (Pending KYB)" table.
  - Right: "Nizoli partiyalar (Active Titration Disputes)" table with direct "Ko'rib chiqish" links.

### Screen ADM-SCR-02: Quality Dispute Arbitration Docket (`/admin/disputes/[id]`)
- **Dispute Header:** Batch `#ZF-1049` | Farmer: "Chashma Baraka" vs. Dairy: "Tashkent Milk"
- **Comparative Titration Evidence Table:**
  | Ko'rsatkich | Fermer nazorat namunasi (Dispatch) | Zavod qabul laboratoriyasi (Intake) | Farq (Delta) | Mustaqil Uzstandard xulosasi |
  |---|---|---|---|---|
  | **Yog'lilik (Fat %)** | 4.10 % | 3.75 % | -0.35 % (Dispute threshold >0.20%) | 4.02 % |
  | **SOY (SNF %)** | 8.70 % | 8.45 % | -0.25 % | 8.65 % |
  | **Kislotalik (°T)** | 16.5 °T | 19.5 °T | +3.0 °T | 17.0 °T |
- **Attached Evidence:** High-res photos of sealed counter-sample vials, intake lab calibration certificates.
- **Arbitration Settlement Decision Box:**
  - Binding Fat Setting: `4.00 %`
  - Binding SNF Setting: `8.65 %`
  - Price Adjustment: `+380 UZS / L`
  - Recalculated Payout: `6,216,000 UZS to Farmer`, `324,000 UZS refund to Dairy`.
  - Action: "Yakuniy xulosani imzolash va to'lovni chiqarish" (Requires Admin Security Token).
