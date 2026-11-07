# Runbook 03: Production Deployment, Staged Rollout & Instant Rollback

**Document ID:** `RB-03`  
**Deployment Strategy:** Blue-Green / Container Hot-Reload with Pre-Flight Smoke Tests  

---

## 1. Pre-Deployment Verification Checklist
1. All automated tests pass:
   - Backend: `docker exec dairy_backend pytest` (Unit & domain tests).
   - Integration & Security: `python qa/automation/test_critical_flows.py` and `python qa/automation/test_qa_fixes.py`.
   - Frontend route guards: `docker exec dairy_frontend node /app/qa/automation/test_roles_redirect.mjs`.
2. Database migration verified with tested rollback script.
3. Database backup snapshot taken immediately prior to migration.

---

## 2. Staged Deployment Steps

```bash
#!/usr/bin/env bash
set -euo pipefail

# 1. Take safety snapshot
docker exec dairy_db pg_dump -U dairy_user -Fc dairy_platform > /var/backups/zaminflow/pre_deploy_snapshot.dump

# 2. Run database migration (Expand phase)
docker exec dairy_backend alembic upgrade head

# 3. Build & update containers
docker compose build --pull
docker compose up -d --no-deps backend
sleep 5

# 4. Run post-migration health check
STATUS=$(curl -s http://localhost:8000/api/v1/health | grep -o '"status":"healthy"' || true)
if [ -z "$STATUS" ]; then
    echo "ERROR: Backend health check failed! Initiating rollback..."
    exit 1
fi

# 5. Reload frontend and edge proxy
docker compose up -d --no-deps frontend
docker exec dairy_caddy caddy reload
```

---

## 3. Instant Rollback Procedure

If fatal regression occurs post-deployment:

```bash
# 1. Revert container image to previous tag or git commit
# 2. Revert database migration if necessary:
docker exec dairy_backend alembic downgrade -1

# 3. If schema rollback fails, restore safety snapshot:
cat /var/backups/zaminflow/pre_deploy_snapshot.dump | docker exec -i dairy_db pg_restore -U dairy_user -d dairy_platform --clean
docker restart dairy_backend dairy_frontend
```
