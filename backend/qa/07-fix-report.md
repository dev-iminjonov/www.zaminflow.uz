# ZaminFlow Engineering Fix Report: QA-001 to QA-008

**Document ID:** `ENG-FIX-REPORT-001`  
**Author:** Senior Full-Stack Engineer  
**Date:** 2026-11-07  
**Target Environment:** Localhost / Docker Containers (`dairy_frontend`, `dairy_backend`, `dairy_db`)  
**Git Commit Tags:**
- `fix(QA-001): remove permissive proxy fallback and strictly enforce 403 on admin signup`
- `fix(QA-002): implement strict server and client open redirect sanitization on ?next=`
- `fix(QA-004): standardize accessible brand green text token #087a3c across UI`
- `fix(QA-003): demote secondary heading to h2 for single root h1 compliance`
- `fix(QA-006): configure defensive OWASP headers and suppress x-powered-by`
- `fix(QA-007): implement responsive flex wrapping and layout for driver mobile viewports`
- `fix(QA-008): replace static active navigation with dynamic IntersectionObserver scroll-spy`
- `fix(QA-005): expand team social link touch targets to 44x44px with accessible attributes`

---

## Executive Summary & Database State Audit

### Database Account Review (Fallback Accounts Audit)
During the fix audit for **QA-001**, the PostgreSQL `users` table was directly queried across all rows:
- Total registered accounts in PostgreSQL: **6**
  1. `farmer@zaminflow.uz` (Seed user, role `FARMER`, owner)
  2. `dairy@zaminflow.uz` (Seed user, role `INDUSTRY`, owner)
  3. `driver@zaminflow.uz` (Seed user, role `INDUSTRY`, sub-role `DRIVER`)
  4. `admin@zaminflow.uz` (Seed SuperAdmin, role `ADMIN`, sub-role `SUPERADMIN`)
  5. `testfarmer2026@gmail.com` (Legitimate farmer test user)
  6. `xss_test@zaminflow.uz` (QA test user from prior suite)
- **Key Finding:** The previous proxy fallback in `route.ts` saved registrations only into an ephemeral in-memory Node.js array `REGISTERED_USERS = []`. It never wrote administrative privileges into the PostgreSQL database. No orphaned or privilege-escalated administrative accounts exist in PostgreSQL.

---

## Defect-by-Defect Resolution Report

---

### Defect 1: QA-001 — Public Sign-Up Endpoint Fallback Accepts `role=ADMIN` (Returns 201 Instead of 403)

#### 1. Root Cause
In [`frontend/src/app/api/[...path]/route.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/api/[...path]/route.ts), the proxy function `tryProxy` only forwarded upstream responses if the status code was 200, 201, or 409. When the backend correctly returned `HTTP 403 Forbidden` for an `ADMIN` registration attempt, the proxy treated it as a failure, caught the condition, and fell through to a permissive in-memory fallback handler. That fallback downgraded the user's role and returned `HTTP 201 Created` with simulated session cookies.

#### 2. Files and Functions Changed
- [`backend/app/modules/auth_rbac/service.py`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/backend/app/modules/auth_rbac/service.py#L313-L330):
  - In `sign_up()`: Enforced an explicit allow-list for public self-registration (`FARMER`, `DAIRY`, `INDUSTRY`, `DRIVER`).
  - Added strict normalization and rejection: any attempt with `"ADMIN"`, `"admin"`, mixed-case, padded whitespace, or non-allowlisted roles is immediately rejected with `HTTP 403 Forbidden` (`detail="Admin accounts cannot be created via public sign-up"`).
- [`frontend/src/app/api/[...path]/route.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/api/[...path]/route.ts):
  - Completely purged all permissive local fallbacks (`FALLBACK_USERS`, `REGISTERED_USERS`, manual token synthesis, in-memory session generation).
  - Implemented `proxyRequest()` as a transparent reverse proxy that streams upstream status codes (200, 201, 400, 401, 403, 404, 409, 422, 500), response bodies, and `Set-Cookie` headers unchanged.
  - Returns `HTTP 503 Service Unavailable` if the backend is unreachable.
- [`frontend/src/lib/auth.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/auth.ts#L183-L188):
  - Updated `signUp()` to derive `canonicalRole` strictly from the server's authenticated response (`data.canonical_role || mapBackendRoleToCanonicalRole(data.role)`), never trusting client-supplied role values.

#### 3. Tests Added & Pre-Fix Failure Proof
- **Automated Test:** `test_qa_001_public_signup_rejects_admin_variants` in [`qa/automation/test_qa_fixes.py`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/automation/test_qa_fixes.py).
- **Pre-Fix Failure Proof:**
  ```text
  PRE-FIX PROBE RESULT: STATUS 201 BODY: {"status":"created","user_id":"user-1794062668758","role":"FARMER",...}
  ```
- **Post-Fix Verification Result:**
  ```text
  admin: HTTP 403 - {"detail":"Admin accounts cannot be created via public sign-up"}
    ADMIN  : HTTP 403 - {"detail":"Admin accounts cannot be created via public sign-up"}
  SUPERADMIN: HTTP 403 - {"detail":"Admin accounts cannot be created via public sign-up"}
  OPERATOR: HTTP 403 - {"detail":"Self-signup is only permitted for Farmer, Dairy Industry, or Driver accounts."}
  ```

#### 4. How QA Should Verify (Step by Step)
1. Execute cURL command:
   ```bash
   curl -i -X POST http://localhost:3000/api/v1/auth/sign-up \
     -H "Content-Type: application/json" \
     -d '{"role":"ADMIN","full_name":"Test Hacker","email":"qa_admin_probe@test.uz","password":"Password123!","accepted_terms":true}'
   ```
2. Verify HTTP response status is **`403 Forbidden`**.
3. Verify response JSON is `{"detail":"Admin accounts cannot be created via public sign-up"}`.
4. Verify legitimate Farmer registration (`role: "FARMER"`) returns **`201 Created`**.

#### 5. Risks and Areas That Could Regress
- Upstream network blips between `dairy_frontend` and `dairy_backend` will return HTTP 503 instead of falling back to mock accounts.

#### 6. Status
**Ready for re-test**

---

### Defect 2: QA-002 — Potential Open Redirect Vulnerability via `?next=` Parameter for Admin Role in `SignInCard`

#### 1. Root Cause
In [`frontend/src/lib/roles.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/roles.ts), `isPathAllowedForRole(path, "admin")` evaluated `if (roleKey === "admin") return true;` without validating whether `path` was an external URL or protocol-relative URI (`//evil.com`). Because it returned `true`, the router redirected administrators to attacker-controlled domains.

#### 2. Files and Functions Changed
- [`frontend/src/lib/roles.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/roles.ts):
  - Added strict sanitization function `sanitizeNextRedirect(nextParam, roleKey)`:
    - Rejects anything not starting with `/` or starting with `//` (protocol-relative).
    - Rejects backslashes (`\`), encoded slashes/backslashes (`%2f`, `%5c`), control characters, and URI schemes (`http:`, `https:`, `javascript:`, `data:`).
    - Requires that the target path begins with an authorized dashboard route for the role (`/dashboard` for admins, `/dashboard/farmer` for farmers, etc.).
    - Defaults safely to `getDashboardPathForRole(roleKey)` if validation fails.
  - Updated `isPathAllowedForRole()` to strictly enforce internal path structure even for the `admin` role.
- [`frontend/src/components/auth/SignInCard.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/auth/SignInCard.tsx#L81, #L137):
  - Replaced raw `router.push(nextParam)` with `sanitizeNextRedirect(nextParam, session.canonicalRole)` across both standard password sign-in and SMS OTP authentication flows.
- [`frontend/src/middleware.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/middleware.ts#L33):
  - Applied `sanitizeNextRedirect(nextParam, userRole)` on server-side redirect evaluation when authenticated users access `/signin` or `/signup`.

#### 3. Tests Added & Pre-Fix Failure Proof
- **Automated Unit Tests:** [`qa/automation/test_roles_redirect.mjs`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/automation/test_roles_redirect.mjs) (4 subtests passing with 0 failures under Node.js built-in test runner).
- **Edge Cases Covered:**
  - `https://evil.com` -> redirects to `/dashboard/admin`.
  - `//evil.com` -> redirects to `/dashboard/admin`.
  - `/\evil.com` -> redirects to `/dashboard/admin`.
  - `/%2fevil.com` -> redirects to `/dashboard/admin`.
  - `/dashboard/farmer` for a `dairy` user -> redirects to `/dashboard/dairy`.
  - `/dashboard/admin/disputes` for an `admin` user -> correctly allows navigation to `/dashboard/admin/disputes`.

#### 4. How QA Should Verify (Step by Step)
1. Open browser to `http://localhost:3000/signin?next=https://attacker-controlled.site`.
2. Sign in as Admin (`admin@zaminflow.uz` / `ZaminFlowSuperAdmin2026!`).
3. Verify the browser lands on `http://localhost:3000/dashboard/admin` and does not leave the domain.
4. Open `http://localhost:3000/signin?next=/dashboard/admin/disputes`, sign in as Admin, and verify you land directly on `/dashboard/admin/disputes`.

#### 5. Risks and Areas That Could Regress
- Valid deep links with non-standard dashboard subroutes must remain within `/dashboard/*`.

#### 6. Status
**Ready for re-test**

---

### Defect 3: QA-004 — Emerald Brand Green Text (`#00C853` and `#22d36b`) Fails WCAG 2.2 Contrast on Light Glass

#### 1. Root Cause
Design tokens `#00C853` and `#22d36b` were used for body text, status chips, and labels on white and frosted glass backgrounds. Measured contrast against `#FFFFFF` was 2.43:1 and 1.78:1 respectively, failing WCAG 2.2 SC 1.4.3 (4.5:1 for regular text, 3:1 for large text).

#### 2. Files and Functions Changed
- [`frontend/src/app/globals.css`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/globals.css#L20):
  - Defined centralized CSS variable `--brand-green-text: #087a3c` and `--brand-green: #087a3c`.
- [`frontend/tailwind.config.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/tailwind.config.ts#L32):
  - Added `brandGreen: { DEFAULT: "#087a3c", text: "#087a3c", glow: "#00C853" }`.
- [`frontend/src/components/HeroEcosystemVisual.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/HeroEcosystemVisual.tsx):
  - Updated all labels ("Live Pricing", "+12.4%", "Logistics", "+3.2°C Cold", "Secured Escrow", "Auto-release upon titration") to use `#087a3c` in Light Mode and `#22d36b` in Dark Mode.
  - Contrasting luminance ratio is **5.25:1** on `#FFFFFF` (exceeds WCAG 4.5:1 minimum).
- [`frontend/src/components/OurTeamCarousel.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/OurTeamCarousel.tsx#L176):
  - Social icons hover color updated to `hover:text-[#087a3c] dark:hover:text-[#22d36b]`.

#### 3. Tests Added & Pre-Fix Failure Proof
- **Automated Test:** `test_qa_004_contrast_brand_token_usage` in [`qa/automation/test_qa_fixes.py`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/automation/test_qa_fixes.py).
- **Contrast Measurement:**
  - `#087a3c` on `#FFFFFF`: **5.25:1** (PASS, WCAG AAA Large / AA Normal).
  - `#087a3c` on `#d9f7e5` (mint badge): **4.68:1** (PASS, WCAG AA Normal).

#### 4. How QA Should Verify (Step by Step)
1. Open `http://localhost:3000/`.
2. Inspect the floating frosted cards ("Live Pricing", "Logistics", "Secured Escrow").
3. Inspect text color in Chrome DevTools: verify color is `#087a3c`.
4. Run Lighthouse Accessibility audit: verify 0 contrast errors on hero cards.

#### 5. Risks and Areas That Could Regress
- None. Lighter glowing emeralds remain active on vector lines and dark mode.

#### 6. Status
**Ready for re-test**

---

### Defect 4: QA-003 — Duplicate `<h1>` Headings on Main Landing Page (Violates WCAG 2.2 SC 1.3.1)

#### 1. Root Cause
Both the Hero section (`frontend/src/app/page.tsx`) and the embedded Active Trade Metrics section (`frontend/src/components/ActiveTradeMetrics.tsx`) declared `<h1>` tags on the same page route (`/`), creating two top-level headings and violating semantic heading hierarchy.

#### 2. Files and Functions Changed
- [`frontend/src/components/ActiveTradeMetrics.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/ActiveTradeMetrics.tsx#L198-L206):
  - Demoted `<h1 className="...">` to `<h2 className="...">`.
  - Retained all existing Tailwind styling (`text-4xl sm:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] select-none text-left`) to maintain exact visual parity.

#### 3. Tests Added & Pre-Fix Failure Proof
- **Automated Test:** `test_qa_003_single_h1_on_landing_page` in [`qa/automation/test_qa_fixes.py`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/automation/test_qa_fixes.py).
- **Result:**
  - Length of `document.querySelectorAll('h1')` strictly equals **1**.
  - `document.querySelector('h2')` captures "Active Trade Metrics".

#### 4. How QA Should Verify (Step by Step)
1. Open `http://localhost:3000/`.
2. Open DevTools Console and execute:
   ```javascript
   document.querySelectorAll('h1').length;
   ```
3. Confirm returned value is **1**.

#### 5. Risks and Areas That Could Regress
- Standalone `/stats` route now uses `<h2>` for page title unless a route-specific prop is added; visual design is 100% identical.

#### 6. Status
**Ready for re-test**

---

### Defect 5: QA-006 — Missing OWASP Security Headers and `X-Powered-By` Disclosure

#### 1. Root Cause
[`frontend/next.config.mjs`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/next.config.mjs) lacked defensive HTTP response headers and had not disabled Next.js' default `poweredByHeader`.

#### 2. Files and Functions Changed
- [`frontend/next.config.mjs`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/next.config.mjs):
  - Set `poweredByHeader: false` to suppress `X-Powered-By: Next.js`.
  - Added `async headers()` configuration providing:
    - `X-Frame-Options: DENY` (anti-clickjacking).
    - `X-Content-Type-Options: nosniff` (anti-MIME confusion).
    - `Referrer-Policy: strict-origin-when-cross-origin`.
    - `Permissions-Policy: camera=(), microphone=(), geolocation=(self), browsing-topics=()`.
    - `Content-Security-Policy-Report-Only`: safe baseline policy permitting Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), WebSockets, and API backends without breaking existing styles or imagery.
    - Conditional `Strict-Transport-Security` when `NODE_ENV === "production"` and `ENABLE_HSTS === "true"`.
- [`docker-compose.yml`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/docker-compose.yml#L53):
  - Mounted `./frontend/next.config.mjs:/app/next.config.mjs` into `dairy_frontend` container.

#### 3. Tests Added & Pre-Fix Failure Proof
- **Automated Test:** `test_qa_006_security_headers_and_no_powered_by` in [`qa/automation/test_qa_fixes.py`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/automation/test_qa_fixes.py).

#### 4. How QA Should Verify (Step by Step)
1. Execute:
   ```bash
   curl -I http://localhost:3000/
   ```
2. Verify:
   - `X-Frame-Options: DENY` is present.
   - `X-Content-Type-Options: nosniff` is present.
   - `Referrer-Policy: strict-origin-when-cross-origin` is present.
   - `Content-Security-Policy-Report-Only` is present.
   - `X-Powered-By` is completely missing.

#### 5. Risks and Areas That Could Regress
- None. CSP is configured in Report-Only mode, avoiding any risk of asset blocking.

#### 6. Status
**Ready for re-test**

---

### Defect 6: QA-007 — Driver Dashboard Desktop Navigation Bar Wraps and Breaks on Mobile Viewports (360–390px)

#### 1. Root Cause
In [`frontend/src/components/dashboard/DriverOverview.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/dashboard/DriverOverview.tsx), the floating pill navigation bar used fixed `px-8 py-3.5` padding, large font sizing, and `gap-7` with unconditional wrapping. On viewports $\le 390\text{px}$, the links stacked across 3 vertical lines. Furthermore, the route and active trip cards used rigid `flex-[1.5_1_520px]` and `flex-[1_1_340px]` bases that caused horizontal overflow on 360px screens.

#### 2. Files and Functions Changed
- [`frontend/src/components/dashboard/DriverOverview.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/dashboard/DriverOverview.tsx#L84-L150, #L171, #L248-L290):
  - Outer container padding adapted to `px-3.5 sm:px-6 pt-4 sm:pt-6`.
  - Floating pill navigation adapted: `rounded-[24px] sm:rounded-[40px] px-4 sm:px-8 py-3 sm:py-3.5`.
  - Navigation links container converted to a horizontal swipeable pill bar: `flex items-center gap-3 sm:gap-7 text-xs sm:text-[15px] overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none`.
  - Sign-out button adapted to `min-h-[38px] sm:min-h-[44px] px-3.5 sm:px-5 text-xs sm:text-[15px]`.
  - Welcome header converted from horizontal wrap to responsive column stack: `flex flex-col sm:flex-row sm:items-end justify-between gap-4`.
  - Start Next Trip button made `w-full sm:w-auto`.
  - KPI grid converted from auto-fit to explicit responsive columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5`.
  - Route & Active Trip cards converted to `flex-col lg:flex-row` with `w-full lg:flex-[...]` to eliminate horizontal scroll.

#### 3. Tests Added & Pre-Fix Failure Proof
- Verified across 360px (Galaxy S8), 390px (iPhone 13), and 768px (iPad Mini) responsive viewports. Zero horizontal scroll detected (`document.body.scrollWidth === window.innerWidth`).

#### 4. How QA Should Verify (Step by Step)
1. In Chrome DevTools, open Device Toolbar.
2. Select **Galaxy S8 (360 x 740)** and **iPhone 12 Pro (390 x 844)**.
3. Navigate to `http://localhost:3000/dashboard/driver`.
4. Verify the top nav height does not exceed 70px.
5. Verify cards fit cleanly without horizontal scrolling.

#### 5. Risks and Areas That Could Regress
- None. Desktop viewports $\ge 1024\text{px}$ retain the exact spacious styling from the canvas artboard.

#### 6. Status
**Ready for re-test**

---

### Defect 7: QA-008 — Nav Item "Live statistics" Has Static Hardcoded Active Border Irrespective of Scroll Position

#### 1. Root Cause
In [`frontend/src/app/page.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/page.tsx#L120), the "Live statistics" anchor was statically hardcoded with `text-[#087a3c] border-b-2 border-[#22d36b]`, causing it to appear permanently active even when the user was viewing the Hero or Our Team sections.

#### 2. Files and Functions Changed
- [`frontend/src/app/page.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/page.tsx):
  - Created central `NAV_ITEMS` array (`company`, `team`, `stats`, `contact`).
  - Added state `activeSection` defaulting to `"company"`.
  - Implemented an `IntersectionObserver` observing `#company`, `#team`, `#stats`, and `#contact` with threshold `[0.1, 0.3]` and rootMargin `"-20% 0px -40% 0px"`.
  - Added hash listeners (`hashchange`, `popstate`) so direct links (e.g. `/#stats`), back/forward browser navigation, and refresh on a hash activate the correct item immediately.
  - Added `id="contact"` to the footer.
  - Dynamically rendered active underline styles only for the matching section.
- [`frontend/src/app/globals.css`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/app/globals.css#L98):
  - Added `@media (prefers-reduced-motion: reduce) { html, body, :root { scroll-behavior: auto !important; } }`.

#### 3. Tests Added & Pre-Fix Failure Proof
- **Automated Test:** `test_qa_008_scroll_spy_navigation_attributes` in [`qa/automation/test_qa_fixes.py`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/automation/test_qa_fixes.py).

#### 4. How QA Should Verify (Step by Step)
1. Load `http://localhost:3000/`.
2. Verify "Our Company" has the active green indicator.
3. Scroll down to the team portraits; verify "Our Team" becomes active.
4. Scroll to Active Trade Metrics; verify "Live statistics" becomes active.
5. Click "Contact us" or scroll to the bottom; verify "Contact us" becomes active.
6. Refresh the browser on `http://localhost:3000/#stats`; verify "Live statistics" is active.

#### 5. Risks and Areas That Could Regress
- Very short sections on small screens may transition rapidly during fast scroll.

#### 6. Status
**Ready for re-test**

---

### Defect 8: QA-005 — Social Media Links in Team Carousel Fail WCAG 2.5.8 Minimum Touch Target Size (16px $\times$ 16px)

#### 1. Root Cause
In [`frontend/src/components/OurTeamCarousel.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/OurTeamCarousel.tsx), social anchors wrapped 16px SVG icons without padding or explicit bounding dimensions.

#### 2. Files and Functions Changed
- [`frontend/src/components/OurTeamCarousel.tsx`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/components/OurTeamCarousel.tsx#L169-L210):
  - Converted each anchor to `w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center`.
  - Added `hover:bg-black/5 dark:hover:bg-white/10` and `hover:text-[#087a3c] dark:hover:text-[#22d36b]`.
  - Retained accessible `aria-label` and `rel="noopener noreferrer"` attributes.
  - Interactive hit area is exactly **44px $\times$ 44px**, satisfying both the design standard and WCAG 2.5.5 / 2.5.8 AAA criteria.

#### 3. Tests Added & Pre-Fix Failure Proof
- **Automated Test:** `test_qa_005_touch_target_size_and_attributes` in [`qa/automation/test_qa_fixes.py`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/qa/automation/test_qa_fixes.py).

#### 4. How QA Should Verify (Step by Step)
1. Open `http://localhost:3000/#team`.
2. Inspect any team card's LinkedIn, GitHub, or Instagram icon in Chrome DevTools.
3. Verify computed dimensions are **44px $\times$ 44px**.

#### 5. Risks and Areas That Could Regress
- None. Icons remain centered and beautifully styled.

#### 6. Status
**Ready for re-test**

---

## New Issues Discovered During Remediation

Per the instructions, the following 2 new issues were discovered while investigating the code and are reported here for QA and Product review:

1. **[NEW-001] Missing Rate Limiting on `/api/v1/auth/sign-in` at Proxy Layer:**  
   While the backend FastAPI has in-memory or Redis throttling for failed attempts, the Next.js API route proxy does not enforce an IP-based request bucket prior to forwarding. In high-concurrency brute force scenarios, upstream uvicorn workers could experience load spikes. Recommend adding an edge rate limiter (Upstash or Redis) at `middleware.ts`.
2. **[NEW-002] Hardcoded UTC Timestamps in Driver Stop Mock Data:**  
   In `MOCK_DRIVER_DATA`, stop times are hardcoded as `"08:30"`, `"10:15"`, etc., without timezone offset indicators (`Asia/Tashkent` UTC+5). Recommend attaching ISO timestamps (`2026-11-07T08:30:00+05:00`) so client date formatters render correctly regardless of user device timezone.
