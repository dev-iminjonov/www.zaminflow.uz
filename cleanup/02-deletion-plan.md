# ZaminFlow Repository Hygiene — Phase 3 & Phase 4 Deletion Plan (`cleanup/02-deletion-plan.md`)

- **Branch:** `chore/cleanup` (Baseline Commit: `7ba48c6`, Tag: `pre-cleanup`)
- **Project Archive Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-project-backup-20261108.zip` (`7,404,017` bytes / 7.06 MB; 1,559 files verified)
- **PostgreSQL Dump Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-db-backup-20261108.dump` (`84,518` bytes; verified restore into `zaminflow_restore_verify_tmp` and `zaminflow_dump_migration_verify`)
- **External Trash Folder:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-cleanup-trash-20261108`

---

## 1. Final Totals by Classification

| Class | Category Description | Files Removed | Bytes Freed | KB / MB Freed | Dependencies Removed | Execution Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Class A** | Untracked caches & bytecode (`__pycache__/`, `.pytest_cache/`, `*.pyc`) | **58** | `526,176` | **513.8 KB** (0.50 MB) | 0 | **COMPLETED (`a091f50` / Trash `batch-A`)** |
| **Class B** | Proven-unused source files (5) & unreferenced public images (4) + unused backend deps (2) | **9** | `195,279` | **190.7 KB** (0.19 MB) | **2** (`geoalchemy2`, `passlib[bcrypt]`) | **COMPLETED (`2bfeb96`, `0651bab`, `b2ed9ae`, `83084bc`)** |
| **Class C (Approved)** | Unused `@tanstack/react-query` (Q5) + duplicate `zaminflow-icon.png` & `team-*.jpg` portraits (Q6) | **5** | `624,813` | **610.2 KB** (0.60 MB) | **1** (`@tanstack/react-query`) | **COMPLETED (`b1493fa`, `13b8dfa`)** |
| **TOTAL REMOVED** | **All Executed Cleanup Batches (A + B + Approved C)** | **72** | **`1,346,268`** | **1,314.7 KB (1.28 MB)** | **3** | **ALL GATES PASSED** |
| **Class C (Kept)** | Legacy `(field)`/`(portal)` routes (Q1), auth aliases (Q2), client stores (Q3), QA copies (Q4), partner APIs (Q7) | 0 (Retained) | — | — | 0 | **RETAINED PER USER APPROVAL** |
| **Class D** | Protected list (`.env`, DB dumps, Alembic migrations, `docs/`, `qa/`, tests, Docker/Caddy, lockfiles) | 0 (Protected) | — | — | 0 | **PROTECTED (Untouched)** |

---

## 2. Executed Batches & Commits

1. **Batch A (`a091f50`):** Moved 58 untracked Python/Pytest bytecode and cache files (`526,176` B) to `scratch\zaminflow-cleanup-trash-20261108\batch-A`.
2. **Batch B1 (`2bfeb96`):** Removed 5 unused frontend source files (`GapPlaceholder.tsx`, `QrDispatchCard.tsx`, `businessRulesEngine.ts`, `DashboardShell.tsx`, `dashboardData.ts` — `31,961` B).
3. **Batch B2 (`0651bab`):** Removed 4 unreferenced public image assets (`cold-chain-truck.jpg`, `zaminflow-logo-dark-original.png`, `zaminflow-logo-white.png`, `zaminflow-official-logo.jpg` — `163,318` B).
4. **Batch B3a (`b2ed9ae`):** Removed unused `geoalchemy2>=0.15.2` from `backend/pyproject.toml`.
5. **Batch B3b (`83084bc`):** Removed unused `passlib[bcrypt]>=1.7.4` from `backend/pyproject.toml`.
6. **Batch C1 (`b1493fa`):** Unwrapped unused `QueryClientProvider` in `frontend/src/app/layout.tsx` and removed `@tanstack/react-query` via `npm uninstall`.
7. **Batch C2 (`13b8dfa`):** Consolidated icon and team portrait references to `/icon.png` and `/images/team-*.webp` and removed 5 duplicate files (`zaminflow-icon.png`, `team-muhammadaziz.jpg`, `team-sevinchoy.jpg`, `team-akrom.jpg`, `team-shohjahon.jpg` — `624,813` B).
8. **Phase 5 Hygiene (`bb7ccd2`):** Added `.dockerignore`, `frontend/.dockerignore`, `backend/.dockerignore`, root `README.md`, sanitized `.env.example`, and `cleanup/03-structure-and-rename-proposals.md`.
