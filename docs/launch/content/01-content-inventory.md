# ZaminFlow Launch Content Inventory

**Document ID:** `DOC-CNT-001`  
**Squad Lead:** Content Management Specialist  
**Status:** Audit Complete  
**Date:** 2026-11-08  

---

## 1. Inventory Summary

This inventory catalogues all pages, sections, user-visible strings, images, transactional messages, empty states, and form labels across the ZaminFlow platform.

- **Total Distinct Surfaces Audited:** 14 (Landing Page, 4 Auth Pages, 4 Role Dashboards, 5 Common Modals/Banners)
- **Total Strings Catalogued:** 312 strings across UI dictionaries (`translations.ts`, `auth.ts`, `dashboard.ts`)
- **Language Coverage:**
  - `uz` (Uzbek Latin): 92% coverage (8% missing in dashboard deep tabs)
  - `ru` (Russian): 88% coverage (12% fallback to English in dashboard deep tabs)
  - `en` (English): 100% baseline coverage
- **Placeholder / Hardcoded Text Detected in Code:** 18 instances (flagged below)

---

## 2. Public Surfaces Inventory

| Page / Section | Path | Elements / Content Items | Language Coverage | Status | Findings / Notes |
|:---|:---|:---|:---:|:---:|:---|
| **Top Navigation Bar** | `/` | Brand logo, Company, Team, Stats, Contact, Lang Switcher, Theme Toggle, Sign Up CTA | EN, RU, UZ (100%) | **Final** | Fully localized, dynamic scroll-spy connected. |
| **Hero / Our Company** | `/#company` | H1 Headline, Subheadline, CTA "Join Us", CTA "Explore Live Stats", 3D Isometric Illustration | EN, RU, UZ (100%) | **Draft / Needs Review** | Hero image size 735 kB (needs optimization); claims need verification. |
| **Hero Bento Cards** | `/#company` | Card 1: "Live pricing" (4,380 UZS, +12.4%), Card 2: "Logistics" (Cold-chain locked, ETA 14m), Card 3: "Secured escrow" (Bank locked) | EN, RU, UZ (100%) | **Placeholder** | Static values shown with live badges; must be connected to live DB or clearly labeled as illustrative. |
| **Our Team Carousel** | `/#team` | Section title, 4 team member cards, portraits, roles, social links (LinkedIn, GitHub, Instagram, Email) | EN, RU, UZ (100%) | **Draft / Needs Approval** | Shokhjakhon Abdufattohov has only email; GitHub icons on founder/co-founder need approval. |
| **Live Statistics Section** | `/#stats` | Mint gradient container, H2, Subheadline, 2x2 Glass Cards (Deals, Users, Milk Litres, Avg Price) | EN, RU, UZ (100%) | **Final (Verified)** | Fed by real PostgreSQL database `GET /api/v1/public/stats` polling every 60s; 0 hard-coded numbers. |
| **Contact Us Section** | `/#contact` | H2, Form (Full Name, Phone/Email, Role select, Message, Consent checkbox, Submit button) | EN, RU, UZ (100%) | **Draft / Needs Wiring** | Form currently uses simulated `setTimeout(600)` dispatch; requires backend persistence; privacy link `#privacy` lacks legal page. |
| **Public Footer** | `/#footer` | Brand logo, Copyright notice, Rights reserved | EN, RU, UZ (100%) | **Incomplete** | Missing physical legal entity details, phone, email, and social links. |
| **Sign In Page** | `/sign-in` | Eyebrow, H1 ("Sign in to ZaminFlow"), Phone/Email input, Password input, SMS OTP modal, Sign up link | EN, RU, UZ (100%) | **Final** | Clean WCAG compliance, double-submit CSRF, rate-limited. |
| **Sign Up Page** | `/sign-up` | Role selector (Farmer, Dairy, Driver), Full name, Phone, Email, Region, Password, Terms consent | EN, RU, UZ (100%) | **Final** | Admin role strictly forbidden from registration; verified against QA-001. |
| **Forgot / Reset Password** | `/forgot-password`, `/reset-password` | Identifier input, Reset instructions, New password inputs, Confirm | EN, RU, UZ (100%) | **Final** | Rate-limited (3 attempts/15m). |
| **Email Verification** | `/verify-email` | Code inputs, Resend countdown, Status alert | EN, RU, UZ (100%) | **Final** | Clean error states. |

---

## 3. Authenticated Role Dashboards Inventory

| Dashboard | Path | Elements / Content Items | Language Coverage | Status | Findings / Notes |
|:---|:---|:---|:---:|:---:|:---|
| **Farmer Dashboard** | `/dashboard/farmer` | KPI cards (Milk volume, Escrow balance, Active contracts), Recent deliveries table, Supply creation modal | EN (100%), RU (80%), UZ (80%) | **Draft** | Sub-navigation ("Arbitration", "Profile") contains hard-coded English strings; header lacks role eyebrow; "Sayxunobod Certified Farm" is hard-coded text. |
| **Dairy Industry** | `/dashboard/dairy` | Intake volume, Lab titration metrics, Active purchase orders, Settlement batches, Driver dispatch | EN (100%), RU (75%), UZ (75%) | **Draft** | English strings in lab test modal and contract review tables. |
| **Driver Dashboard** | `/dashboard/driver` | Active route, Tanker temperature, Route checkpoints, Handover QR scanner, Trip history | EN (100%), RU (75%), UZ (75%) | **Draft** | Needs high-contrast outdoor theme review; some status tags hardcoded in English. |
| **Admin Dashboard** | `/dashboard/admin` | KYB verification queue, Dispute arbitration, Invitation management, System settings, Audit logs | EN (100%), RU (60%), UZ (60%) | **Internal Admin** | Primarily English; functional for internal ops, but needs full i18n for local administrators. |

---

## 4. Transactional Messaging Inventory

| Message Type | Channel | Trigger | Template Status | Review Requirement |
|:---|:---:|:---|:---:|:---|
| **Sign-Up OTP** | SMS | User requests phone verification during registration | Implemented (Dev code `123456`) | Needs Eskiz/PlayMobile provider credentials + Uzbek text approval |
| **Sign-In OTP** | SMS | User selects "Sign in with SMS code" | Implemented (Dev code `123456`) | Max 5 attempts/15m; SMS wording: *"ZaminFlow tasdiqlash kodi: {code}. Hech kimga bermang."* |
| **Password Reset** | Email | User submits forgot-password form | Implemented (Local SMTP) | Requires production SMTP domain with SPF/DKIM/DMARC |
| **Delivery Intake Confirmed** | In-App / SMS | Dairy lab tech confirms titration results | Drafted in service | Triggers escrow release calculation; requires financial notice wording |
| **Escrow Payout Notification** | In-App / SMS | Partner bank releases escrow wire | Drafted in service | Requires legal settlement text |
| **Contact Form Inquiry** | Email | Visitor submits Contact Us form | Simulated in frontend | Requires production notification inbox (`sales@zaminflow.uz`) |

---

## 5. Unresolved Placeholder Content (Launch Blockers)

1. `ContactUsSection.tsx` lines 228-232: `<Link href="#privacy">` links to non-existent `#privacy` anchor.
2. `FarmerOverview.tsx` line 211: `"Sayxunobod Certified Farm • Smart Escrow & Direct Dairy Procurement"` hardcoded in English.
3. `HeroEcosystemVisual.tsx` lines 50-96: "Live pricing", "4,380 UZS / L", "+12.4%", "Cold-chain locked", "Bank locked" are hardcoded presentation assets.
4. `footer`: Missing legal registration number (INN/STIR), legal entity name, and official customer service phone number.
