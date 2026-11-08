# ZaminFlow Repository Hygiene — Phase 3 Deletion Plan (`cleanup/02-deletion-plan.md`)

- **Branch:** `chore/cleanup` (Baseline Commit: `7ba48c6`, Tag: `pre-cleanup`)
- **Project Archive Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-project-backup-20261108.zip` (`7,404,017` bytes / 7.06 MB; 1,559 files verified)
- **PostgreSQL Dump Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-db-backup-20261108.dump` (`84,518` bytes; verified restore into `zaminflow_restore_verify_tmp`)
- **External Trash Folder:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-cleanup-trash-20261108`

---

## 1. Totals by Classification

| Class | Category Description | File Count | Size (Bytes) | Size (KB / MB) | Dependencies | Execution Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Class A** | Untracked caches & bytecode (`__pycache__/`, `.pytest_cache/`, `*.pyc`) | **58** | `526,176` | **513.8 KB** (0.50 MB) | 0 | **COMPLETED & VERIFIED** (Moved to Trash `batch-A`) |
| **Class B** | Proven-unused source files (5) & unreferenced public images (4) + unused backend deps (2) | **9** | `195,279` | **190.7 KB** (0.19 MB) | **2** (`passlib[bcrypt]`, `geoalchemy2`) | **READY FOR BATCH B** (Evidence documented below) |
| **Class C** | Legacy route groups, mock stores, duplicate QA tests, `@tanstack/react-query`, `.jpg` vs `.webp` portraits | **42+** | `405,906` | **396.4 KB** (0.39 MB) | **1** (`@tanstack/react-query`) | **AWAITING USER APPROVAL** (See `cleanup/questions.md`) |
| **Class D** | Protected list (`.env`, DB dumps, Alembic migrations, `docs/`, `qa/`, tests, Docker/Caddy, lockfiles) | **144** | `752,633` | **735.0 KB** (0.72 MB) | — | **PROTECTED (Never Touch)** |
| **Keep** | Active application routes, components, API modules, schemas, and active public assets | **165** | `3,209,678` | **3,134.5 KB** (3.06 MB) | 26 | **ACTIVE (Retained)** |
| **TOTAL** | **Working Tree (Excluding `.git/`)** | **418** | **`5,089,672`** | **4.85 MB** | **29** | — |

---

## 2. Class A — Automatic Cleanup (Executed & Verified in Batch A)

All 58 untracked cache and bytecode files (`526,176` bytes) were moved to `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-cleanup-trash-20261108\batch-A\` and logged with SHA-256 checksums in `cleanup/deletion-log.csv`:
- `backend/.pytest_cache/*` (5 files, `6,047` bytes)
- `backend/alembic/**/__pycache__/*.pyc` (3 files, `22,086` bytes)
- `backend/app/**/__pycache__/*.pyc` (36 files, `297,845` bytes)
- `backend/qa/automation/__pycache__/*.pyc` (4 files, `31,823` bytes)
- `backend/tests/__pycache__/*.pyc` (10 files, `168,375` bytes)

---

## 3. Class B — Delete With Evidence (One Category per Commit, Gate After Each)

### Batch B1: Proven-Dead Frontend Source Files (5 files, `31,961` bytes)

| # | Path | Size (Bytes) | Proof / Evidence of Non-Use |
| :---: | :--- | :---: | :--- |
| 1 | `frontend/src/components/dashboard/GapPlaceholder.tsx` | `5,646` | Repo-wide AST & text search for `GapPlaceholder` across `frontend/src/**` returns **0 imports**. Superseded when all 21 dashboard sub-pages were implemented. |
| 2 | `frontend/src/components/ui/QrDispatchCard.tsx` | `3,762` | Repo-wide search for `QrDispatchCard` across `frontend/src/**` returns **0 imports**. QR pickup is handled directly in `frontend/src/app/(field)/farmer/qr-pickup/page.tsx` and `/dashboard/driver/confirm-pickup/page.tsx`. |
| 3 | `frontend/src/lib/businessRulesEngine.ts` | `7,601` | Repo-wide search for `businessRulesEngine`, `calculateMilkValuation`, and all exported symbols returns **0 imports** across `frontend/src/**`. Quality pricing math runs on the backend (`smart_contracts/service.py`) and inline in `list-supply/page.tsx`. |
| 4 | `frontend/src/components/dashboard/DashboardShell.tsx` | `8,634` | Repo-wide regex search `\bDashboardShell\b` across `frontend/src/**` returns **0 imports** outside `DashboardShell.tsx` itself. All 5 role overview pages use their dedicated `*Overview.tsx` components, and all 21 sub-pages use `RoleDashboardShell.tsx`. |
| 5 | `frontend/src/lib/dashboardData.ts` | `6,318` | Repo-wide search for `dashboardData`, `getDashboardDataForRole`, and `ROLE_DASHBOARDS` returns **1 import**, solely inside the dead `DashboardShell.tsx` (#4 above). Active dashboards use `roleDashboardService.ts`. |

### Batch B2: Proven-Unused Public Image Assets (4 files, `163,318` bytes)

| # | Path | Size (Bytes) | Proof / Evidence of Non-Use |
| :---: | :--- | :---: | :--- |
| 6 | `frontend/public/images/cold-chain-truck.jpg` | `50,789` | Repo-wide search for `cold-chain-truck` across all `.tsx`, `.ts`, `.css`, `.md`, and `.json` files returns **0 references**. |
| 7 | `frontend/public/images/zaminflow-logo-dark-original.png` | `8,599` | Repo-wide search for `zaminflow-logo-dark-original` returns **0 references**. `ZaminFlowLogo.tsx` uses `zaminflow-logo-dark.png` and `zaminflow-logo-light.png`. |
| 8 | `frontend/public/images/zaminflow-logo-white.png` | `57,741` | Repo-wide search for `zaminflow-logo-white` returns **0 references**. |
| 9 | `frontend/public/images/zaminflow-official-logo.jpg` | `46,189` | Repo-wide search for `zaminflow-official-logo` returns **0 references**. |

### Batch B3: Proven-Unused Backend Dependencies in `backend/pyproject.toml` (2 packages)

| # | Package in `backend/pyproject.toml` | Proof / Evidence of Non-Use |
| :---: | :--- | :--- |
| 10 | `passlib[bcrypt]>=1.7.4` | Repo-wide search for `passlib` across `backend/**` returns **0 occurrences**. `backend/app/core/security.py` uses `argon2-cffi` (`PasswordHasher`) and `bcrypt` directly. |
| 11 | `geoalchemy2>=0.15.2` | Repo-wide search for `geoalchemy2` across `backend/**` returns **0 occurrences**. All PostGIS spatial operations in `backend/app/modules/` use raw SQL `ST_DWithin` / `ST_GeogFromText` via SQLAlchemy `text()` and `asyncpg`. |

---

## 4. Class C — Requires User Decision (Stop & Ask Gate)

Detailed in [`cleanup/questions.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/cleanup/questions.md) (Questions Q1 through Q7):
- **Q1:** Legacy `(field)` and `(portal)` route groups (`36` route files + `14` UI/feature components used only by them, totaling `~358 KB`).
- **Q2:** Legacy `/auth/login` and `/auth/register` redirect pages (`2` files) and hyphenated `/sign-in` + `/sign-up` route aliases (`2` files).
- **Q3:** Frontend client-side fallback stores (`farmerStore.ts`, `dairyStore.ts`, `driverStore.ts`, `adminStore.ts` — `4` files, `23,751` B).
- **Q4:** Byte-identical duplicate QA test scripts in `backend/qa/automation/` vs `qa/automation/` (`4` duplicate files, `18,727` B).
- **Q5:** Unused `@tanstack/react-query` dependency in `frontend/package.json` (wrapped in `layout.tsx`, `0` queries/mutations in codebase).
- **Q6:** Duplicate icon (`frontend/public/icon.png` vs `frontend/public/images/zaminflow-icon.png`, byte-identical `61,137` B) and duplicate `.jpg` vs `.webp` team portraits (`4` `.jpg` files totaling `563,676` B).
- **Q7:** Backend partner/webhook/field API endpoints not called directly by the current Next.js dashboard UI (`/api/v1/bank/webhooks/confirm-lock`, `/api/v1/matching/recommendations`, `/api/v1/contracts/{contract_id}/sign`, `/api/v1/batches/*`).
