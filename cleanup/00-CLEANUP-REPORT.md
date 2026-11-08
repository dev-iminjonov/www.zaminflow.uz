# ZaminFlow Repository Hygiene & Cleanup Report (`cleanup/00-CLEANUP-REPORT.md`)

## Backup & Trash Locations (Phase 0 Safety Net)
- **Git Branch & Baseline Tag:** Branch `chore/cleanup` | Baseline commit `7ba48c6` | Tag `pre-cleanup`
- **External Project Archive Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-project-backup-20261108.zip` (`7,404,017` bytes / 7.06 MB — verified `1,559 / 1,559` files)
- **External PostgreSQL Dump Backup:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-backups-20261108\zaminflow-db-backup-20261108.dump` (`84,518` bytes — verified restore into `zaminflow_restore_verify_tmp` with 9 users and 6 organizations)
- **External Trash Directory:** `C:\Users\Muhammad Aziz\.gemini\antigravity\brain\b97666ab-a5bf-4516-85f6-75f467d68d8a\scratch\zaminflow-cleanup-trash-20261108`

---

## 1. One-Page Executive Summary

### Toolchain & Environment Verification
- **Git:** `2.47.1.windows.1` (`C:\Users\Muhammad Aziz\AppData\Local\Programs\Git\cmd\git.exe`)
- **Docker & Compose:** Docker `29.9.2` (`build a82e528`), Docker Compose `v5.6.1`
- **Node.js & npm:** Not installed on Windows host PATH; executed inside `dairy_frontend` container (`node v20.20.2`, `npm 10.8.2`)
- **Python & Alembic & Pytest:** Executed inside `dairy_backend` container (`Python 3.12.16`, `pytest 9.2.0`, `alembic 1.20.1`)
- **PostgreSQL / PostGIS:** Executed inside `dairy_db` container (`psql 16.4`, PostGIS `3.4`)

### Baseline Measurements (Phase 1 — Recorded in `cleanup/baseline/`)
- **`docker compose up -d --build` Time:** `65.91s`
- **Containers:** `dairy_db` (Up, healthy), `dairy_backend` (Up, port 8000), `dairy_frontend` (Up, port 3000), `dairy_caddy` (Up, ports 80/443)
- **Docker Image Sizes:** `wwwzaminflowuz-frontend:latest` = `1.42GB`, `wwwzaminflowuz-backend:latest` = `812MB`, `postgis/postgis:16-3.4-alpine` = `627MB`, `caddy:2-alpine` = `92MB`
- **Frontend Production Build:** `81 / 81` routes compiled cleanly (`First Load JS shared by all: 103 kB`; middleware `35.6 kB`); `npx tsc --noEmit` exit code `0`
- **Backend OpenAPI Inventory:** `66` paths, `69` HTTP operations (`cleanup/baseline/openapi.json`)
- **Alembic Migration State:** `current = 0002_onboarding_gating (head)`, `heads = 0002_onboarding_gating (head)`
- **Test Suites:**
  - `backend/tests/`: **27 / 27 passed** (`2.40s`)
  - `backend/qa/automation/`: **20 passed, 1 pre-existing failure** (`test_qa_001_public_signup_rejects_admin_variants` receives `429 Too Many Requests` instead of `422` when run immediately after `test_critical_flows.py` + `test_qa_001_both_paths.py` because `/api/v1/auth/sign-up` enforces a 10-requests/minute IP rate limit)
- **Smoke Tests (`cleanup/baseline/smoke-tests.json`):** `9 / 9 passed` (Landing 200 OK, Live Stats section & `/api/v1/public/stats` 200 OK, Contact section & `POST /api/v1/inquiries` 201 Created, Sign-In 200 OK for Farmer, Dairy, Driver, Admin, Sign-Out 200 OK)

### Before vs. After Batch A Numbers
| Metric | Phase 1 Baseline | After Batch A (Class A) | After Planned Batch B (Class B) |
| :--- | :---: | :---: | :---: |
| **Working Tree Files (excl. `.git`)** | 418 | **360** (-58 files) | **351** (-67 files total) |
| **Working Tree Size (excl. `.git`)** | 5,089,672 B (4.85 MB) | **4,563,496 B** (-526.2 KB) | **4,368,217 B** (-721.5 KB total) |
| **Backend `pyproject.toml` Prod Deps** | 17 | 17 | **15** (-2: `passlib`, `geoalchemy2`) |
| **Backend `pytest tests/`** | 27 / 27 passed | **27 / 27 passed** | 27 / 27 passed |
| **TypeScript `tsc --noEmit`** | 0 errors | **0 errors** | 0 errors |
| **OpenAPI Endpoints** | 66 paths / 69 ops | **66 paths / 69 ops** | 66 paths / 69 ops |

### Pre-Existing Issues Logged (Not Modified per Scope Rules)
1. **Rate-limit collision in sequential QA suite (`qa/automation/test_qa_fixes.py`):** Running all files in `qa/automation/` back-to-back triggers more than 10 `POST /api/v1/auth/sign-up` requests from the same container IP within 60 seconds, causing `test_qa_001_public_signup_rejects_admin_variants` to receive HTTP `429` instead of `422`. Running `test_qa_fixes.py` after the rate-limit window passes succeeds.
2. **Missing `.dockerignore` in `frontend/` and `backend/`:** Will be added in Phase 5 Hygiene Files after deletion batches complete.
