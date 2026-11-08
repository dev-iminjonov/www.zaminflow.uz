# ZaminFlow Repository Cleanup — Class C Questions (`cleanup/questions.md`)

Each item below is classified as **Class C (Ask User First)** per Phase 3 rules. Nothing in this list has been deleted. Please reply with your decision for **Q1–Q7** so we can execute the approved items in Phase 4.

---

### Q1. Legacy `(field)` and `(portal)` Route Groups (`frontend/src/app/(field)/*` & `frontend/src/app/(portal)/*`)
- **Items (36 route files + 14 components used only by them, ~358 KB total):**
  - `frontend/src/app/(field)/layout.tsx`
  - `frontend/src/app/(field)/farmer/dashboard/page.tsx`, `contracts/page.tsx`, `notifications/page.tsx`, `profile/page.tsx`, `qr-pickup/page.tsx`, `account/page.tsx`
  - `frontend/src/app/(field)/driver/queue/page.tsx`, `scan/page.tsx`, `gate-handover/page.tsx`, `account/page.tsx`
  - `frontend/src/app/(field)/gate-scanner/page.tsx`, `account/page.tsx`
  - `frontend/src/app/(portal)/layout.tsx`
  - `frontend/src/app/(portal)/industry/dashboard/page.tsx`, `discover/page.tsx`, `contracts/page.tsx`, `gate-lab/page.tsx`, `team/page.tsx`, `profile/page.tsx`, `settings/page.tsx`, `notifications/page.tsx`, `account/page.tsx`
  - `frontend/src/app/(portal)/bank/dashboard/page.tsx`, `underwriting/page.tsx`, `ledger/page.tsx`, `profile/page.tsx`, `notifications/page.tsx`, `account/page.tsx`
  - `frontend/src/app/(portal)/admin/dashboard/page.tsx`, `kyb-review/page.tsx`, `disputes/page.tsx`, `invitations/page.tsx`, `settings/page.tsx`, `notifications/page.tsx`, `account/page.tsx`
  - Supporting components only imported by `(field)`/`(portal)`: `AccountSettingsView.tsx`, `CompletionMeter.tsx`, `DocumentUploader.tsx`, `KybStatusBanner.tsx`, `LeafletMap.tsx`, `LockedDashboard.tsx`, `MapPinPicker.tsx`, `NotificationBell.tsx`, `NotificationsView.tsx`, `DataTable.tsx`, `KpiCard.tsx`, `PayoutPreviewPanel.tsx`, `StatusPill.tsx`, `TrustScoreGauge.tsx`.
- **Why it appears unused / superseded:**
  - Canonical role dashboards now live under `/dashboard/farmer/*`, `/dashboard/dairy/*`, `/dashboard/driver/*`, `/dashboard/bank`, and `/dashboard/admin/*`.
  - `frontend/src/middleware.ts` already 307-redirects `/farmer/*`, `/industry/*`, `/driver/*`, and `/admin/*` to `/dashboard/*`.
- **What could break if removed:**
  - `/gate-scanner` (`frontend/src/app/(field)/gate-scanner/page.tsx`) and `/bank/underwriting` or `/bank/ledger` (`frontend/src/app/(portal)/bank/*`) are not yet duplicated under `/dashboard/*`.
  - Deep links in emails or documentation referencing `/farmer/profile` or `/industry/gate-lab` rely on either middleware redirects or those pages.
- **Recommendation:** **KEEP for now** (or remove only the unreachable `/farmer/dashboard`, `/industry/dashboard`, `/admin/dashboard` pages that middleware unconditionally redirects away from, while keeping `/gate-scanner` and onboarding/KYB profile upload components).

---

### Q2. Legacy Auth Redirect Routes (`/auth/login`, `/auth/register`, `/sign-in`, `/sign-up`)
- **Items (4 files, `1,215` bytes):**
  - `frontend/src/app/auth/login/page.tsx` (redirects to `/signin`)
  - `frontend/src/app/auth/register/page.tsx` (redirects to `/signup`)
  - `frontend/src/app/sign-in/page.tsx` (renders `<SignInCard />`, same as `/signin`)
  - `frontend/src/app/sign-up/page.tsx` (renders `<SignUpCard />`, same as `/signup`)
- **Why it appears duplicated:**
  - Canonical auth routes are `/signin` and `/signup`.
- **What could break if removed:**
  - External bookmarks, QA scripts (`qa/automation/test_qa_001_both_paths.py` explicitly tests both `/signup` and `/sign-up`!), or email templates linking to `/sign-in` or `/auth/login` would return 404 unless handled in `middleware.ts` or `next.config.mjs` redirects.
- **Recommendation:** **KEEP `/sign-in` and `/sign-up`** (required by `test_qa_001_both_paths.py`), and either **KEEP `/auth/login` & `/auth/register`** or replace them with permanent redirects in `next.config.mjs`.

---

### Q3. Frontend Client-Side Fallback Stores (`farmerStore.ts`, `dairyStore.ts`, `driverStore.ts`, `adminStore.ts`)
- **Items (4 files, `23,751` bytes):**
  - `frontend/src/lib/farmerStore.ts` (`5,044` B)
  - `frontend/src/lib/dairyStore.ts` (`7,478` B)
  - `frontend/src/lib/driverStore.ts` (`3,603` B)
  - `frontend/src/lib/adminStore.ts` (`7,626` B)
- **Why it is flagged:**
  - Phase 3 rules require flagging mock/demo data providers as Class C.
- **What could break if removed:**
  - The 21 secondary sub-pages (`/dashboard/farmer/my-milk`, `/dashboard/dairy/orders`, `/dashboard/driver/my-trips`, `/dashboard/admin/users`, etc.) actively import these 4 stores for initial state and offline/optimistic UI updates alongside backend API calls. Removing them without rewriting all 21 sub-pages will break the frontend build.
- **Recommendation:** **KEEP** (they are actively imported by 21 dashboard sub-pages).

---

### Q4. Byte-Identical Duplicate QA Test Files (`backend/qa/automation/` vs `qa/automation/`)
- **Items (4 byte-identical pairs, `18,727` bytes duplicated):**
  1. `backend/qa/automation/test_fnd_sec_001_cookies_csrf.py` == `qa/automation/test_fnd_sec_001_cookies_csrf.py` (`5,309` B, SHA256 `969628661F3F...`)
  2. `backend/qa/automation/test_qa_001_both_paths.py` == `qa/automation/test_qa_001_both_paths.py` (`3,222` B, SHA256 `BE347669DD5A...`)
  3. `backend/qa/automation/test_qa_fixes.py` == `qa/automation/test_qa_fixes.py` (`6,386` B, SHA256 `149E534421C2...`)
  4. `backend/tests/test_rate_limits.py` == `qa/automation/test_fnd_sec_002_rate_limits.py` (`3,810` B, SHA256 `D81DF73161BF...`)
- **Why they exist in both places:**
  - `docker-compose.yml` mounts `./backend:/app` inside `dairy_backend` (it does not mount root `./qa`). Copies were placed in `backend/qa/automation/` so `docker exec dairy_backend pytest qa/automation` can run inside the container while root `qa/` is kept as the QA deliverable archive.
- **What could break if removed:**
  - Removing `backend/qa/automation/*` breaks running `docker exec dairy_backend pytest qa/automation` inside the container; removing root `qa/automation/*` violates the Protected List (`qa/`).
- **Recommendation:** **KEEP both** (or mount `./qa:/app/qa:ro` in `docker-compose.yml` and then remove `backend/qa/automation/`).

---

### Q5. `@tanstack/react-query` in `frontend/package.json`
- **Item:** `"@tanstack/react-query": "^5.59.0"` in `frontend/package.json` and `QueryClientProvider` wrapper in `frontend/src/app/layout.tsx`.
- **Why it appears unused:**
  - Repo-wide search across `frontend/src/**` shows **0 calls** to `useQuery`, `useMutation`, `useQueryClient`, or any other `@tanstack/react-query` hook; all data fetching uses `fetch` / `authenticatedFetch` inside `useEffect`.
- **What could break if removed:**
  - Requires editing `frontend/src/app/layout.tsx` to remove `<QueryClientProvider client={queryClient}>` before running `npm uninstall @tanstack/react-query`.
- **Recommendation:** **REMOVE** `@tanstack/react-query` and unwrap `QueryClientProvider` in `frontend/src/app/layout.tsx` to reduce client bundle size, **OR KEEP** if upcoming work plans to migrate `useEffect` fetches to React Query.

---

### Q6. Duplicate Icon & Dual `.jpg` / `.webp` Team Portraits in `frontend/public/`
- **Items:**
  1. `frontend/public/icon.png` (`61,137` B) and `frontend/public/images/zaminflow-icon.png` (`61,137` B) are byte-identical (`SHA256: F4FE59FEB931...`). Currently `ZaminFlowLogo.tsx` references `/images/zaminflow-icon.png` in `variant="icon-only"` and `/icon.png` as an `onError` fallback.
  2. `frontend/public/images/team-muhammadaziz.jpg` (`152,527` B), `team-sevinchoy.jpg` (`81,707` B), `team-akrom.jpg` (`126,358` B), and `team-shohjahon.jpg` (`203,084` B) (`563,676` B total) exist alongside `.webp` versions (`team-*.webp`, `203,432` B total). Currently `OurTeamCarousel.tsx` uses `.webp` while `UserProfileView.tsx` and `userAvatar.ts` reference `.jpg`.
- **What could break if removed:**
  - Deleting `zaminflow-icon.png` or `team-*.jpg` without updating `ZaminFlowLogo.tsx`, `UserProfileView.tsx`, and `userAvatar.ts` to point to `/icon.png` and `team-*.webp` would cause 404 image errors.
- **Recommendation:** If you approve a 2-line path update in `ZaminFlowLogo.tsx`, `UserProfileView.tsx`, and `userAvatar.ts`, we can delete `zaminflow-icon.png` and all 4 `team-*.jpg` files, saving **624.8 KB** (`639,813` bytes). Otherwise, **KEEP**.

---

### Q7. Backend Endpoints Not Directly Called by the Current Next.js `/dashboard/*` UI
- **Items:**
  - `/api/v1/bank/webhooks/confirm-lock` (`escrow_ledger/service.py`)
  - `/api/v1/matching/recommendations` (`geo_matching/service.py`)
  - `/api/v1/contracts`, `/api/v1/contracts/{contract_id}/sign` (`smart_contracts/service.py`)
  - `/api/v1/batches/*` (`qr_logistics/service.py`)
  - `/api/v1/trust/my-scorecard` (`trust_rating/service.py`)
- **Why they are flagged:**
  - Phase 3 rules require flagging backend endpoints not called by the primary frontend.
- **What could break if removed:**
  - These endpoints are tested by `backend/tests/test_core_specifications.py` (which is on the Protected List), are called by the `(field)` / `(portal)` pages, and serve external partner bank webhooks and field mobile QR scanners.
- **Recommendation:** **KEEP ALL** backend modules and endpoints (required by backend test suite and partner/field integrations).
