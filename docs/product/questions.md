# ZaminFlow Product & Role Dashboards: Open Questions Register

**Document ID:** `DOC-PROD-QST-001`  
**Squad Lead:** Product Manager  
**Date Created:** 2026-11-08  
**Status:** Open / Awaiting Executive & Product Decisions  

---

### Mandatory Ask-Me Protocol Summary
In accordance with the **Ask-Me Protocol**, this document maintains the unified, numbered register of critical product requirements, role boundaries, financial workflows, and operational scopes requiring executive resolution.

---

### Question 1: Final Role Roster & Organization Types
- **Question:** What is the final approved list of platform roles:
  1. Is **Bank** formally established as a dedicated 5th role alongside Farmer, Buyer (Dairy Industry), Driver, and Admin?
  2. Does **Admin** strictly represent platform operations oversight (KYB verification, dispute arbitration, market parameters)?
  3. Who are the actual users of the Bank dashboard: commercial partner bank treasury/settlement staff (e.g. Agrobank / Hamkorbank), or internal ZaminFlow financial operations personnel?
  4. Do third-party accredited testing laboratories (e.g., State Veterinary Inspectorate, independent titration labs) require a dedicated login or are they managed via Admin dispute workflows?
- **Why It Matters:** Governs database role enums, route guards in Next.js middleware, permission matrix definitions, and whether Bank is exposed during self-signup (it must never be public).
- **Assumed Meanwhile:** 5 distinct roles: Farmer, Buyer (Dairy Industry), Driver, Bank, Admin. Bank is an invitation-only role for partner bank treasury officers; Admin is internal platform operations; third-party labs interact via certified email/upload links inside Admin dispute cases.
- **Options:**
  - *Option A (Recommended):* 5 Roles: Farmer, Dairy, Driver, Bank (invitation-only), Admin (invitation-only).
  - *Option B:* 4 Roles: Merge Bank functionality into Admin under a "Finance & Escrow" tab.
- **Impact if Wrong:** Building a separate Bank dashboard if Bank users only need an audit export, or missing bank staff access control if merged.

---

### Question 2: Organization Hierarchy & Multi-User Staff (Sub-Roles)
- **Question:** How are accounts and organizations structured:
  1. Is a Dairy Industry buyer or a Partner Bank modeled as an **Organization** with multiple employee accounts (e.g. Procurement Manager, Lab Technician, Gate Receiver, Compliance Officer, Finance Director)?
  2. Does a Driver belong to a commercial dairy fleet, an independent logistics contractor, or operate as an individual freelancer?
  3. Does a Farmer account represent an individual smallholder or a multi-member agricultural cooperative (kooperativ)?
- **Why It Matters:** Determines whether the database needs multi-user organization membership with sub-role RBAC/ABAC, or if a single login per organization is sufficient for launch.
- **Assumed Meanwhile:** Multi-user organizations: `organizations` table has role (`FARMER`, `INDUSTRY`, `BANK`, `ADMIN`), and `users` table has `sub_role` (`OWNER`, `LAB_TECH`, `GATE_RECEIVER`, `DRIVER`, `SUPERADMIN`). Drivers are assigned to logistics organizations or dairies; cooperative owners can manage multiple member collection points.
- **Options:**
  - *Option A (Recommended):* Single organization with role-specific staff sub-roles (as currently modeled in Postgres schema `users.sub_role`).
  - *Option B:* Flat 1-to-1 mapping where 1 account = 1 user with 1 role.
- **Impact if Wrong:** Milk intake gate receivers using the corporate executive's login, creating severe audit trail and accountability failures.

---

### Question 3: Trading Mechanism: Quality-Based Pricing vs Bidding
- **Question:** How does raw milk trading operate on the platform:
  1. Are trades executed via **Formula-Based Bilateral Supply Contracts** (base farm-gate price adjusted mathematically by fat %, SNF %, and titration acidity)?
  2. Or does the platform support **Spot Bidding / Auctions** where buyers submit competitive bids on daily farmer listings?
  3. Who defines the base price: negotiated bilaterally between farmer and dairy, set by dairy purchase bulletin, or pegged to a regional platform index?
- **Why It Matters:** Bidding systems require real-time WebSocket ticker state, bid increment validation, reserve prices, and auction timers. Fixed-contract ordering requires contract templates, scheduled pickup windows, and volume commitments.
- **Assumed Meanwhile:** Commercial dairy trading in Uzbekistan relies primarily on **bilateral term contracts and standing orders with quality-adjusted pricing** (`base_price + fat_premium - acidity_penalty`). Bidding is deferred to post-launch roadmap.
- **Options:**
  - *Option A (Recommended):* Bilateral quality-formula ordering: Farmer lists daily volume capacity $\to$ Buyer orders $\to$ Contract locked in escrow $\to$ Payout calculated upon titration.
  - *Option B:* Dynamic reverse auction / spot bidding system.
- **Impact if Wrong:** Building complex real-time bidding engines that farmers on weak 3G networks cannot use.

---

### Question 4: Escrow Release, Payout Formulas, and Factoring Scope
- **Question:** What are the exact financial transaction rules:
  1. Which licensed commercial bank in Uzbekistan holds the segregated escrow funds?
  2. Who triggers the release: automated immediate release upon lab technician titration entry, or manual sign-off by a bank officer?
  3. What is the exact mathematical payout formula for milk quality adjustments?
  4. Is financial factoring (early payout of receivables against delivered batches for a 1.5% fee) in scope for v1 launch, and who provides the capital (partner bank or platform)?
  5. Is credit scoring in scope for launch, and what legal basis / consent applies under Central Bank regulations?
- **Why It Matters:** Financial accounting requires zero-ambiguity ledger mechanics, regulatory licensing for lending/factoring, and exact integer decimal arithmetic for Uzbek Som (UZS).
- **Assumed Meanwhile:** Escrow is locked in partner bank account; released automatically when dairy lab tech submits titration results conforming to contract specifications; factoring is deferred to v1.1; credit scoring is deferred; payout formula strictly enforces:  
  $$\text{Payout} = \text{Volume} \times \left[\text{BasePrice} \times \left(1 + \alpha(\text{Fat} - 3.60) + \beta(\text{SNF} - 8.50)\right) - \text{TempPenalty}\right]$$
- **Options:**
  - *Option A (Recommended):* Automated escrow release upon verified titration test; factoring and credit scoring deferred to post-launch.
  - *Option B:* Manual bank officer release for every batch; launch full factoring from day 1.
- **Impact if Wrong:** Legal liability for unlicensed banking activities if factoring/credit scoring launches without certified banking partner integration.

---

### Question 5: KYC / KYB Verification Workflows
- **Question:** What documents are required for onboarding, and who reviews them:
  1. Farmer: Passport/ID card (JShShIR), Farm registration certificate (Guvohnoma), land cadastre/veterinary certificate?
  2. Dairy Industry: Corporate charter (Ustav), Tax certificate (STIR), sanitary-epidemiological license?
  3. Driver: Driver's license (category C/E), tanker sanitary passport, vehicle registration (Tex-pasport)?
  4. Who conducts verification: platform Admin operations team, or partner Bank compliance officer?
  5. What is the target turnaround SLA (e.g. 24 hours)?
- **Why It Matters:** Dictates document upload schemas, private encrypted S3/MinIO bucket configuration, and review workflow screens.
- **Assumed Meanwhile:** Platform Admin reviews and approves KYB dossiers; documents stored in private storage; farmers can browse in restricted mode until verified; 24-hour verification SLA.
- **Options:**
  - *Option A (Recommended):* Platform Admin conducts tier-1 business verification (KYB); Partner Bank verifies bank accounts for escrow.
  - *Option B:* Partner Bank conducts all KYC/KYB reviews directly.
- **Impact if Wrong:** Bottlenecks in onboarding if bank officers must manually review hundreds of smallholder farm registrations.

---

### Question 6: Driver Mobile Technology & GPS Telemetry Strategy
- **Question:** What is the technical implementation model for drivers:
  1. Progressive Web App (PWA) with offline ServiceWorker caching, or native mobile app (React Native / Flutter)?
  2. Background GPS tracking: how is location collected when driver's phone screen is locked during transit? (Mobile browsers aggressively throttle background geolocation).
  3. Are tankers equipped with hardware GPS/cold-chain data loggers (Teltonika / Galileosky with BLE temperature probes), or is driver phone GPS the primary source?
  4. Ping frequency: every 30 seconds, 60 seconds, or on route events (pickup, milestone, gate arrival)?
- **Why It Matters:** Native mobile apps require app store review cycles and separate codebases. Browser-based PWAs cannot reliably stream GPS in the background on iOS/Android without foreground screen lock.
- **Assumed Meanwhile:** Launch v1 uses **responsive PWA with offline-first ServiceWorker and IndexedDB queue** for pickup/dropoff confirmations; GPS is sampled during active app usage; milk tankers utilize vehicle hardware telematics for automated temperature logging where available.
- **Options:**
  - *Option A (Recommended):* Mobile PWA with offline action queue for v1 launch; hardware OBD-II / BLE loggers for tanker cold-chain data.
  - *Option B:* Commission custom React Native Android application for drivers prior to launch.
- **Impact if Wrong:** Delays launch by 2–3 months if native app is built when web PWA suffices for waypoint handovers.

---

### Question 7: Supported Devices, Language Hierarchy & Scale Targets
- **Question:** What are the verified operational parameters:
  1. Priority order: Uzbek Latin (`uz` default), Russian (`ru`), English (`en`). Is Uzbek Cyrillic required?
  2. Low-end device target: Xiaomi Redmi 9A / Samsung Galaxy A03 running Android 10+ on 3G cellular network?
  3. Expected scale in Year 1: registered farmers, active commercial dairies, daily milk shipments, peak morning intake concurrency (05:00–09:00 Tashkent time)?
- **Why It Matters:** Enforces performance budgets, bundle chunk splitting, and database connection pooling.
- **Assumed Meanwhile:** `uz` Latin default $\to$ `ru` $\to$ `en`; budget Android 3G profile; Year 1: 2,500 farmers, 40 dairies, 150 drivers, ~600 shipments/day.
- **Options:**
  - *Option A:* Strict lightweight optimization for budget Android devices.
  - *Option B:* Modern desktop/4G baseline only.
- **Impact if Wrong:** Platform fails to load at rural farm collection points.

---

### Question 8: Phase 1 Launch Scope: Which Dashboards & Features are Day 1 Blockers?
- **Question:** Which exact dashboards and sub-features are mandatory for the Day 1 production launch versus 30-day post-launch backlog:
  - Must Bank have a complete UI dashboard on Day 1, or is automated webhook escrow lock/release with Admin oversight sufficient for initial pilot?
  - Are driver turn-by-turn route maps required on Day 1, or is waybill stop listing with QR pickup/handover confirmation sufficient?
- **Why It Matters:** Prevents scope creep and ensures the launch squad delivers rock-solid core transactional journeys first.
- **Assumed Meanwhile:** Day 1 Launch Scope: Complete Farmer, Dairy Industry, Driver (PWA), and Admin dashboards. Bank dashboard is enabled in Phase 1 with KPI overview and ISO 20022 audit ledger export.
- **Options:**
  - *Option A (Recommended):* Launch 5 core dashboards with focused Day-1 feature sets (order, dispatch, pickup scan, lab titration, escrow payout).
  - *Option B:* Restrict launch to Farmer + Dairy only, handling logistics manually.
- **Impact if Wrong:** Overbuilding complex secondary features before the primary milk delivery loop is validated.
