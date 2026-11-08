# ZaminFlow Role Reconciliation & Domain Alignment

**Document ID:** `DOC-PROD-REC-001`  
**Squad Lead:** Product Manager  
**Date:** 2026-11-08  
**Status:** Approved Specification  

---

## 1. Domain Reality vs Generic Marketplace Hypotheses

| Generic Marketplace Concept | Dairy Supply Chain Reality in Uzbekistan | Reconciled Product Decision |
|:---|:---|:---|
| *"Crops / Produce"* | Raw cow's milk (highly perishable, spoiled within 2–4 hours unless chilled $\le 4.0^\circ\text{C}$). | Replaced with **Milk Batches**, volume in liters, cooling tank capacity, milking session (morning/evening). |
| *"Bidding / Auctions"* | Smallholder farmers cannot monitor volatile live auctions while milking. Dairies need predictable daily raw milk volume for processing lines. | Trading operates via **Bilateral Term Supply Contracts** with dynamic **Quality-Adjusted Formula Pricing** (fat %, SNF %, titration acidity). Spot bidding deferred to post-launch. |
| *"Standard Delivery"* | Perishable liquid food requiring insulated food-grade stainless steel tankers, sanitization, and unbroken cold-chain temperature logs. | Integrated **Cold-Chain Waybills**, pickup vat temperature logging, GPS tamper detection, and gate titration inspection before intake. |
| *"Buyer Checkout / Credit Card"* | Large industrial transactions ($50\text{M} - 500\text{M UZS}$) settled via commercial bank wire transfers and letter-of-credit equivalents. | **Pre-Funded Segregated Escrow Accounts** with partner commercial bank. Buyer funds order before collection; escrow releases automatically upon lab titration sign-off. |
| *"Loans & Consumer Credit Scoring"* | Regulated banking activity subject to Central Bank of Uzbekistan licensing (Law No. ZRU-580). | Factoring and loans are framed as **Factoring Receivables Application** partnered with licensed financial institutions. Platform provides verified delivery data, not unlicensed balance sheet lending. |
| *"Conditional Rendering by `user.role`"* | A frontend-only check is easily bypassed by devtools or proxy inspection. | **Server-Enforced RBAC & ABAC**: every API query checks stored organization membership, contract parties, and object-level ownership. UI hiding is purely UX convenience. |

---

## 2. User Personas & Context Matrix

### 2.1. Farmer Persona: *Anvar Aka (Smallholder / Cooperative Lead)*
- **Demographics & Context:** 48 years old, manages a 40-cow dairy cooperative in Sayxunobod, Sirdaryo.
- **Hardware & Connectivity:** Budget Android smartphone (Xiaomi Redmi 9A), cracked screen, intermittent 3G / EDGE mobile internet.
- **Language & Literacy:** Uzbek Latin native; conversational Russian; basic digital literacy.
- **Primary Goals:**
  1. Know today's farm-gate raw milk price per liter before morning milking.
  2. Confirm the pickup tanker has arrived and scanned his cooling tank.
  3. Receive guaranteed, prompt escrow bank payouts without price deductions or delayed payment terms.
- **Fears & Pain Points:**
  - Traditional buyers artificially claiming milk is "soured" or "low-fat" to cut prices retroactively.
  - Payment delays of 30–60 days causing cash flow crisis for animal feed and veterinary care.
- **Success Metric:** List daily milk volume in under **60 seconds**; view payout receipt in **1 tap**.

---

### 2.2. Buyer Persona: *Nigora Karimova (Dairy Procurement Director)*
- **Demographics & Context:** 38 years old, Procurement Director at *Toshkent Sut Kombinati*. Works on dual-monitor desktop workstation in Tashkent corporate office with high-speed fiber.
- **Language & Literacy:** Russian & Uzbek; advanced spreadsheet and ERP user (1C:Enterprise).
- **Primary Goals:**
  1. Secure 40,000–60,000 liters of high-grade raw milk daily to keep processing lines operating at capacity.
  2. Monitor incoming tanker trucks on road with real-time temperature logs ($\le 4.0^\circ\text{C}$).
  3. Ensure all suppliers pass veterinary and sanitary standards before payment releases.
- **Fears & Pain Points:**
  - Unpasteurized milk arriving warm ($>6^\circ\text{C}$), spoiling entire silo tanks.
  - Disputed lab results stalling milk intake gate queues.
- **Success Metric:** Place a 10,000L supply order in under **3 minutes**; review lab intake batch in under **45 seconds**.

---

### 2.3. Driver Persona: *Bobur Rahimov (Logistics Tanker Driver)*
- **Demographics & Context:** 34 years old, operates an 8,000-liter insulated milk collection tanker. Operates outdoors, wearing work gloves, frequently in bright sunlight.
- **Hardware & Connectivity:** Samsung Galaxy A12 mounted on truck dashboard; travels through rural areas with dead cellular zones.
- **Language & Literacy:** Uzbek native; practical, task-focused user.
- **Primary Goals:**
  1. See today's pickup route, sequence of farms, and collection windows.
  2. Scan farm vat QR code, log initial volume and temperature in under 30 seconds.
  3. Hand over tanker at dairy plant gate with zero paperwork disputes.
- **Fears & Pain Points:**
  - App crashing in rural areas with no mobile reception, preventing QR pickup scan.
  - Being blamed for temperature rises caused by faulty farm refrigeration units.
- **Success Metric:** Complete pickup scan and sign-off in under **30 seconds**; works **100% offline with auto-sync**.

---

### 2.4. Bank Persona: *Jasur Alimov (Treasury & Escrow Officer)*
- **Demographics & Context:** 31 years old, Senior Escrow Operations Specialist at partner commercial bank. Works on secure desktop terminal with strict security policies.
- **Language & Literacy:** Russian and Uzbek; financial engineering and compliance expert.
- **Primary Goals:**
  1. Verify pre-funding deposits from commercial buyers into platform escrow accounts.
  2. Reconcile automated release transfers against certified dairy titration inspection hashes.
  3. Export ISO 20022 compliant transaction ledgers for internal core-banking auditing.
- **Fears & Pain Points:**
  - Financial discrepancies between platform ledger and bank settlement wires.
  - Unauthorized or untracked manual escrow releases.
- **Success Metric:** Reconcile daily settlement ledger in under **5 minutes**; 100% cryptographic audit trail.

---

### 2.5. Admin Persona: *Iminjonov Muhammadaziz (Platform Operations Lead)*
- **Context:** Operations oversight at ZaminFlow HQ. Oversees platform health, KYB verification dossiers, and quality dispute arbitration.
- **Primary Goals:**
  1. Review new farm and dairy KYB registration documents within 24 hours.
  2. Resolve titration dispute tickets between farmers and dairies based on third-party lab counter-tests.
  3. Maintain zero-downtime, tamper-evident audit logs.
- **Success Metric:** Zero unresolved dispute escalations $>48\text{ hours}$; zero unauthorized privilege escalations.
