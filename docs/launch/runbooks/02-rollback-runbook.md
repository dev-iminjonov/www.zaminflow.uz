# ZaminFlow Production Rollback & Incident Recovery Runbook

**Document ID:** `DOC-OPS-002`  
**Squad Lead:** SRE & Database Architect  
**Status:** Approved Standard  
**Date:** 2026-11-08  

---

## 1. Rollback Triggers (P0 Severity)

Immediate rollback is initiated if any of the following conditions persist for $> 5$ minutes:
1. **Critical Authentication Failure:** Legitimate users cannot sign in or sign up across all roles (HTTP 500 on auth endpoints).
2. **Financial Ledger Corruption:** Discrepancy detected in escrow balances or settlement calculation formulas.
3. **Severe Network / Routing Outage:** HTTP 502/504 error rate exceeds 5% of total incoming traffic.
4. **Data Residency Compliance Breach:** Immediate shutdown order from regulatory authority.

---

## 2. Step-by-Step Rollback Procedure

### Step 1: Revert Frontend & Backend Containers to Previous Verified Image
```bash
# Pull and switch to previous release tag
docker compose -f docker-compose.yml down
git checkout <previous_stable_tag>
docker compose -f docker-compose.yml up -d --build
```

### Step 2: Revert Database Migrations (If Schema Was Changed)
```bash
# Alembic downgrade test verified under FND-DB-001
docker exec dairy_backend alembic downgrade -1
```

### Step 3: Clear Edge Proxy & Rate-Limiter State
```bash
docker exec dairy_caddy caddy reload --config /etc/caddy/Caddyfile
docker exec dairy_db psql -U dairy_user -d dairy_platform -c "TRUNCATE login_attempts;"
```

### Step 4: Verification of Restored Service
- Verify `GET /api/v1/health` returns `{"status": "healthy"}`.
- Verify `POST /api/v1/auth/sign-in` completes successfully with admin and farmer accounts.
- Verify public landing page renders cleanly.
