# ZaminFlow Web Performance Baseline Measurements

**Document ID:** `DOC-PERF-001`  
**Squad Lead:** Web Performance Optimization Specialist  
**Status:** Baseline Established  
**Date:** 2026-11-08  
**Environment:** Production Build (`next start` v15.5.29, Node.js 20, FastAPI v3.0, PostgreSQL 16 PostGIS)  

---

## 1. Executive Summary & Baseline Metrics

Measurements were performed against the production build with real server responses and database aggregates.

| Metric | Target | Measured Baseline | Evaluation | Key Contributing Factors |
|:---|:---:|:---:|:---:|:---|
| **Landing Page HTML TTFB** | $\le 800\text{ ms}$ | **2.20 ms (p50)** / 18.66 ms (p95) | **PASS** | Edge reverse proxy + lightweight Next.js SSR pipeline. |
| **Public Stats API Latency** | $\le 100\text{ ms}$ | **0.65 ms (p50)** / 1.04 ms (p95) | **PASS** | 60-second in-process TTL cache + single-flight asyncio lock. |
| **Landing Page JS Bundle (Gzip)** | $\le 170\text{ kB}$ | **126.3 kB** (426.0 kB raw) | **PASS** | Tree-shaken modular bundles, minimal extraneous dependencies. |
| **Global CSS Bundle (Gzip)** | $\le 40\text{ kB}$ | **15.6 kB** (89.6 kB raw) | **PASS** | Tailwind utility purging. |
| **Hero Image Size** | $\le 150\text{ kB}$ | **735.2 kB** (`hero-ecosystem-3d.jpg`) | **FAIL (Blocker)** | Uncompressed 1376x768 JPEG format. Needs WebP/AVIF compression. |
| **Total Page Image Weight** | $\le 500\text{ kB}$ | **1,351 kB** (1.35 MB) | **FAIL** | 4 team portraits (600 kB total) + hero image (735 kB). |
| **External Font Loading** | Self-hosted | **External @import** (`fonts.googleapis.com`) | **FAIL (Defect)** | Blocking CSS `@import` introduces external network latency in rural UZ. |
| **Database Stats Query Time** | $\le 50\text{ ms}$ | **0.041 ms** (Postgres EXPLAIN ANALYZE) | **PASS** | Filter on indexed status column. |

---

## 2. JavaScript Chunk Breakdown (Landing Page `/`)

| Chunk File | Raw Size (Bytes) | Gzip Size (Bytes) | Role / Content |
|:---|:---:|:---:|:---|
| `webpack-e227ecd52a3ef97a.js` | 3,466 | 1,745 | Webpack runtime bootstrap |
| `4bd1b696-f785427dddbba9fb.js` | 173,020 | 54,359 | React 18, React-DOM, Next.js framework core |
| `1255-b84741b894bb9354.js` | 174,134 | 46,708 | Shared UI components, TanStack query client |
| `main-app-05a5fe279f4f6e20.js` | 560 | 227 | Next.js App Router entrypoint |
| `2619-3c9e02e22d10480a.js` | 8,538 | 3,388 | Shared navigation & icon utilities |
| `9889-c0279eb0cacf6d40.js` | 34,127 | 11,843 | Multilingual dictionaries & LanguageContext |
| `app/page-2462acd868050cba.js` | 42,339 | 11,048 | Landing page client components & scroll-spy |
| **TOTALS** | **426,024 (426.0 kB)** | **126,318 (126.3 kB)** | **Well within 170 kB budget** |

---

## 3. High-Priority Performance Bottlenecks & Remedies

1. **Bottleneck 1: Hero Ecosystem Image (`735.2 kB`)**
   - *Impact:* On rural 3G (400 kbps), downloading 735 kB takes **~15 seconds**, directly stalling Largest Contentful Paint (LCP).
   - *Fix:* Convert to WebP / AVIF with `srcset` (desktop 1200w, tablet 800w, mobile 400w). Target: $\le 85\text{ kB}$ AVIF (88% reduction).
2. **Bottleneck 2: Render-Blocking Google Fonts `@import`**
   - *Impact:* Line 1 of `globals.css` blocks stylesheet parsing until Google Fonts CSS returns. If DNS or SSL handshake to `fonts.googleapis.com` stalls, page renders blank.
   - *Fix:* Adopt `next/font/google` with local build-time pre-fetching or self-host WOFF2 subsets with `font-display: swap`.
3. **Bottleneck 3: Uncompressed Team Portraits (`563.6 kB` total)**
   - *Impact:* Below-the-fold team carousel images load eagerly on initial page load.
   - *Fix:* Add `loading="lazy"`, explicit `width` and `height`, and convert to modern WebP.
