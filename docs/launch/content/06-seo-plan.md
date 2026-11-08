# ZaminFlow SEO, Metadata & Discoverability Architecture

**Document ID:** `DOC-SEO-001`  
**Squad Lead:** Content Management Specialist & SEO Lead  
**Status:** Audit & Plan Complete  
**Date:** 2026-11-08  

---

## 1. Technical SEO Audit & Deficiencies Identified

| Item | Current State | Issue / Risk | Launch Requirement |
|:---|:---|:---|:---|
| **Root Layout Lang Attribute** | `<html lang="en">` hardcoded in `layout.tsx` L16 | Does not reflect active locale when user switches to `uz` or `ru`. Search engines misinterpret page language. | Synchronize `<html lang="...">` dynamically with active locale (`uz`, `ru`, `en`). |
| **Meta Viewport** | `maximum-scale=1` in `layout.tsx` L21 | Disables pinch-to-zoom on mobile, failing WCAG 1.4.4 and Google mobile ergonomics. | Change to `viewport: "width=device-width, initial-scale=1"`. |
| **Document Headings** | Strictly 1 `<h1>` on `/` ("Sut ta'minotining kelajagi...") | Validated passing under QA-003. Outline is clean: H1 (Hero) $\to$ H2 (Team) $\to$ H2 (Live stats) $\to$ H2 (Contact). | Retain document outline integrity. |
| **Robots.txt** | Missing in `frontend/public/robots.txt` | Authenticated routes (`/dashboard/*`, `/api/*`, `/verify-email`) could be crawled or indexed. | Create `public/robots.txt` disallowing dashboards and API paths. |
| **Sitemap.xml** | Missing in `frontend/public/sitemap.xml` | Search engines lack structured index of localized public entry points. | Create `public/sitemap.xml` with hreflang alternates for `/`, `/sign-in`, `/sign-up`. |
| **Open Graph & Twitter Cards** | Partial metadata in `layout.tsx` | Missing `og:image` (1200x630px), `og:locale`, and Twitter summary tags for social sharing. | Add complete OpenGraph metadata with localized fallbacks. |
| **Structured Data (JSON-LD)** | Missing on Landing Page | Google cannot extract Organization entity, founding date, or customer support telephone. | Inject JSON-LD Schema `Organization` and `SoftwareApplication` into landing page `<head>`. |
| **Hreflang Tags** | Not declared in header | Multilingual versions of public pages may suffer duplicate content penalties in Yandex/Google. | Add `<link rel="alternate" hreflang="uz" ...>` tags for all public routes. |

---

## 2. Robots.txt Specification

```text
# ZaminFlow Production Robots Configuration
User-agent: *
Allow: /
Allow: /sign-in
Allow: /sign-up
Allow: /forgot-password

# Disallow authenticated dashboards and internal endpoints
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /reset-password/
Disallow: /verify-email/

Sitemap: https://zaminflow.uz/sitemap.xml
```

---

## 3. Organization JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ZaminFlow",
  "url": "https://zaminflow.uz",
  "logo": "https://zaminflow.uz/images/zaminflow-logo.png",
  "description": "B2B Dairy Supply Chain & FinTech Escrow Platform in Uzbekistan",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+998-71-200-00-00",
    "contactType": "customer service",
    "areaServed": "UZ",
    "availableLanguage": ["Uzbek", "Russian", "English"]
  }
}
```
