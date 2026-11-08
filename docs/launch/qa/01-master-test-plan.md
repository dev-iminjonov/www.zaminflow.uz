# ZaminFlow Master Launch QA Test Plan & Verification Strategy

**Document ID:** `DOC-QA-001`  
**Squad Lead:** Principal QA Engineer / SDET  
**Status:** Approved  
**Date:** 2026-11-08  

---

## 1. Test Strategy & Risk-Based Ranking

Tests are prioritized strictly by user, business, and financial risk:

| Priority | Risk Tier | Scope / Subsystem | Failure Impact | Test Strategy |
|:---:|:---:|:---|:---|:---|
| **P0** | **Critical Financial & Security** | Sign-up role guards (Admin privilege escalation prevention), Double-submit CSRF, Rate-limiting, Escrow calculation math | Unauthorized admin access, wallet theft, account takeover | Automated Pytest + dual-path proxy verification + live DB assertions |
| **P1** | **Core Transactional** | Farmer supply listing, Dairy titration intake, Driver pickup scan, Live statistics DB caching | Stalled milk intake, inaccurate public market data | End-to-end integration tests + concurrent cache stampede suite |
| **P2** | **UX & Accessibility** | WCAG 2.2 contrast, 44px touch targets, mobile responsiveness (360–390px), language switching | Poor user experience on mobile, accessibility non-compliance | Automated DOM attribute checks + axe accessibility scans |
| **P3** | **SEO & Hygiene** | Metadata, OpenGraph, sitemap, robots, 404/500 handling | Search indexing degradation | Static metadata assertions |

---

## 2. Test Execution & Pass Criteria

- **Automated Regression Suite:** 100% pass required on every commit (`pytest tests/ -v`).
- **Defect Re-test Standard:** A defect is marked `Verified (Closed)` only if:
  1. The reproducing test failed when the bug was present.
  2. The test passed after remediation.
  3. No regressions occurred in adjacent flows.
- **Flakiness Threshold:** 0 tolerated flaky tests.

---

## 3. Test Environment Topology

- **Web Frontend:** Next.js 15.5.29 (`http://localhost:3000`)
- **Backend API:** FastAPI v3.0 (`http://localhost:8000`)
- **Database:** PostgreSQL 16 PostGIS (`localhost:5432`)
- **Edge Proxy:** Caddy 2 (`localhost:80` / `localhost:443`)
