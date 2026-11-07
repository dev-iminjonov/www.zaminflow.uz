# ZaminFlow Architecture & Implementation Roadmap

**Document ID:** `DOC-RDM-001`  
**Planning Horizon:** Launch Release v2.0 through Post-Launch Q1 2027  

---

## 1. MUST Before Production (Launch Blockers)
*Critical security, financial data integrity, and compliance requirements that must be resolved prior to processing real transactions.*

1. **Resolution of Uzbek Law ZRU-547 Data Residency:** Certified legal determination and deployment of primary PostgreSQL database on servers physically inside Uzbekistan (`FND-COMP-001`).
2. **Transition from `localStorage` to `HttpOnly` Cookies:** Migrate JWT session storage to prevent credential exfiltration via XSS (`FND-SEC-001`).
3. **Database Migration Reversibility Fix:** Implement exact rollback DDL in `0002_onboarding_gating.py` downgrade (`FND-DB-001`).
4. **FastAPI & Ingress Multi-Layer Rate Limiting:** Enforce backend rate limiting for sign-in and SMS OTP endpoints to protect traffic bypassing Next.js proxy (`FND-SEC-002`).
5. **Cold-Chain & Titration Quality Dispute SLA:** Formalize 24-hour dispute window rules before escrow payout settlement becomes final (`Question #11`).

---

## 2. SHOULD Within 30 Days After Launch
*Operational resilience, performance optimizations, and UX consolidation.*

1. **Transactional Outbox for Partner Bank Webhooks:** Scheduled background worker with exponential backoff for failed webhook deliveries (`FND-REL-001`).
2. **PostGIS Driver GPS Table Partitioning:** Implement monthly declarative partitioning for driver location pings with 90-day retention pruning (`FND-GIS-001`).
3. **Automated WAL Shipping & Nightly Backup Drill:** Automated cron backup shipping to off-site S3-compatible storage with automated restore verification (`FND-OPS-001`).
4. **Complete Localization Dictionaries:** Full translation of all UI strings into Uzbek Latin (`uz`), Russian (`ru`), and English (`en`) (`FND-LOC-001`).
5. **Dead Prototype Route Cleanup:** Clean archival and removal of unused prototype routes under `(field)` and `(portal)` (`FND-ARCH-001`).

---

## 3. LATER (Post-Launch Expansion)
*Platform scale, factoring financing, and automated hardware telematics.*

1. **Automated Cold-Chain IoT Hardware Integration:** Direct cellular/BLE telemetry ingestion from tanker milk tank temperature loggers.
2. **Partner Bank Core Financial Factoring:** Real-time credit line underwriting and instant factoring loan disbursement.
3. **Government OneID / MyGov Integration:** Automated KYB/KYC verification using official state business registry APIs.
4. **Native Mobile Driver App:** Standalone offline-first mobile application (React Native) for logistics drivers in remote regions.
