# QA Clarification Questions (Ask-Me Protocol)

**Document ID:** QA-Q-001  
**Project:** ZaminFlow B2B Dairy Supply Platform  
**Date:** 2026-11-07  
**Author:** Principal QA Engineer / SDET  
**Status:** Open – Awaiting Product Owner & Engineering Decisions  

---

### Instructions for Stakeholder / Product Owner
Please respond to each numbered question by reference (e.g. "Answer to Q1: Option B"). Until formal clarification is received, affected test cases have been marked **"Blocked – awaiting answer #n"** or tested against the recorded working hypothesis.

---

### Numbered Questions List

#### Q1: Meaning and Source of the `+3.2°C cold` Badge on Dairy Dashboard
* **Where Observed:** Watch List item 4, Dairy Dashboard KPI card (`Active shipments`), and `MOCK_DAIRY_DATA.activeShipments.coldStatus`.
* **Why it Matters:** In cold-chain logistics, temperature telemetry determines payment release and food safety compliance. It is unclear whether `+3.2°C` represents:
  - (a) Fleet-wide arithmetic mean temperature across all 47 active tankers,
  - (b) The maximum (worst-case) reading among active shipments,
  - (c) A temperature deviation from setpoint (e.g., target is 4.0°C, currently at 3.2°C), or
  - (d) A static UI badge.
* **Working Assumption in Testing:** Assumed it represents the current fleet average temperature.
* **Available Options:**
  - *Option A:* Clarify as "Fleet Avg Temp (+3.2°C)" and trigger an amber alert if any single tanker exceeds 4.0°C.
  - *Option B:* Replace with "All 47 In Range (3.2°C max)".
  - *Option C:* Display dynamic range `[2.8°C – 3.6°C]`.

---

#### Q2: Landing Page Heading Hierarchy (Two `<h1>` Elements on Same Route)
* **Where Observed:** Landing page (`/`) contains `<h1 className="... font-black">Connecting smallholder farmers with commercial buyers</h1>` in the Hero section AND `<h1 className="text-4xl sm:text-[56px] ...">Active Trade Metrics</h1>` in the `#stats` section.
* **Why it Matters:** WCAG 2.2 Success Criterion 1.3.1 (Info and Relationships) and HTML5 specifications mandate exactly one `<h1>` per document to represent the primary page subject for screen readers and search engines.
* **Working Assumption in Testing:** Flagged as Defect QA-003.
* **Available Options:**
  - *Option A:* Demote `#stats` heading to `<h2>Active Trade Metrics</h2>` while preserving the exact 56px visual styling.
  - *Option B:* Keep `<h1>` only when `#stats` is rendered on a standalone dedicated route (`/stats`), and render `<h2>` when embedded in the landing page (`/`).

---

#### Q3: Expected Number and Currency Formatting per Locale
* **Where Observed:** Numbers are rendered variously as `"4,380"` (Anglo-American comma), `"4 380"` (Uzbek/French space separator), `"5,256,000 UZS"` vs `"5 256 000 so'm"`.
* **Why it Matters:** Financial consistency across accounting ledgers, farmer payouts, and bank escrow statements. In Uzbekistan, standard banking formats use non-breaking spaces for thousand separators (`4 380 so'm`).
* **Working Assumption in Testing:** Assumed comma-separated `4,380` for English and space-separated `4 380` for Uzbek/Russian.
* **Available Options:**
  - *Option A:* Standardize on `Intl.NumberFormat(locale)` with `UZS` / `so'm` suffix.
  - *Option B:* Keep English comma formatting platform-wide.

---

#### Q4: Titration Authority & Payout Trigger Delegation
* **Where Observed:** End-to-end escrow release workflow.
* **Why it Matters:** Who holds the legal authorization to input acidity/titration test numbers and unlock escrow funds?
  - Can the Dairy unilaterally alter acidity to lower the milk payout grade?
  - Does the Farmer have an automated dispute window (e.g. 2 hours) before bank funds settle?
  - Does an independent certified field lab or driver seal test need to countersign?
* **Working Assumption in Testing:** Currently, the Dairy's gate lab input instantly triggers bank disbursement reference `AGRO-SETTLE-XXXXXX`.
* **Available Options:**
  - *Option A:* Immediate release upon Dairy gate lab submission with a 24-hour dispute escrow hold.
  - *Option B:* Dual confirmation required (both Driver counter-sign on sample seal + Dairy lab intake).

---

#### Q5: Mobile Responsive Specifications for Driver Dashboard (<640px)
* **Where Observed:** The Figma design canvas artboard for the Driver Dashboard exists only at 1440px desktop resolution.
* **Why it Matters:** 100% of milk collection truck drivers use mobile smartphones (Android/iOS) mounted in tanker cabs. On 360px–390px screens, the current desktop navigation bar with 4 text tabs wraps jaggedly and header controls overlap.
* **Working Assumption in Testing:** Driver workflow must be fully optimized for single-handed mobile touch use (min 48px tap targets, bottom navigation bar or stacked cards).
* **Available Options:**
  - *Option A:* Provide a dedicated mobile layout artboard for Driver `/dashboard/driver`.
  - *Option B:* Approve SDET recommendation: collapsible bottom tab bar on mobile screens.

---

#### Q6: SMS Gateway Test Mode Credentials & Rate Limit Thresholds
* **Where Observed:** `/signin` (SMS code) and public `/signup`.
* **Why it Matters:** Need formal policy on production SMS provider (Eskiz.uz vs PlayMobile) and whether `123456` dev OTP will remain active on staging/sandbox environments. What are the lockout thresholds for SMS requests per IP per hour?
* **Working Assumption in Testing:** Assumed `123456` valid only on non-production builds with a max of 5 consecutive verification attempts.
