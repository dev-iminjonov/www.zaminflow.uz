# ZaminFlow Launch Squad: Open Questions Register

**Document ID:** `DOC-LAUNCH-QST-001`  
**Date Created:** 2026-11-08  
**Squad:** Launch Squad (Content, Performance, Design, QA)  
**Status:** Open / Awaiting Executive Decision  

---

### Mandatory Ask-Me Protocol Summary
In accordance with the **Ask-Me Protocol**, this document maintains the unified, numbered register of critical product, legal, brand, operational, and architectural decisions requiring executive resolution.

For every question, we specify:
1. **The Question**
2. **Why It Matters to Launch Readiness**
3. **What We Assumed Meanwhile (Unblocked State)**
4. **Options & Trade-offs**
5. **Impact if Assumption is Wrong**

---

### Question 1: Real Company & Contact Information
- **Question:** What are the authentic legal company details for the Contact section, footer, and invoices:
  - Registered legal entity name (e.g. "ZaminFlow MCHJ" or "OOO ZaminFlow") and registration/tax number (INN/STIR)?
  - Official business address (city, street, building, postal code)?
  - Public contact phone number(s)?
  - Official contact email address (e.g. `support@zaminflow.uz` / `info@zaminflow.uz`)?
  - Official Telegram support handle (e.g. `@zaminflow_support` or bot)?
  - Official operating hours (e.g. 08:00 – 18:00 Tashkent time, Mon–Sat)?
  - Official social media links (LinkedIn, Telegram Channel, Instagram, Facebook)?
- **Why It Matters:** Production launch cannot ship with placeholder contact data (`+998 71 000 00 00`, `info@example.com`, `Tashkent, Uzbekistan`). Farmers and dairy procurement teams require verifiable contact channels for onboarding and dispute escalation.
- **Assumed Meanwhile:** In UI components, fallback to labeled placeholders `info@zaminflow.uz`, `+998 71 200 00 00`, and office address `Tashkent, Mirzo Ulugbek District`, but flag as launch blockers (`S1 / P0`).
- **Options:**
  - *Option A (Recommended):* Supply real operating legal entity name, STIR, corporate phone, Telegram bot/handle, and support email immediately.
  - *Option B:* Minimal launch set: 1 dedicated support phone, 1 support email, and 1 Telegram bot.
- **Impact if Wrong:** Contact submissions go nowhere, potential customers cannot reach sales/support, and platform lacks commercial credibility.

---

### Question 2: Launch Date, Domain, Infrastructure, and Operational Ownership
- **Question:** What is the target launch date, primary domain name(s) (e.g. `zaminflow.uz` vs `www.zaminflow.uz`), server hosting target (local Uzbek datacenter vs international cloud with in-country data proxy), and who operates and monitors the platform post-launch?
- **Why It Matters:** Directs DNS configuration, SSL/TLS certificates, reverse proxy redirect logic (apex vs www canonical), and on-call alerting routing.
- **Assumed Meanwhile:** Domain is `zaminflow.uz` (with `www.zaminflow.uz` redirecting to apex); single-region Docker/Caddy deployment hosted in Uzbekistan (or local VPS); launch target Q1 2027; developer on-call rotation.
- **Options:**
  - *Option A:* Local Uzbek VPS/Cloud (Uztelecom Cloud, Server.uz, ActiveCloud) for direct UZ-IX low-latency peering.
  - *Option B:* International Cloud (AWS/DigitalOcean/Hetzner) behind Cloudflare (requires legal assessment under ZRU-547).
- **Impact if Wrong:** DNS misconfigurations, slow network routing for mobile carriers (Ucell, Beeline, Mobiuz), and operational confusion during production incidents.

---

### Question 3: Localization Priorities & Translation Governance
- **Question:** What is the language hierarchy and delivery model:
  - Priority order among Uzbek Latin (`uz`), Russian (`ru`), and English (`en`)? Is Uzbek Cyrillic required?
  - What is the default platform language for first-time visitors (Uzbek Latin or Russian)?
  - Who translates and formally reviews UI strings and legal notices? (Can we engage a certified translator or native domain reviewer?)
  - Number and currency formatting: how should Uzbek Som and large volumes be displayed across `uz`, `ru`, and `en`? (e.g., `4 200 000 so'm` vs `4.2M UZS`)?
- **Why It Matters:** Farmers and regional drivers primarily speak Uzbek (Latin/Cyrillic), while corporate dairy procurement managers and accountants often operate in Russian. High-converting B2B requires culturally accurate dairy terminology (*"sut qabuli"*, *"yog'lilik darajasi"*, *"titrlangan kislotalilik"*).
- **Assumed Meanwhile:** Default language is Uzbek Latin (`uz`), followed by Russian (`ru`) and English (`en`); Uzbek Cyrillic deferred to post-launch; translation strings managed in Next.js JSON message files; translations marked "DRAFT - needs native review".
- **Options:**
  - *Option A (Recommended):* 3 languages: `uz` (Latin default), `ru`, `en`. Number format: space as thousands separator (`12 500 UZS`, `4.2M L`).
  - *Option B:* `uz` (Latin) and `ru` only; defer `en`.
- **Impact if Wrong:** Misunderstood quality metrics or contract terms leading to delivery disputes and onboarding friction.

---

### Question 4: Legal Framework, Data Protection (ZRU-547), and Terms Approval
- **Question:** Who is the qualified Uzbek legal counsel providing and approving:
  - Platform Terms of Service (B2B milk marketplace and logistics terms)?
  - Privacy Policy and Personal Data Processing Consent (under Law No. ZRU-547 "On Personal Data", including physical database storage of citizen PII within Uzbekistan)?
  - Milk Quality Dispute Resolution & Escrow Arbitration Rules?
  - Cookie Notice and Driver GPS Telemetry Tracking Consent?
- **Why It Matters:** Deploying commercial B2B contracts, driver geolocation tracking, and farm KYB data without compliant legal disclosures violates Uzbek regulatory statutes and creates financial liability.
- **Assumed Meanwhile:** Draft standard compliance frameworks with explicit notices (*"DRAFT - requires qualified Uzbek legal review"*); do not present legal copy as certified final text.
- **Options:**
  - *Option A (Recommended):* Retain local counsel specializing in Uzbek commercial law and e-commerce for sign-off prior to public sign-ups.
  - *Option B:* Launch in closed pilot (controlled beta) under signed bilateral offline agreements.
- **Impact if Wrong:** State Inspectorate "O'zkomnazorat" regulatory sanctions, domain blocking, or unenforceable commercial terms.

---

### Question 5: Brand Assets, Team Verification, and Social Links
- **Question:** 
  - Are official vector logo SVG files, brand font licenses, and high-res social share images (Open Graph 1200x630) available?
  - Origin and commercial licensing rights of the hero 3D isometric dairy farm illustration?
  - Are all team members, job titles, and bios in the Team Carousel accurate and individually consented?
  - Do executive team members (Founder, Co-Founder) want GitHub, LinkedIn, or Telegram icons displayed on the public landing page?
- **Why It Matters:** Unlicensed assets create copyright liability; incorrect bios or social links undermine trust with commercial dairy enterprises.
- **Assumed Meanwhile:** Current isometric hero illustration and team data are retained in draft form; GitHub links removed for non-technical roles unless verified.
- **Options:**
  - *Option A:* Confirm team photos, names, titles, and exact approved social profile links (LinkedIn / Telegram).
  - *Option B:* Simplify team presentation to core leadership or platform credentials.
- **Impact if Wrong:** Reputational embarrassment, broken social links, or copyright claims on imagery.

---

### Question 6: Public Claims, Marketing Transparency, and Real vs Mock Figures
- **Question:** Which claims on the landing page are legally verifiable and approved for public marketing:
  - "Bank vault secured escrow" / "Partner bank guaranteed settlement": Which commercial bank is under contract?
  - "Automated factoring within 24 hours": Is factoring operational at launch or a roadmap feature?
  - "Auto-release upon titration": Is titration automated via IoT milk analyzers or entered by certified lab technicians?
  - Hero floating badge values: Should the 3 floating cards ("Live pricing", "Logistics", "Secured escrow") reflect real live aggregations or be labeled as illustrative platform features?
- **Why It Matters:** Misrepresenting financial partnerships (e.g. claiming a specific bank guarantee before contract execution) violates consumer protection and banking marketing regulations.
- **Assumed Meanwhile:** Clearly label unintegrated services as *"Platform capability (In rollout)"*; remove speculative bank logos; hero floating cards represent UI capability previews, not real-time tick feeds.
- **Options:**
  - *Option A (Recommended):* Audit every public claim; replace unverified bank guarantees with accurate descriptions of escrow holding accounts.
  - *Option B:* Retain broad marketing copy with general disclaimers.
- **Impact if Wrong:** Legal scrutiny from Central Bank of Uzbekistan or partner financial institutions.

---

### Question 7: Performance & Hardware Targets for Rural Uzbekistan
- **Question:** What are the agreed target devices, network conditions, and browser matrix:
  - Supported low-end Android mobile devices (e.g. Android 10+, Chrome Mobile 110+, Samsung Internet)?
  - Low-bandwidth target: Should we optimize specifically for rural 3G / throttled 2G connections (e.g. 400ms RTT, 400 kbps downlink)?
  - Offline driver support: Should the driver pickup/dropoff workflow support offline caching with background sync?
- **Why It Matters:** Farmers in regional areas (Fergana Valley, Jizzakh, Khorezm) often operate budget smartphones (e.g. Xiaomi Redmi 9A, Samsung Galaxy A03) on 3G cellular networks. Heavy JavaScript bundles or complex blur filters cause severe lag or failed loads.
- **Assumed Meanwhile:** Budget: Landing page JS <= 170 kB gzip; hero image <= 150 kB; LCP <= 2.5s on 4G, <= 4.0s on Slow 3G; fallback styles for CSS `backdrop-filter` on low-power GPUs.
- **Options:**
  - *Option A (Recommended):* Strict performance budget enforcing lightweight assets, aggressive image optimization (AVIF/WebP), and simple CSS fallbacks.
  - *Option B:* Optimize only for modern 4G / desktop speeds.
- **Impact if Wrong:** High bounce rate among rural farmers unable to load the landing page or complete sign-up.

---

### Question 8: Analytics, Consent, and Error Monitoring
- **Question:** Which analytics and operational telemetry tools are permitted:
  - Self-hosted lightweight analytics (e.g. Plausible / Umami) vs Google Analytics 4?
  - Is an explicit cookie consent banner required under Uzbek commercial practice if only strictly necessary functional cookies and privacy-friendly telemetry are used?
  - Which error tracking service should be configured (Sentry self-hosted, GlitchTip, or backend structured JSON logs)?
- **Why It Matters:** Third-party tracking scripts bloat page weight by 50–100 kB and send citizen metadata to foreign servers, potentially conflicting with ZRU-547 data localization.
- **Assumed Meanwhile:** Zero third-party marketing trackers in v1; strictly necessary session cookies (`HttpOnly; Secure; SameSite=Lax`); privacy-first structured logging in backend.
- **Options:**
  - *Option A (Recommended):* No tracking cookies; cookieless self-hosted analytics; no cookie banner required for launch.
  - *Option B:* Full GA4 + Google Tag Manager + Cookiebot modal banner.
- **Impact if Wrong:** Script bloat degrades Core Web Vitals; foreign data transfer concerns under privacy laws.

---

### Question 9: Transactional Email & SMS Gateway Configuration
- **Question:** What are the authenticated production communication providers:
  - Outbound email domain and SMTP provider (e.g. Mailgun, Postmark, Amazon SES, or local ISP SMTP) with configured SPF, DKIM, DMARC?
  - Production SMS Gateway aggregator (Eskiz.uz vs PlayMobile.uz) and official registered Alpha-numeric Sender ID (*"ZaminFlow"* or *"Zamin"* approved by Uztelecom/O'zinfocom)?
  - Recipient email/channel for Contact Us inquiries? Expected SLA response time (e.g. 24 hours)?
- **Why It Matters:** Transactional sign-up OTP codes and email verifications fail without registered sender IDs and valid DNS records.
- **Assumed Meanwhile:** Local dev OTP (`123456`) enabled in testing; Contact Us messages persisted to database table `inquiries` and forwarded via internal notification queue.
- **Options:**
  - *Option A (Recommended):* Contract Eskiz.uz or PlayMobile with registered Sender ID `ZaminFlow`; configure Postmark/SES with SPF/DKIM/DMARC on `zaminflow.uz`.
  - *Option B:* Rely on email-only verification for launch; defer SMS.
- **Impact if Wrong:** Users cannot receive verification codes and cannot complete sign-up.

---

### Question 10: Content Editing Workflow Post-Launch
- **Question:** How will non-engineering staff update website content (announcements, blog posts, price bulletins, team updates) post-launch:
  - Direct developer PRs editing JSON translation files (`frontend/src/messages/*.json`)?
  - Headless CMS integration (e.g. Strapi, Directus, Sanity)?
- **Why It Matters:** Integrating a CMS adds architectural overhead, database models, and deployment complexity that could delay launch.
- **Assumed Meanwhile:** Launch v1 uses file-based translations in Git; no CMS dependencies added; CMS deferred to post-launch backlog.
- **Options:**
  - *Option A (Recommended):* Git-backed JSON translation files for v1 launch; simple, zero latency overhead, zero extra infrastructure.
  - *Option B:* Introduce headless CMS (Strapi/Directus) prior to launch.
- **Impact if Wrong:** Unnecessary complexity and potential security vectors if a full CMS is introduced before launch.
