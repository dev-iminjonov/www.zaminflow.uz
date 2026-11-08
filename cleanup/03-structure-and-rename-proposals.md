# ZaminFlow Repository Hygiene — Phase 5 Structure & Rename Proposals (`cleanup/03-structure-and-rename-proposals.md`)

Per Phase 5 rules (*"Propose (do not apply) a cleaner folder structure and any renames in a document; renames are a separate task"*), none of the structural moves or renames below have been applied during cleanup. They are documented here for a dedicated future refactoring PR.

---

## 1. Proposed Folder Structure Consolidation

### A. Unify QA Automation Suites (`qa/automation/` vs `backend/qa/automation/`)
- **Current State:** Four QA automation scripts exist in both `qa/automation/` (root) and `backend/qa/automation/` because `docker-compose.yml` only mounts `./backend:/app` inside `dairy_backend`.
- **Proposed Change (Future Task):**
  1. Add `- ./qa:/app/qa:ro` to `services.backend.volumes` in `docker-compose.yml`.
  2. Delete the duplicate directory `backend/qa/` so `qa/automation/` at the repository root is the single source of truth for QA scripts.

### B. Consolidate Legacy `(field)` and `(portal)` Route Groups into `/dashboard/*`
- **Current State:**
  - Canonical dashboards and their 21 sub-pages live under `frontend/src/app/dashboard/{farmer,dairy,driver,bank,admin}/*`.
  - Legacy prototype route groups `frontend/src/app/(field)/*` and `frontend/src/app/(portal)/*` remain in the tree, while `frontend/src/middleware.ts` 307-redirects `/farmer/*`, `/industry/*`, `/driver/*`, and `/admin/*` to `/dashboard/*`.
- **Proposed Change (Future Task):**
  1. Migrate `/gate-scanner` (`frontend/src/app/(field)/gate-scanner/page.tsx`) to `frontend/src/app/dashboard/dairy/gate-scanner/page.tsx`.
  2. Migrate `/bank/underwriting` and `/bank/ledger` (`frontend/src/app/(portal)/bank/*`) under `frontend/src/app/dashboard/bank/*`.
  3. Remove `frontend/src/app/(field)` and `frontend/src/app/(portal)` and their 14 legacy-only components (`~358 KB`), keeping lightweight 308 permanent redirects in `next.config.mjs`.

### C. Consolidate Auth Route Aliases (`/signin` vs `/sign-in`, `/signup` vs `/sign-up`)
- **Current State:** Both `/signin` and `/sign-in` (plus `/auth/login`) exist as separate route folders in `frontend/src/app/`.
- **Proposed Change (Future Task):**
  1. Keep `/signin` and `/signup` as the single canonical route folders.
  2. Move `/sign-in`, `/sign-up`, `/auth/login`, and `/auth/register` into `redirects()` in `frontend/next.config.mjs`.

### D. Root Documentation Organization
- **Current State:** `GAPS.md`, `CHANGELOG.md`, and `README_API_SWAP.md` sit at the repository root alongside `docs/`.
- **Proposed Change (Future Task):**
  - Move `README_API_SWAP.md` and `GAPS.md` into `docs/architecture/` and link them from the root `README.md`.
