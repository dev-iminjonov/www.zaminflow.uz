# ZaminFlow User Acceptance Testing (UAT) Execution Script

**Document ID:** `DOC-QA-005`  
**Squad Lead:** Principal QA Engineer / SDET  
**Target Audience:** Product Owner / Business Stakeholders / Launch Squad  
**Status:** Ready for Execution  
**Date:** 2026-11-08  

---

## 1. Overview & Instructions

This plain-language checklist allows anyone to verify all primary user journeys and role permissions on the platform before go-live.

**Test Base URL:** `http://localhost:3000` (or staging domain)

---

## 2. Public Visitor Journey (Landing Page)

- [ ] **Step 1: Visual Presentation & Scroll-Spy**
  - Navigate to `http://localhost:3000/`.
  - Confirm page loads with dark background and vibrant green accents.
  - Scroll down through sections: "Our Company", "Our Team", "Live Statistics", "Contact Us".
  - Observe the top floating navigation pill: the active pill underline moves dynamically to match the section in view.
- [ ] **Step 2: Language Switching**
  - Click the Language dropdown in the header and switch between **Oʻzbekcha (UZ)**, **Русский (RU)**, and **English (EN)**.
  - Verify that headlines, navigation items, and button labels update immediately without page reload.
- [ ] **Step 3: Dark / Light Mode Toggle**
  - Click the Sun/Moon toggle icon in the top header.
  - Confirm the page transitions smoothly to the Coolors light palette (`#d8f3dc` mint tones, `#081c15` forest dark text) and back.
- [ ] **Step 4: Live Platform Statistics Section**
  - Scroll to the mint gradient section titled *"Real deals, real milk, real prices"*.
  - Verify that 4 glass cards are displayed: *Successful deals*, *Platform users*, *Milk traded & delivered*, and *Daily avg. raw milk price*.
  - Verify numbers are real database aggregates (currently 0) and formatted cleanly (e.g. `0 L`, `0 UZS / L`), not broken or showing NaN.
- [ ] **Step 5: Team Carousel**
  - Scroll to "Our Team". Confirm portraits of the 4 team members are crisp.
  - Click the left and right arrow buttons to scroll the cards smoothly.
  - Confirm social media icon buttons have comfortable tap zones.
- [ ] **Step 6: Contact Us Inquiry Submission**
  - Scroll to the Contact Us section.
  - Enter full name, phone number (`+998 90 123 45 67`), select role "Farmer", enter message "Test milk inquiry", check the consent box, and click Submit.
  - Verify the form displays a green checkmark success state.

---

## 3. Farmer Role Journey

- [ ] **Step 1: Public Registration**
  - Click "Sign up" in the top right.
  - Select role: **Farmer**.
  - Enter full name (e.g. `Anvar Dehqon`), phone (`+998 90 555 12 34`), email, region (`Sirdaryo`), password (`ZaminFlow2026!`), check Terms, and submit.
  - Confirm account is created and redirected to email verification or sign-in.
- [ ] **Step 2: Sign In & Dashboard Access**
  - Navigate to `/sign-in`.
  - Enter farmer credentials and submit.
  - Confirm successful login redirects to `/dashboard/farmer`.
  - Verify greeting shows *"Xush kelibsiz"* (or *"Welcome back"* in English) with the farmer's first name.
- [ ] **Step 3: Role Isolation Security Check**
  - Attempt to manually type `/dashboard/admin` into the browser URL bar.
  - Confirm the platform immediately rejects access and redirects back to `/dashboard/farmer` (Privilege Escalation Blocked).

---

## 4. Dairy Processing Industry Journey

- [ ] **Step 1: Sign In**
  - Sign in with dairy credentials.
  - Confirm redirection to `/dashboard/dairy`.
- [ ] **Step 2: Quality Intake Review**
  - View the Milk Intake queue and verify laboratory quality parameters (fat %, SNF %, temperature).

---

## 5. Driver Logistics Journey

- [ ] **Step 1: Mobile Viewport Check**
  - Open Chrome DevTools (`F12`), toggle Device Toolbar, and select **iPhone 12 / 14 (390px width)**.
  - Sign in as Driver.
  - Confirm navigation does not overflow horizontally and touch targets are easy to tap with one thumb.

---

## 6. System Administrator Journey

- [ ] **Step 1: Admin Sign-In**
  - Navigate to `/sign-in`.
  - Sign in using an authorized administrator account (e.g. `dev.iminjonov@gmail.com` with password `Mukhammadaziz_A_16x`).
  - Confirm redirection to `/dashboard/admin`.
- [ ] **Step 2: Administration Modules Access**
  - Verify sidebar access to: KYB Verification Queue, Dispute Arbitration, Invitations, System Settings, Audit Logs.
  - Confirm public sign-up cannot register new admin accounts.
