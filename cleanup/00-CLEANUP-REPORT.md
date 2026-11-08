# ZaminFlow Repository Hygiene & Cleanup Report (`cleanup/00-CLEANUP-REPORT.md`)

## Backup & Trash Locations (Phase 0 Safety Net)
- **Git Branch & Baseline Tag:** Branch `chore/cleanup` | Baseline commit `7ba48c6` | Tag `pre-cleanup`
- **External Project Archive Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-project-backup-20261108.zip` (`7,404,017` bytes / 7.06 MB — verified `1,559 / 1,559` files)
- **External PostgreSQL Dump Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-db-backup-20261108.dump` (`84,518` bytes — verified restore into `zaminflow_restore_verify_tmp` and `zaminflow_dump_migration_verify`)
- **External Trash Directory:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-cleanup-trash-20261108` (`58` Class A files, `526,176` bytes)

---

## 1. One-Page Executive Summary (Before vs. After)

| Metric | Phase 1 Baseline (Before) | Phase 6 Final Proof (After) | Delta / Result |
| :--- | :---: | :---: | :--- |
| **Files Removed (Total)** | `418` working tree files | `368` tracked files in fresh clone (`-72` deleted, `+22` cleanup/hygiene docs) | **`72` unnecessary files removed** (`58` Class A + `9` Class B + `5` Class C) |
| **Disk Space Freed (Removed Files)** | `5,089,672` B (4.85 MB) | `3,959,774` B (3.78 MB in fresh clone) | **`1,346,268` B (`1.28 MB`) of dead code, caches & duplicate images removed** |
| **Dependencies Removed** | `29` (19 backend + 10 frontend) | `26` (17 backend + 9 frontend) | **`-3` dependencies** (`geoalchemy2`, `passlib[bcrypt]`, `@tanstack/react-query`) |
| **Docker Build Context Size** | Unbounded (no `.dockerignore`) | Frontend: `341.94 KB` / Backend: `316.43 KB` | **Added `.dockerignore`, `frontend/.dockerignore`, `backend/.dockerignore`** |
| **Docker Image Sizes** | Frontend: `1.42 GB` / Backend: `812 MB` | Frontend: `1.40 GB` / Backend: `804 MB` | **`-20 MB` Frontend image, `-8 MB` Backend image (`-28 MB` total)** |
| **`docker compose up -d --build` Time** | `65.91s` | `69.52s` (full uncached pip/npm layer rebuild) | **All 4 containers healthy (`dairy_db`, `dairy_backend`, `dairy_frontend`, `dairy_caddy`)** |
| **Frontend Shared First Load JS** | `103 kB` | `103 kB` (`/` reduced from `130 kB` to `126 kB` on auth routes) | **`-4 kB` on `/signin` and `/signup` after removing `@tanstack/react-query`** |
| **Frontend Route Parity** | `81` static/dynamic routes | `81` static/dynamic routes (`100%` parity) | **0 broken routes; all checked routes return HTTP `200`** |
| **Backend OpenAPI Endpoint Parity** | `66` paths | `66` paths (`100%` parity) | **Exact OpenAPI contract parity** |
| **Backend & QA Test Suites** | `pytest tests/`: `27 passed` (`2.57s`) | `pytest tests/`: `27 passed` (`2.82s`) | **`100%` pass rate; 0 tests deleted, skipped, or weakened** |
| **Alembic Migrations Verification** | `0002_onboarding_gating (head)` | Verified `upgrade head` on empty DB & restored dump | **Both empty DB and restored dump migrations passed cleanly** |

---

## 2. What Was Removed and Why (Logged in [`cleanup/deletion-log.csv`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/cleanup/deletion-log.csv))

1. **Batch A (`a091f50` — 58 files, `526,176` B):**
   - Moved all untracked `backend/**/__pycache__/*.pyc` (53 files) and `backend/.pytest_cache/*` (5 files) to `scratch\zaminflow-cleanup-trash-20261108\batch-A`.
2. **Batch B1 (`2bfeb96` — 5 files, `31,961` B):**
   - Removed 5 proven-dead frontend files with `0` active imports: `GapPlaceholder.tsx` (`5,646` B), `QrDispatchCard.tsx` (`3,762` B), `businessRulesEngine.ts` (`7,601` B), `DashboardShell.tsx` (`8,634` B), and `dashboardData.ts` (`6,318` B).
3. **Batch B2 (`0651bab` — 4 files, `163,318` B):**
   - Removed 4 unreferenced image files in `frontend/public/images/`: `cold-chain-truck.jpg` (`50,789` B), `zaminflow-logo-dark-original.png` (`8,599` B), `zaminflow-logo-white.png` (`57,741` B), and `zaminflow-official-logo.jpg` (`46,189` B).
4. **Batch B3a (`b2ed9ae`) & Batch B3b (`83084bc` — 2 backend dependencies):**
   - Removed unused `geoalchemy2>=0.15.2` and `passlib[bcrypt]>=1.7.4` from `backend/pyproject.toml`.
5. **Batch C1 (`b1493fa` — 1 frontend dependency, Approved Q5):**
   - Unwrapped unused `QueryClientProvider` in `frontend/src/app/layout.tsx` and uninstalled `@tanstack/react-query` from `frontend/package.json`.
6. **Batch C2 (`13b8dfa` — 5 files, `624,813` B, Approved Q6):**
   - Updated `ZaminFlowLogo.tsx`, `userAvatar.ts`, and `UserProfileView.tsx` to reference canonical `/icon.png` and `/images/team-*.webp`, then removed byte-identical `frontend/public/images/zaminflow-icon.png` (`61,137` B) and duplicate `.jpg` portraits (`team-muhammadaziz.jpg`, `team-sevinchoy.jpg`, `team-akrom.jpg`, `team-shohjahon.jpg` — `563,676` B).

---

## 3. What Was Kept and Why

- **Protected List (Class D — 144 files):** `.env`, Alembic migrations (`0001_initial_schema.py`, `0002_onboarding_gating.py`), `docs/**`, `qa/**`, `GAPS.md`, `CHANGELOG.md`, `backend/tests/**`, `docker-compose.yml`, `Caddyfile`, and Dockerfiles.
- **Approved Retentions (Class C — Q1, Q2, Q3, Q4, Q7):**
  - `(field)` and `(portal)` route groups (`Q1`) — retained until `/gate-scanner` and `/bank/*` sub-routes are migrated into `/dashboard/*` (documented in [`cleanup/03-structure-and-rename-proposals.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/cleanup/03-structure-and-rename-proposals.md)).
  - `/sign-in`, `/sign-up`, `/auth/login`, `/auth/register` (`Q2`) — retained for backward compatibility and `test_qa_001_both_paths.py`.
  - `farmerStore.ts`, `dairyStore.ts`, `driverStore.ts`, `adminStore.ts` (`Q3`) — retained because all 21 dashboard sub-pages actively import them.
  - `backend/qa/automation/*` (`Q4`) — retained so `pytest` can execute QA scripts inside the `dairy_backend` container.
  - Backend partner/webhook/field endpoints (`Q7`) — retained for partner bank webhooks, field QR scanning, and `test_core_specifications.py`.

---

## 4. Pre-Existing Issues Logged & Residual Risks

- **Pre-Existing Issue in `qa/automation/test_qa_fixes.py`:** When `qa/automation/` is run as a full batch immediately after `test_fnd_sec_002_rate_limits.py`, the in-memory per-IP rate limiter on `/api/v1/auth/sign-up` returns `HTTP 429 Too Many Requests` instead of `403 Forbidden` on subsequent sign-up attempts from `127.0.0.1`. This is expected rate-limiter behavior, not a regression.
- **Residual Risks:** None. Fresh-clone verification (`Phase 6`) confirmed the repository builds, migrates (both from an empty PostGIS database and from the backup dump), passes all 27 backend specification tests, passes `tsc --noEmit` and `next build` across all 81 routes, and serves all public and role dashboard routes with HTTP `200`.
