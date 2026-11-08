# ZaminFlow Content Governance, Translation Workflow & Launch Freeze

**Document ID:** `DOC-CNT-008`  
**Squad Lead:** Content Management Specialist  
**Status:** Approved Standard  
**Date:** 2026-11-08  

---

## 1. Content Ownership & Roles

| Domain | Responsible Role | Reviewer / Approver | Tools & Location |
|:---|:---|:---|:---|
| **Marketing & Hero Copy** | Growth & Content Lead | Platform Founder | `frontend/src/messages/translations.ts` |
| **Domain & Financial Terminology** | AgriTech Product Manager | Dairy Procurement Lead | `docs/launch/content/04-glossary-and-tone.md` |
| **Legal Terms & Privacy** | Legal Counsel (Uzbekistan) | Executive Management | `docs/launch/content/07-legal-and-trust.md` |
| **Transactional SMS / Email** | Product Ops | Engineering Lead | `frontend/src/messages/auth.ts` |
| **Error Messages & Form Labels** | UX Writer | Principal QA Engineer | `frontend/src/messages/*.ts` |

---

## 2. Translation & Review Workflow

1. **Source of Truth:** English (`en`) and Uzbek Latin (`uz`) are authored in parallel in TypeScript translation dictionaries.
2. **Key Naming Convention:** Dot-notated hierarchical keys: `<section>.<component>.<element>` (e.g. `hero.cards.livePricing`).
3. **Draft Marking:** Any translation not signed off by a native speaker must include the comment `// DRAFT - needs native review`.
4. **No Direct Production Edits:** Content modifications are submitted via pull requests with automated linting and visual snapshot verification.
5. **No CMS for Launch v1:** In accordance with Question #10, Git-backed dictionary files eliminate runtime latency, external CMS vulnerabilities, and database sync overhead.

---

## 3. Pre-Launch Content Freeze Checklist (T-48 Hours)

- [ ] All 18 identified placeholder strings replaced with approved copy.
- [ ] Real legal entity name, INN/STIR, and official support phone inserted into footer and contact section.
- [ ] Contact Us form wired to real persistent inbox / backend queue.
- [ ] Legal Privacy Policy and Terms linked to dedicated accessible pages.
- [ ] All 3 language dictionaries (`uz`, `ru`, `en`) 100% synchronized with zero missing keys.
- [ ] Content freeze enacted: no copy changes permitted within 48 hours of go-live except critical legal fixes.
