# ZaminFlow Architecture & Design Review: Open Questions Register

**Document ID:** `DOC-QST-001`  
**Status:** Open  
**Date Created:** 2026-11-07  
**Owner:** Architecture Review Board (ARB) & Design Review Team  

---

### Questions Summary & Protocol
In accordance with the **Ask-Me Protocol**, this document maintains the consolidated, numbered register of all critical architectural, domain, infrastructure, compliance, and design decisions requiring product and executive resolution. 

Each question details:
1. **The Question**
2. **Why It Matters to Production Readiness**
3. **What We Assumed Meanwhile**
4. **Options & Trade-offs**
5. **Impact If Assumption Is Wrong**

---

### 1. Launch Date, Team Size, and Operational Ownership
- **Question:** What is the target production launch date, expected engineering/devops team size, and who will operate, monitor, and handle on-call incidents for the system post-launch?
- **Why It Matters:** Governs operational architecture, on-call alert routing, complexity thresholds (e.g. self-hosted vs. managed PaaS), and how much automated resilience is required before go-live.
- **Assumed Meanwhile:** Q1 2027 launch; 2–4 full-stack developers operating a modular monolith with minimal DevOps staff.
- **Options:**
  - *Option A (Recommended):* Low-overhead, single-region resilient monolith (PostgreSQL + FastAPI + Next.js behind Caddy) with automated alerting to Telegram/PagerDuty.
  - *Option B:* High-touch Kubernetes/microservices cluster with dedicated 24/7 SRE rotation.
- **Impact if Wrong:** If the team is smaller than assumed, complex infrastructure will cause operational failure during outages.

---

### 2. Hosting Target, Infrastructure Budget, and Environments
- **Question:** What is the hosting infrastructure target (in-country servers in Uzbekistan e.g. Uztelecom/Beeline/TPS cloud, versus international cloud such as AWS Frankfurt/Hetzner), budget, and environment topology (dev/staging/production)?
- **Why It Matters:** Direct impact on latency for Uzbek mobile carriers (Ucell, Beeline UZ, Mobiuz, UZTELECOM), TLS certificates, reverse proxy topology, and compliance.
- **Assumed Meanwhile:** Staging and production will run in an Uzbek local datacenter (or international cloud with an in-country data proxy) with dev on local Docker Compose.
- **Options:**
  - *Option A:* Local Uzbek VPS/Cloud (e.g., ActiveCloud, Server.uz, Uztelecom Cloud) with direct UZ-IX peering.
  - *Option B:* International Cloud (AWS / DigitalOcean / Hetzner) paired with Cloudflare CDN.
- **Impact if Wrong:** High network latency (~80–120ms roundtrip) for mobile users in rural Fergana/Samarkand, plus potential regulatory non-compliance.

---

### 3. Data Residency and Legal Compliance (ZRU-547 "On Personal Data")
- **Question:** Under the Law of the Republic of Uzbekistan No. ZRU-547 "On Personal Data" (specifically Article 27¹ on physical storage of Uzbek citizens' personal data within the Republic of Uzbekistan), what is the certified compliance path, which legal advisor is signing off, and what are the document retention rules for KYC/KYB passports and tax IDs?
- **Why It Matters:** Non-compliance risks State Inspectorate "O'zkomnazorat" blocking access to the platform's domain and IP ranges.
- **Assumed Meanwhile:** All primary user PII (names, phone numbers, passport scans, STIR/TIN, contracts) must reside on PostgreSQL servers physically located inside Uzbekistan.
- **Options:**
  - *Option A:* Full backend and database deployed inside Uzbekistan; Next.js frontend cached via edge.
  - *Option B:* Database and document storage in Uzbekistan; compute stateless in hybrid cloud.
- **Impact if Wrong:** Legal sanctions, operational shutdown, and costly mid-flight database migration.

---

### 4. Payments, Escrow Release, and Factoring Scope
- **Question:** Which partner commercial bank or licensed payment system in Uzbekistan (e.g., Agrobank, Hamkorbank, Ipak Yoli, Payme, Click, Uzum) holds escrow funds? Is financial factoring in-scope for v1 launch? What is the exact currency precision for Uzbek Som (UZS)?
- **Why It Matters:** Dictates payment webhook authentication, ledger accounting schema, idempotency keys, and reconciliation jobs. UZS does not use fractional tiyin in commercial circulation; integer sums are standard.
- **Assumed Meanwhile:** Escrow is held in partner bank escrow accounts; factoring is deferred to v1.1; UZS is modeled as non-negative 64-bit integers (`BIGINT` in DB, never floats); escrow is automatically unlocked upon verified titration entry.
- **Options:**
  - *Option A:* Direct REST API integration with partner bank escrow (Agrobank / Hamkorbank).
  - *Option B:* Platform internal closed-loop escrow ledger with manual bank wire batch payouts.
- **Impact if Wrong:** Floating point precision loss leads to financial imbalance and auditing failure.

---

### 5. SMS / OTP & Notification Provider
- **Question:** Which local SMS gateway aggregator will be utilized (e.g. Eskiz.uz, PlayMobile.uz, SMS.to)? Will Telegram bot notifications be an official channel alongside SMS?
- **Why It Matters:** Farmer sign-in, order updates, and driver dispatch rely on instant SMS delivery; international gateways frequently fail on Uzbek carrier alphanumeric sender IDs.
- **Assumed Meanwhile:** Eskiz.uz / PlayMobile REST API with fallback queue, test mode enabled locally; Telegram Bot notification service planned as secondary channel.
- **Options:**
  - *Option A:* Primary Eskiz.uz + PlayMobile backup failover + Telegram Bot notifications.
  - *Option B:* Single provider without failover.
- **Impact if Wrong:** Inability for farmers to authenticate via SMS if the primary provider suffers a carrier outage.

---

### 6. Maps, GPS Telemetry, and Cold-Chain IoT Hardware
- **Question:** What is the designated mapping provider (Yandex Maps, OpenStreetMap/Leaflet, or Google Maps)? What is the GPS telemetry ping frequency for active driver trips, and how are milk tank temperature readings sourced (driver mobile app vs. hardware BLE/cellular cold-chain data loggers)?
- **Why It Matters:** Yandex Maps has dominant road network accuracy in Uzbekistan. GPS telemetry volume determines PostGIS spatial index design, table partitioning, and data retention policies.
- **Assumed Meanwhile:** Leaflet / OpenStreetMap with Yandex Maps tiles; drivers' phones report GPS every 30 seconds during active trips; temperature is entered at gate or sampled via telematics; raw GPS pings are pruned/aggregated after 90 days.
- **Options:**
  - *Option A:* PostGIS `GEOMETRY(Point, 4326)` partitioned by month with spatial indexing (`GIST`).
  - *Option B:* External IoT time-series database (TimescaleDB / InfluxDB).
- **Impact if Wrong:** PostgreSQL table bloat ($>10\text{M}$ rows/month) degrading database query response times.

---

### 7. Expected Year One Scale & Performance Targets
- **Question:** What is the projected scale in Year 1: registered farmers, active commercial dairies, drivers, peak daily shipments, and concurrent users during morning collection windows (05:00–09:00 Tashkent time)?
- **Why It Matters:** Determines database connection pooling (PgBouncer/asyncpg), API rate limiting parameters, and caching strategy.
- **Assumed Meanwhile:** Year 1: 2,500 farmers, 40 dairy processing plants, 150 drivers, 600 shipments/day, peak concurrency $\sim 300$ active requests/second between 06:00 and 08:30.
- **Options:**
  - *Option A:* Async FastAPI + connection pool size 25 + Next.js CDN caching is sufficient.
  - *Option B:* Dedicated Redis cache cluster + read-replicas.
- **Impact if Wrong:** Morning delivery rush could exhaust database connections, stalling milk intake gates.

---

### 8. Reliability Targets (SLO/SLA) and Disaster Recovery
- **Question:** What are the agreed availability targets (e.g. 99.5% vs 99.9%), maximum acceptable downtime for scheduled maintenance windows, Recovery Point Objective (RPO), and Recovery Time Objective (RTO)?
- **Why It Matters:** Dictates WAL archiving, off-site backup frequency, automated failover requirements, and zero-downtime deployment pipelines.
- **Assumed Meanwhile:** SLO: 99.7% monthly uptime; RPO $< 15$ minutes (continuous WAL shipping); RTO $< 2$ hours; daily maintenance allowed 01:00–03:00 Tashkent time.
- **Options:**
  - *Option A:* Daily automated `pg_dump` + S3-compatible off-site storage + health-check auto-restart.
  - *Option B:* Multi-node Patroni PostgreSQL high-availability cluster.
- **Impact if Wrong:** Under-provisioned recovery mechanisms fail during catastrophic hardware loss.

---

### 9. Language & Localization Priority (uz Latin / uz Cyrillic / ru / en)
- **Question:** What is the strict display hierarchy between Uzbek Latin (`uz`), Uzbek Cyrillic (`uz-Cyrl`), Russian (`ru`), and English (`en`)? Who provides the authoritative agricultural and legal translations?
- **Why It Matters:** Rural farmers predominantly communicate in Uzbek (Latin or Cyrillic), while corporate dairy plant procurement managers and bank officers frequently use Russian.
- **Assumed Meanwhile:** Default locale is `uz` (Latin) with instant toggle for `ru` and `en`; all frontend tokens structured in JSON catalogs with zero hard-coded strings.
- **Options:**
  - *Option A:* Next.js i18n dictionary catalogs (`uz`, `ru`, `en`) with fallback to `uz`.
  - *Option B:* Single language with auto-translation.
- **Impact if Wrong:** Poor adoption among rural farmers if terminology is unclear or in English.

---

### 10. Role Verification & KYB/KYC Document Approval Workflow
- **Question:** What specific identification documents are mandatory for each role (Farmer: Cadastre/Passport; Dairy: Certificate of Incorporation/STIR; Driver: Driver License/Vehicle Registration)? Who reviews submissions, and what is the maximum review SLA?
- **Why It Matters:** Affects account onboarding states (`pending_verification`, `verified`, `rejected`), dashboard gate banners, and route guards.
- **Assumed Meanwhile:** Admin reviews all KYB/KYC documents within 24 hours; users have read-only access to their respective dashboard while `pending_verification`.
- **Options:**
  - *Option A:* Manual Admin Review via `/dashboard/admin/verification/[id]` with audit log.
  - *Option B:* Automated MyGov / OneID OAuth government integration.
- **Impact if Wrong:** Security hole if unverified parties can execute milk supply contracts.

---

### 11. Titration & Milk Quality Ingestion Rules
- **Question:** Who enters milk quality parameters (Fat %, SNF %, Titration acidity ${}^\circ\text{T}$, Temperature ${}^\circ\text{C}$): the intake gate lab technician, dairy plant receiver, or automated digital spectrometer? What happens when a farmer disputes the grade?
- **Why It Matters:** Core business logic for price adjustment and automated escrow release.
- **Assumed Meanwhile:** Receiving Dairy Lab enters batch quality metrics; if acidity exceeds threshold ($>18^\circ\text{T}$) or fat $< 3.2\%$, batch is flagged for price downgrade or dispute holding escrow.
- **Options:**
  - *Option A:* Dairy input triggers automatic recalculation; Farmer has 24h window to dispute.
  - *Option B:* Dual sign-off (Driver + Dairy receiver) before escrow release.
- **Impact if Wrong:** Financial loss or fraudulent grading triggering platform disputes.

---

### 12. Design Canvas Access & Missing Artboards
- **Question:** The link `https://claude.ai/artifact/EYvbNngzSf4AdoQ5y84bca` is external and inaccessible from the secure sandbox. Could you provide an export or screenshot of the "Live statistics" artboard (and any mobile/responsive artboards)?
- **Why It Matters:** Essential to verify pixel-perfect fidelity and ensure no charts, tables, or KPI cards deviate from the approved design canvas.
- **Assumed Meanwhile:** The existing implementation in `ActiveTradeMetrics.tsx` and `frontend/src/app/stats/page.tsx` represents the intended live statistics structure.
- **Options:**
  - *Option A:* User uploads screenshots/export of Live statistics artboard.
  - *Option B:* Standardize on current implemented tokens and verify against design system rules.
- **Impact if Wrong:** Potential visual discrepancies between the design canvas and production release.

---

### 13. Version Control & Git Repository Initialization
- **Question:** The host directory `www.zaminflow.uz` is currently an unversioned folder with no `.git` repository and no `git` binary installed on the host PATH. May we initialize a local git repository inside the project directory or Docker container to track atomic commits?
- **Why It Matters:** Required for branch management, audit trails, and regression protection during the Architecture Review.
- **Assumed Meanwhile:** We maintain rigorous change tracking via `CHANGELOG.md`, findings registers, diff inspections, and automated test runs.
- **Options:**
  - *Option A:* Initialize git repository within `dairy_backend` or host.
  - *Option B:* Maintain structured change log and findings register with diff verifications.
- **Impact if Wrong:** Rollback requires manual file restoration rather than `git checkout`.
