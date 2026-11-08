# ZaminFlow Production Performance Budgets & CI Enforcement

**Document ID:** `DOC-PERF-002`  
**Squad Lead:** Web Performance Optimization Specialist  
**Status:** Policy Defined  
**Date:** 2026-11-08  

---

## 1. Budget Targets (Per-Page Thresholds)

All thresholds are enforced against production build output (`next build`).

| Resource Type | Landing Page (`/`) | Auth (`/sign-in`, `/sign-up`) | Role Dashboards (`/dashboard/*`) | Maximum Tolerated Variance |
|:---|:---:|:---:|:---:|:---:|
| **Initial JS (Gzip)** | $\le 170\text{ kB}$ | $\le 110\text{ kB}$ | $\le 210\text{ kB}$ | +5% |
| **Global CSS (Gzip)** | $\le 25\text{ kB}$ | $\le 20\text{ kB}$ | $\le 30\text{ kB}$ | +5% |
| **Hero LCP Image** | $\le 120\text{ kB}$ | N/A (SVG Logo $\le 15\text{ kB}$) | N/A | 0% |
| **Total Images (Initial)** | $\le 350\text{ kB}$ | $\le 50\text{ kB}$ | $\le 150\text{ kB}$ | +10% |
| **Fonts (Self-hosted WOFF2)** | $\le 70\text{ kB}$ | $\le 70\text{ kB}$ | $\le 70\text{ kB}$ | 0% |
| **Total Initial Page Weight** | $\le 735\text{ kB}$ | $\le 250\text{ kB}$ | $\le 460\text{ kB}$ | +5% |

---

## 2. Core Web Vitals (CWV) Targets (Mobile 75th Percentile)

Measured under simulated Moto G4 / 4x CPU Slowdown on Fast 3G / Slow 4G (1.6 Mbps down, 750 kbps up, 150 ms RTT):

- **LCP (Largest Contentful Paint):** $\le 2.5\text{ s}$
- **INP (Interaction to Next Paint):** $\le 200\text{ ms}$
- **CLS (Cumulative Layout Shift):** $\le 0.05$ (Target 0.00 on Live Stats)
- **TTFB (Time to First Byte):** $\le 0.8\text{ s}$
- **Lighthouse Performance Score:** $\ge 90$

---

## 3. Automated CI Enforcement Script

Any pull request that increases bundle sizes beyond the agreed threshold fails the deployment pipeline:

```bash
# Production Bundle Size Check in CI
npm run build
node ./scripts/check-bundle-budgets.js
```
