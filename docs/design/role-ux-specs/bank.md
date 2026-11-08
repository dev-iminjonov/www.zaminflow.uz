# UI/UX Specification: Bank & Escrow Dashboard

**Document ID:** `UX-SPEC-BNK-001`  
**Role:** Commercial Partner Bank (Escrow Agent, Risk Compliance, Trade Finance)  
**Primary Device:** Desktop Financial Workstation (1920px / 1440px multi-monitor)  
**Environmental Context:** Corporate banking headquarters, strict financial audit environment  

---

## 1. Information Architecture & Navigation

- **Layout Structure:** Dual-pane desktop layout with persistent transaction audit sidebar and top security status bar.
- **Top Bar:** Bank Logo, Branch Identifier, Active Security Profile ("WebAuthn Level 3 Active"), Central Bank Gateway Status ("CBU Real-time RTGS: Connected").
- **Main Navigation Tabs:**
  1. **Eskrou depozitlari (Escrow Reserve Liquidity):** Total reserve pool, active buyer balances, locked collateral.
  2. **Bosh daftar (Financial Ledger & Audit):** Double-entry journal, settlement traces, immutable hash verification.
  3. **Kliring va ISO 20022 (Clearing & Payment Export):** Automated pacs.008 XML message generation for Interbank clearing.
  4. **Nizolar va Muzlatilgan hisoblar (Arbitration & Frozen Balances):** Transactions flagged under quality dispute.

---

## 2. Visual Hierarchy & Security Aesthetics

- **Theme & Palette:**
  - Trust Navy & Slate: `#0f172a` (Header & deep accents)
  - Clean Paper White: `#f8fafc` (Content canvas)
  - Escrow Green: `#15803d` (Verified funds, cleared settlements)
  - Frozen Alert Red: `#b91c1c` (Dispute-frozen escrow funds)
- **Monospace Financial Figures:**
  - All currency balances, bank account IBAN numbers, and transaction hashes rendered in monospace font (`JetBrains Mono` / `SF Mono`, `tabular-nums`).
- **Security Banners:**
  - Fixed status badge: `Shifrlash: SHA-256 Checksum 100% Mos | Auditorlik tekshiruvi: O'tgan`

---

## 3. Screen Breakdown & Components

### Screen BNK-SCR-01: Escrow Liquidity Management (`/dashboard/bank`)
- **Top Financial Summary Cards:**
  1. **Jami kafolat depozitlari (Total Escrow Vault):** `14,850,000,000 UZS`
  2. **Faol shartnomalarga band qilingan:** `9,200,000,000 UZS` (62% of pool)
  3. **Bugun chiqarilgan to'lovlar:** `1,420,000,000 UZS` (38 ta qabul partiyasi)
  4. **Nizoli muzlatilgan mablag'lar:** `42,500,000 UZS` (2 ta partiya muzlatilgan)
- **Buyer Collateral Health Table:**
  - Ustunlar: Korxona nomi (Tashkent Milk, Pure Milky), STIR, Depozit qoldig'i, O'rtacha oylik aylanma, Xavf darajasi (Past/O'rta), Eskrou to'ldirish holati.
  - Action: "Depozit to'ldirish talabnomasini yuborish"

### Screen BNK-SCR-02: Immutable Financial Ledger Journal (`/bank/ledger`)
- **Filter Controls:** Date range picker, Transaction Type dropdown (`ESCROW_LOCKED`, `ESCROW_RELEASED`, `DISPUTE_FROZEN`), Entity Search (INN, Batch ID).
- **Double-Entry Journal Grid:**
  - Row columns: Tx ID, Timestamp (UTC+5), Debit Account, Credit Account, Summa (UZS), Batch Ref, Verification Hash, Status.
  - Checksum Validation Icon: Green padlock icon validating SHA-256 row chain integrity.

### Screen BNK-SCR-03: ISO 20022 Clearing Dispatch Modal
- **Clearing Summary:**
  - Batches ready for clearing: `42 ta tasdiqlangan partiya`
  - Total payment instruction amount: `1,420,000,000 UZS`
  - Recipient accounts: 34 unique farmer bank cards / settlement accounts.
- **Actions:**
  - Button: "ISO 20022 pacs.008 XML faylini yaratish"
  - Modal displays structured XML snippet with digital certificate signature confirmation.
  - Double-authorization: "Ikki bosqichli bank kaliti (EDS) bilan tasdiqlash"
