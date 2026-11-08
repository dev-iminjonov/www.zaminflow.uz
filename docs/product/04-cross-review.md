# ZaminFlow Cross-Functional Review & Conflict Resolution

**Document ID:** `DOC-REV-XFN-001`  
**Squad Participants:**
1. Product Manager (PM)
2. UI/UX Designer (UX)
3. Frontend Developer (FE)
4. Backend Developer (BE)
5. Security Engineer & Compliance Specialist (SEC)
6. GIS & Mobile Specialist (GIS)

---

## 1. Executive Summary

This document captures architectural and functional tensions discovered across the six specialist domains during the analysis and design of ZaminFlow's role-based dashboards. Every conflict has been explicitly evaluated, with trade-offs analyzed, a definitive resolution established, and dissenting opinions documented.

---

## 2. Cross-Specialist Conflicts & Explicit Resolutions

### Conflict 1: Client-Side Role Switching vs. Strict Security Isolation
- **Domain Tension:** UI/UX & Frontend vs. Security & Backend
- **Context:** Previously, the frontend included a quick-fill seed bar and allowed switching active views in client state.
- **UX / FE Perspective:** Quick role switching makes internal QA testing, stakeholder demos, and responsive styling inspections effortless without repeatedly logging out and logging in.
- **SEC / BE Perspective:** `zaminflow_role` stored in an unverified browser cookie or localStorage is an invitation to privilege escalation. A driver or farmer altering their cookie could spoof UI elements or attempt to access endpoints intended for Banks or Admins.
- **Resolution:** **STRICT SEPARATION.**
  - Seed test account switcher is completely purged from production views.
  - The frontend `middleware.ts` will strictly validate server-signed JWT tokens (verifying signature, expiration, and embedded role claims).
  - Backend API will enforce cryptographic token-level authorization independently on every single request. No UI role toggle can ever bypass backend RBAC/ABAC guards.

---

### Conflict 2: Driver Offline Operation vs. Real-Time Telematics & Security Audit
- **Domain Tension:** GIS & Mobile vs. Security & Backend
- **Context:** Milk collection tankers travel through rural regions of Samarkand and Kashkadarya with intermittent or zero cellular connectivity (2G/Edge/No Signal).
- **GIS Perspective:** Drivers must be able to complete pickups, log dipstick volumes, and capture farmer signatures offline without network stalls.
- **SEC / BE Perspective:** If pickups happen offline, how do we guarantee that timestamps were not manipulated, milk wasn't collected late at warm temperatures, or batches were not fabricated?
- **Resolution:** **CRYPTOGRAPHIC OFFLINE STORE-AND-FORWARD WITH HARDWARE TEMPERATURE LOGGERS.**
  - The driver PWA uses IndexedDB with an append-only transaction store.
  - Offline pickup actions are signed with an offline driver session key that includes local monotonic device clocks and pre-assigned batch UUID nonces.
  - Milk temperature verification does not rely on driver self-reporting: physical tanker refrigeration units carry autonomous battery-backed telematics loggers (Teltonika / Ruptela) that record continuous temperature curves into tamper-resistant local flash, synced via Bluetooth or cellular burst upon reconnecting.

---

### Conflict 3: Real-Time Tanker GPS Tracking: High-Frequency Polling vs. Low-End Mobile Battery & Data Costs
- **Domain Tension:** UI/UX & Buyer Operations vs. Frontend & Mobile Specialist
- **Context:** Dairy plant procurement managers want smooth 1-second map animations of inbound tankers, while drivers operate low-cost Android phones with limited data plans and battery life.
- **Buyer / Operations Perspective:** We need to know tanker location precisely to schedule plant bay intake pumps and steam sanitization.
- **Mobile / FE Perspective:** Continuous WebSocket / 1-second GPS pinging drains a low-cost Android phone battery within 2.5 hours and consumes expensive cellular data quotas in rural areas.
- **Resolution:** **DYNAMIC ADAPTIVE TELEMETRY INTERVALS.**
  - When tanker is $> 20\text{ km}$ from destination: GPS ping every 120 seconds or upon significant turn (> 45° bearing change).
  - When tanker is $5 - 20\text{ km}$ from destination: GPS ping every 30 seconds.
  - When tanker is $< 5\text{ km}$ (intake approach): GPS ping every 10 seconds.
  - Frontend map employs dead-reckoning interpolation (smooth movement along OpenStreetMap road geometries) rather than raw high-frequency telemetry floods.

---

### Conflict 4: Lab Titration Speed vs. Fraud Prevention & Escrow Payout Speed
- **Domain Tension:** Product Manager vs. Security & Compliance Officer
- **Context:** Farmers demand immediate payout notifications when their milk reaches the plant. Lab titration (acidimetric titration, gerber centrifuge fat testing, cryoscope freezing point) takes 15–35 minutes per tanker compartment.
- **PM / Farmer Perspective:** Farmers distrust dairy processors. Delaying payout release by hours generates farmer complaints and suspicion of volume tampering.
- **SEC / Bank Perspective:** Releasing escrow funds before certified laboratory testing exposes the bank and buyer to catastrophic losses (e.g. diluted milk, sour milk, antibiotic contamination).
- **Resolution:** **TWO-STAGE CONDITIONAL SETTLEMENT.**
  1. **Stage 1 (At Weighbridge / Intake Bay):** Driver scans drop-off QR, weighbridge flow meter confirms gross volume. System dispatches instant SMS: *"Sutingiz zavodga yetkazildi: [X] litr. Laboratoriya tahlili o'tkazilmoqda."*
  2. **Stage 2 (Certified Titration Entry):** Plant lab chemist enters fat %, SNF %, and acidity within 60 minutes. Cryptographic formula computes exact price adjustment and automatically releases escrow from bank vault to farmer account with SMS notification: *"Mablag' ajratildi: [Y] so'm hisobingizga o'tkazildi."*

---

### Conflict 5: Bank Dashboard Integration: Native App vs. Dedicated Secured Web Portal
- **Domain Tension:** Frontend Developer vs. Bank Compliance Specialist
- **Context:** Partner bank compliance officers require access to escrow reserves and ISO 20022 clearing files.
- **FE Perspective:** Build the bank dashboard within the same Next.js App Router codebase under `/dashboard/bank` using existing design tokens.
- **SEC / Bank Perspective:** Bank corporate infosec policies prohibit third-party SaaS tools that mix internal financial controls with consumer web code unless IP-whitelisting, hardware 2FA (WebAuthn/FIDO2), and strict CSP headers are enforced.
- **Resolution:** **MONOLITHIC ROUTE WITH INDEPENDENT SECURITY WRAPPER.**
  - `/dashboard/bank` resides in the Next.js app but is wrapped with:
    - Strict Content Security Policy (`script-src 'self'`).
    - Mandatory WebAuthn / TOTP MFA.
    - Caddy reverse proxy IP whitelisting for partner bank corporate CIDR blocks.
    - Zero client-side storage of financial ledger cache.

---

## 3. Specialist Sign-Off

| Specialist | Role | Sign-Off Status | Notes |
|---|---|---|---|
| Product Manager | Product Leadership | **APPROVED** | Balanced farmer speed with enterprise buyer rigor. |
| UI/UX Designer | User Experience Lead | **APPROVED** | Clear role visual hierarchies and mobile/desktop adaptations. |
| Frontend Developer | Web Platform Lead | **APPROVED** | Clean Next.js layout isolation and zero client security dependencies. |
| Backend Developer | Architecture Lead | **APPROVED** | Deterministic SQL-enforced ABAC and immutable financial ledger. |
| Security Engineer | InfoSec & Compliance | **APPROVED** | Token hardening, audit trails, and strict separation of duties. |
| GIS & Mobile Specialist | Field Operations Lead | **APPROVED** | Resilient offline PWA + telematics logger integration. |
