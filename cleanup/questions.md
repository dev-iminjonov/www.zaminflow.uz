# ZaminFlow Repository Cleanup — Class C Questions & Approved Decisions (`cleanup/questions.md`)

All 7 Class C questions (`Q1–Q7`) were reviewed and approved by the user on 2026-11-08:

| Question | Item Summary | Recommendation | User Decision | Execution Status |
| :---: | :--- | :--- | :---: | :--- |
| **Q1** | Legacy `(field)` and `(portal)` route groups (`frontend/src/app/(field)/*`, `(portal)/*`) | **KEEP** (preserve `/gate-scanner` & `/bank/*` and document consolidation in `03-structure-and-rename-proposals.md`) | **Approved** | Retained; documented in `cleanup/03-structure-and-rename-proposals.md` |
| **Q2** | Auth route aliases (`/sign-in`, `/sign-up`, `/auth/login`, `/auth/register`) | **KEEP** (required by `qa/automation/test_qa_001_both_paths.py`) | **Approved** | Retained |
| **Q3** | Frontend client-side stores (`farmerStore.ts`, `dairyStore.ts`, `driverStore.ts`, `adminStore.ts`) | **KEEP** (actively imported by 21 dashboard sub-pages) | **Approved** | Retained |
| **Q4** | Duplicate QA test scripts (`backend/qa/automation/` vs `qa/automation/`) | **KEEP** (required for `docker exec dairy_backend pytest` inside container) | **Approved** | Retained |
| **Q5** | Unused `@tanstack/react-query` dependency in `frontend/package.json` | **REMOVE** (unwrap `QueryClientProvider` in `layout.tsx` and `npm uninstall @tanstack/react-query`) | **Approved** | **Executed in Batch C1 (`b1493fa`)** |
| **Q6** | Duplicate `zaminflow-icon.png` (`61,137` B) & `team-*.jpg` portraits (`563,676` B) | **REMOVE** (update 3 files to `/icon.png` and `team-*.webp`, then `git rm` the 5 duplicate files) | **Approved** | **Executed in Batch C2 (`13b8dfa`, `624,813` B freed)** |
| **Q7** | Backend partner/webhook/field API endpoints (`/api/v1/bank/webhooks/*`, `/matching/*`, `/contracts/*`, `/batches/*`, `/trust/*`) | **KEEP ALL** (tested by `test_core_specifications.py` and used by partner/field clients) | **Approved** | Retained |
