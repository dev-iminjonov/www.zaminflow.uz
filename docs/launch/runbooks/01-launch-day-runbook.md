# ZaminFlow Production Launch Day Runbook (T-0)

**Document ID:** `DOC-OPS-001`  
**Squad Lead:** SRE & Principal Architect  
**Status:** Approved Standard  
**Date:** 2026-11-08  

---

## 1. Launch Timeline & Checklist

| Time Window | Milestone | Action Items | Responsible Role | Verification Method |
|:---:|:---|:---|:---:|:---|
| **T - 24 Hours** | **Database & Seed Verification** | Run Alembic migrations to head (`alembic upgrade head`); verify admin accounts exist; ensure `login_attempts` clean. | Database Lead | `alembic current` & `psql` query |
| **T - 12 Hours** | **DNS & TLS Provisioning** | Configure `A` / `AAAA` records for `zaminflow.uz` and `www.zaminflow.uz`; verify Caddy automated TLS handshake (Let's Encrypt / ZeroSSL). | DevOps Lead | `curl -Iv https://zaminflow.uz` |
| **T - 4 Hours** | **Staging Smoke & Regression** | Run full automated Pytest suite (37 tests); run UAT checklist across all 4 roles. | QA Lead | `pytest -v` 100% green |
| **T - 2 Hours** | **Cache & Ingress Pre-Warm** | Verify `GET /api/v1/public/stats` returns cached JSON with sub-ms latency; check Caddy rate-limiting active. | Performance Lead | `curl -Iv /api/v1/public/stats` |
| **T - 0 (Go-Live)** | **DNS Switch to Production** | Cut over production traffic; verify public landing page paints with real DB figures; monitor server error log. | Incident Commander | Real-time log stream |

---

## 2. Emergency Contacts & Communication Protocol

- **Incident Commander:** Platform Founder
- **Technical Leads:** Backend / SRE Lead & Frontend Lead
- **Escalation Channel:** Dedicated Telegram War Room (`@zaminflow_war_room`)
- **Rollback Decision Window:** Within 15 minutes of any P0 failure (unhandled database exception, payment corruption, authentication loop).
