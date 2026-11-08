# ZaminFlow Missing Screens & State Catalog

**Document ID:** `DOC-DSGN-004`  
**Squad Lead:** Website Design Specialist & Product Architect  
**Status:** Review Required  
**Date:** 2026-11-08  

---

## 1. Missing Screens, States & Edge Cases Catalog

In accordance with Section 7 of the Launch Squad Protocol:
*The specialist must list every screen, state, and flow that exists in code or navigation but not in the approved design canvas. Do NOT invent them silently: present the list, propose designs, and wait for executive approval.*

| # | Screen / State / Flow | Current Code State | Missing Design Elements | Proposed Solution / Recommendation | Change Class |
|:---:|:---|:---|:---|:---|:---:|
| **M-01** | **Privacy Policy & Terms Pages** | Linked via `href="#privacy"` in Contact form & footer | Full legal text layout, typography, section navigation, print styling | Create clean, responsive `/privacy` and `/terms` pages using standardized typography tokens and approved legal text. | **RED** |
| **M-02** | **404 Not Found Page** | Next.js default minimal 404 | Branded illustration, helpful navigation back to Home or Dashboard, search shortcut | Design branded 404 page matching the dark/light palette with *"Page Not Found"* and quick navigation buttons. | **GREEN** |
| **M-03** | **500 Internal Server Error Page** | Next.js default minimal error | Helpful message, incident reference code, retry button, customer support link | Design branded 500 error page with error recovery actions. | **GREEN** |
| **M-04** | **Farmer: List Milk Supply Modal** | Button exists in `/dashboard/farmer` (`+ List Supply`) | Full multi-step modal (volume, tank temp, morning/evening milking, collection window) | Standardized modal dialog with clear numeric inputs, validation, and estimated payout preview. | **YELLOW** |
| **M-05** | **Dairy: Confirm Titration & Intake** | Route exists in `/dashboard/dairy/intake` | Lab test entry form (fat %, SNF %, titration °T, temperature, accept/reject decision) | High-contrast industrial intake form with automatic price adjustment preview and dispute trigger threshold warning ($>0.20\%$). | **YELLOW** |
| **M-06** | **Driver: Outdoor High-Contrast Mobile View** | Route exists at 1440px desktop | High-visibility outdoor mobile layout (one-handed thumb zone, large QR scanner trigger, high-contrast text) | Mobile-first bottom action drawer for Driver routes at 360px–390px. | **YELLOW** |
| **M-07** | **Quality Dispute Arbitration Flow** | Nav link "Arbitration" in Farmer/Dairy dashboards | Dispute timeline, vial reference code entry, third-party lab upload, escrow freeze banner | Standardized dispute status view showing escrow freeze state and resolution timer (48h). | **YELLOW** |
| **M-08** | **Dashboard Empty States** | Basic text "No records found" | Visual empty states with friendly icon, explanatory text, and primary call-to-action button | Component `<EmptyState icon="..." title="..." action="..." />` for tables with 0 records. | **GREEN** |
| **M-09** | **Loading Skeletons** | Basic CSS spinners | Animated shimmer placeholder cards matching exact card dimensions (prevents CLS) | Pulse skeletons matching KPI cards, table rows, and live statistics containers. | **GREEN** |
