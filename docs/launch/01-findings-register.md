# ZaminFlow Launch Squad: Consolidated Findings Register

**Document ID:** `DOC-FND-LAUNCH-001`  
**Date:** 2026-11-08  
**Squad Leads:** Content, Performance, Design, QA  
**Status:** Open / Approval Gate  

---

### Executive Findings Summary Matrix

| ID | Squad Lens | Title | Severity | Effort | Change Class | Status |
|:---|:---|:---|:---:|:---:|:---:|:---|
| **FND-001** | Performance | Hero Image (735 kB) Exceeds Budget | **High** | S | **GREEN** | Ready for Implementation |
| **FND-002** | Performance | Render-Blocking Google Fonts `@import` | **High** | S | **GREEN** | Ready for Implementation |
| **FND-003** | Content / Legal | Missing Authentic Legal Entity & Contact Details | **Blocker** | M | **RED** | Awaiting Decision #1 |
| **FND-004** | Content / QA | Contact Form Uses Simulated `setTimeout` Dispatch | **Blocker** | M | **YELLOW** | Ready for Implementation |
| **FND-005** | Content / Design | Hero Bento Cards Present Static Figures as Live Market Data | **Medium** | S | **YELLOW** | Ready for Implementation |
| **FND-006** | Design | Role Dashboards Missing Role Eyebrow Above Welcome Heading | **Medium** | S | **GREEN** | Ready for Implementation |
| **FND-007** | Content / Legal | Contact Form Links to Non-Existent `#privacy` Anchor | **High** | M | **RED** | Awaiting Decision #4 |
| **FND-008** | Performance / A11y | Viewport Disables Mobile Zoom (`maximum-scale=1`) | **Medium** | S | **GREEN** | Ready for Implementation |
| **FND-009** | Content / SEO | Root Layout Hardcodes `lang="en"` for All Languages | **Medium** | S | **GREEN** | Ready for Implementation |
| **FND-010** | Design / Mobile | Driver Dashboard High-Contrast Mobile View Missing | **Medium** | M | **YELLOW** | Ready for Implementation |
| **FND-011** | Compliance / Legal | Uzbek Law ZRU-547 Data Localization Sign-Off Pending | **Blocker** | L | **RED** | Awaiting Decision #3 |
| **FND-012** | Content / i18n | Hardcoded English Strings in Farmer and Dairy Dashboards | **Medium** | M | **YELLOW** | Ready for Implementation |

---

## Detailed Findings & Decision Options

### FND-001: Hero Image (735 kB) Exceeds Performance Budget
- **Lens:** Web Performance Specialist
- **Severity:** High (Performance Blocker)
- **Evidence:** `frontend/public/images/hero-ecosystem-3d.jpg` is a 735,210-byte JPEG.
- **Impact:** On rural mobile connections (3G, 400 kbps), downloading the hero image takes ~15 seconds, destroying LCP and creating severe bounce risk.
- **Options Considered:**
  - *Option A (Recommended):* Generate responsive WebP/AVIF images with srcset ($\le 95\text{ kB}$ AVIF).
  - *Option B:* Recompress JPEG to 60% quality (~280 kB).
- **Recommendation:** Option A.
- **Change Class:** **GREEN** (Asset optimization, behavior-preserving).

---

### FND-002: Render-Blocking Google Fonts `@import`
- **Lens:** Web Performance Specialist
- **Severity:** High
- **Evidence:** `frontend/src/app/globals.css` line 1: `@import url('https://fonts.googleapis.com/...');`
- **Impact:** Blocks CSS stylesheet parsing until Google Fonts CSS and WOFF2 files resolve over international networks.
- **Options Considered:**
  - *Option A (Recommended):* Self-host WOFF2 font subsets or adopt `next/font/google` with local zero-RTT subsetting.
  - *Option B:* Keep external Google Fonts `@import`.
- **Recommendation:** Option A.
- **Change Class:** **GREEN**.

---

### FND-003: Missing Authentic Legal Entity & Contact Information
- **Lens:** Content Management Specialist & Compliance Lead
- **Severity:** Blocker (Commercial & Regulatory)
- **Evidence:** Footer and Contact Us section display placeholder contact details (`info@zaminflow.uz`, `+998 71 200 00 00`).
- **Impact:** Violates Uzbek Law No. ZRU-611 "On Electronic Commerce" (mandatory disclosure of entity name, INN, and address) and deprives farmers of real onboarding assistance.
- **Options Considered:**
  - *Option A (Recommended):* Supply real registered entity name, INN/STIR, support phone, and Telegram handle (Question #1).
  - *Option B:* Minimal launch set (1 dedicated mobile phone + 1 support email).
- **Recommendation:** Option A.
- **Change Class:** **RED** (Requires authentic business details from executive owner).

---

### FND-004: Contact Form Uses Simulated `setTimeout` Dispatch
- **Lens:** Content Management Specialist & QA
- **Severity:** Blocker
- **Evidence:** `frontend/src/components/ContactUsSection.tsx` lines 41-45: `setTimeout(() => setIsSubmitted(true), 600);`.
- **Impact:** Inquiries submitted by prospective dairy buyers and commercial farms are discarded silently.
- **Options Considered:**
  - *Option A (Recommended):* Wire form to `POST /api/v1/inquiries` with database persistence and notification dispatch.
  - *Option B:* Replace form with direct mailto/Telegram links.
- **Recommendation:** Option A.
- **Change Class:** **YELLOW**.

---

### FND-007: Contact Form Links to Non-Existent `#privacy` Anchor
- **Lens:** Content Management Specialist & Website Design Specialist
- **Severity:** High
- **Evidence:** `frontend/src/components/ContactUsSection.tsx` line 228: `<Link href="#privacy">`.
- **Impact:** Clicking "Privacy Policy" fails to navigate anywhere, violating transparency requirements under Law ZRU-547.
- **Options Considered:**
  - *Option A (Recommended):* Create dedicated `/privacy` and `/terms` accessible pages with clean typography.
  - *Option B:* Accessible modal dialog.
- **Recommendation:** Option A.
- **Change Class:** **RED** (Legal page creation requiring legal text approval).

---

### FND-011: Uzbek Law ZRU-547 Data Localization Sign-Off Pending
- **Lens:** Compliance Lead & Principal Architect
- **Severity:** Blocker
- **Evidence:** Law No. ZRU-547 Article 27¹ mandates storing citizen personal data inside Uzbekistan.
- **Impact:** Non-compliance risks O'zkomnazorat blocking access to the platform's domain.
- **Options Considered:**
  - *Option A (Recommended):* Host production PostgreSQL database in an Uzbek datacenter (Uztelecom Cloud / Server.uz).
  - *Option B:* Overseas hosting with legal waiver (high regulatory risk).
- **Recommendation:** Option A.
- **Change Class:** **RED** (Infrastructure & compliance decision).
