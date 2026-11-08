# ZaminFlow Legal & Trust Content Architecture

**Document ID:** `DOC-CNT-007`  
**Squad Lead:** Content Management Specialist & Compliance Lead  
**Status:** Draft - Requires Qualified Legal Review  
**Date:** 2026-11-08  

---

> [!WARNING]
> **LEGAL NOTICE: The frameworks and policies outlined below are draft structures prepared for operational readiness. In accordance with Section 5 of the Launch Squad Protocol, all legal copy must be formally reviewed and approved by a licensed attorney qualified in the law of the Republic of Uzbekistan prior to public registration and commercial transactions.**

---

## 1. Regulatory Requirements Checklist (Uzbekistan)

1. **Law No. ZRU-547 "On Personal Data" (2019):**
   - **Article 27¹ (Physical Data Localization):** Primary database storage containing citizen PII (farmer names, passport/ID numbers, phone numbers, location data) must physically reside in servers within Uzbekistan.
   - **Consent Requirement:** Explicit written or electronic checkbox consent prior to processing personal information.
2. **Law No. ZRU-611 "On Electronic Commerce" (2020):**
   - Mandatory disclosure of legal entity name, INN/STIR, bank requisites, and contact phone on platform website.
3. **Civil Code of the Republic of Uzbekistan (Escrow and Supply Contracts):**
   - Rules governing conditional escrow release upon certified inspection (titration acceptance).
4. **Driver GPS Telemetry Notice:**
   - Explicit notification to logistics drivers that vehicle location and transit speeds are logged during active supply routes for cold-chain safety.

---

## 2. Privacy Policy Framework (Summary Outline)

- **Operator Identification:** ZaminFlow (legal entity to be confirmed in Question #1).
- **Categories of Data Collected:**
  - Account identification: Full name, telephone number, email, role (Farmer, Dairy Processing, Logistics Hauler).
  - Verification (KYB/KYC): Business registration certificate (Guvohnoma), Tax Identification Number (STIR/INN), farm coordinates.
  - Telemetry: Tanker temperature logs and transit GPS during active delivery routes.
  - Transactional: Milk delivery volumes, titration quality measurements, escrow settlement ledger.
- **Purpose of Processing:** Delivery dispatch, quality verification, automatic escrow settlement, dispute resolution.
- **Third-Party Disclosures:** Partner commercial banks (solely for escrow execution); State veterinary and phytosanitary inspectorates (upon lawful regulatory request).
- **Data Subject Rights:** Right to access, rectify, or request deletion of account records (subject to statutory financial audit retention periods).

---

## 3. Terms of Service Framework (Summary Outline)

- **Eligibility:** Legally registered agricultural producers (dehqon / fermer xo'jaliklari), licensed dairy processing entities, and authorized freight carriers.
- **Pricing & Quality Adjustments:** Base farm-gate price adjusted dynamically by standard fat (3.60%), SNF (8.50%), and temperature ($\le 4.0^\circ\text{C}$) coefficients.
- **Escrow Settlement:** Buyer deposits 100% of purchase order value into escrow upon contract execution; funds unlock automatically upon lab technician titration sign-off.
- **Dispute Escalation:** 48-hour arbitration window if dairy intake titration deviates by $>0.20\%$ from certified loading titration.
- **Platform Limitation of Liability:** Force majeure, carrier equipment failure, perishable spoilage outside platform transit tracking.
