# ZaminFlow Performance Optimization Plan & Implementation Strategy

**Document ID:** `DOC-PERF-003`  
**Squad Lead:** Web Performance Optimization Specialist  
**Status:** Audit & Action Plan Complete  
**Date:** 2026-11-08  

---

## 1. Prioritized Optimization Backlog

| Rank | Optimization Item | Current State | Target State | Expected Gain | Change Class |
|:---:|:---|:---|:---|:---:|:---:|
| **1** | **Hero Image WebP/AVIF Compression** | `hero-ecosystem-3d.jpg` is 735 kB JPEG | Multi-format `srcset` (AVIF/WebP) with `sizes` and preload | Saves ~640 kB (87% drop in LCP image weight) | **GREEN** |
| **2** | **Self-Hosted Font Loading** | CSS `@import` from `fonts.googleapis.com` in `globals.css` L1 | `next/font/google` with local zero-RTT subsetting & `font-display: swap` | Eliminates external render-blocking network requests; -150ms FCP | **GREEN** |
| **3** | **Lazy-Load Team Carousel & Public Images** | All 4 team portraits load on initial paint (563 kB) | `loading="lazy"` + WebP format on `<img loading="lazy">` | Saves ~450 kB from initial landing page network waterfall | **GREEN** |
| **4** | **Static Server Component Pre-rendering for Landing** | `page.tsx` starts with `"use client"` for all sections | Server Component root with client component islands (`LandingLiveStatistics`, `OurTeamCarousel`) | Reduces initial client JS execution time on low-end mobile CPUs | **YELLOW** |
| **5** | **GPU Acceleration & Low-Power CSS Fallback** | `backdrop-filter: blur(16px)` on 8 glass elements simultaneously | `@supports not (backdrop-filter: blur())` fallback with opaque tinted surface | Prevents frame drops on budget Mali/Adreno GPUs | **GREEN** |

---

## 2. Before vs After Verification Matrix

| Area | Before Fix | Target After Fix | Verification Method |
|:---|:---:|:---:|:---|
| **Hero Image Weight** | 735.2 kB | $\le 95\text{ kB}$ (WebP/AVIF) | File size measurement & network inspector |
| **External Third-Party Domains** | 1 (`fonts.googleapis.com`) | 0 (100% self-contained origin) | Request waterfall trace |
| **Initial Page Images Weight** | 1,351 kB | $\le 210\text{ kB}$ | Bundle/Network audit |
| **CLS on Live Stats Section** | 0.00 | 0.00 (Monospace tabular numbers) | Layout shift recorder |
