# Runbook 01: Production Incident Response & On-Call Playbook

**Document ID:** `RB-01`  
**Severity Levels:** SEV-1 (Critical Outage / Money Loss), SEV-2 (Major Degradation), SEV-3 (Minor Feature Bug)  

---

## 1. Initial Triage & Escalation (First 15 Minutes)

1. **Verify Outage Scope:**
   - Probe Caddy ingress: `curl -I https://zaminflow.uz/health`
   - Probe Backend API directly: `docker exec dairy_backend curl -I http://localhost:8000/api/v1/health`
   - Check container status: `docker ps`
2. **Declare Incident Channel:**
   - Post to internal Telegram operations group with Incident Commander (IC), current symptoms, and affected users (e.g. "Farmers unable to complete QR pickup").

---

## 2. Common Failure Scenarios & Mitigations

### Scenario A: Backend Returns 502/503 Service Unavailable
- **Diagnosis:** FastAPI process crashed, out-of-memory (OOM), or DB connection pool exhausted.
- **Action:**
  ```bash
  # Check recent error stack traces
  docker logs --tail 100 dairy_backend
  # Check database active connections
  docker exec dairy_db psql -U dairy_user -d dairy_platform -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
  # Restart backend container if frozen
  docker restart dairy_backend
  ```

### Scenario B: SMS Gateway Down (Farmers Cannot Sign In)
- **Diagnosis:** Provider API returning 500 or carrier balance exhausted.
- **Action:**
  - Check SMS error logs in backend: `docker logs dairy_backend | grep "sms_dispatch_error"`
  - Switch provider fallback or enable emergency email/Telegram verification mode.

### Scenario C: Database Disk Space Full (>90%)
- **Diagnosis:** PostGIS logs or WAL accumulation.
- **Action:**
  ```bash
  # Check disk usage
  docker exec dairy_db df -h /var/lib/postgresql/data
  # Run safe vacuum
  docker exec dairy_db psql -U dairy_user -d dairy_platform -c "VACUUM (ANALYZE);"
  ```
