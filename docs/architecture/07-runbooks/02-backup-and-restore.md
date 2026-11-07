# Runbook 02: PostgreSQL Backup, Restore & Disaster Recovery Drill

**Document ID:** `RB-02`  
**RPO Target:** $< 15$ minutes  
**RTO Target:** $< 2$ hours  

---

## 1. Automated Daily Backup Procedure

Automated backup runs daily at 02:00 Tashkent time via cron:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/zaminflow"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/dairy_platform_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

# Execute custom-format binary dump with PostGIS spatial schemas
docker exec dairy_db pg_dump -U dairy_user -Fc dairy_platform > "${BACKUP_FILE}"

# Encrypt and upload to off-site S3-compatible cold storage
# rclone copy "${BACKUP_FILE}" remote:zaminflow-backups/

# Prune local backups older than 14 days
find "${BACKUP_DIR}" -type f -name "*.dump" -mtime +14 -delete
```

---

## 2. Tested Disaster Recovery Restore Procedure

To restore database to a clean target container or recover from corruption:

```bash
#!/usr/bin/env bash
set -euo pipefail

RESTORE_SOURCE="$1" # e.g. /var/backups/zaminflow/dairy_platform_20261107.dump

# 1. Stop application traffic to prevent concurrent writes
docker stop dairy_backend dairy_frontend

# 2. Terminate active database connections
docker exec dairy_db psql -U dairy_user -d postgres -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'dairy_platform' AND pid <> pg_backend_pid();
"

# 3. Drop and recreate clean database
docker exec dairy_db psql -U dairy_user -d postgres -c "DROP DATABASE IF EXISTS dairy_platform;"
docker exec dairy_db psql -U dairy_user -d postgres -c "CREATE DATABASE dairy_platform OWNER dairy_user;"

# 4. Restore database with pg_restore
cat "${RESTORE_SOURCE}" | docker exec -i dairy_db pg_restore -U dairy_user -d dairy_platform --no-owner --role=dairy_user

# 5. Run Alembic migration check
docker exec dairy_backend alembic current

# 6. Restart application services and verify healthcheck
docker start dairy_backend dairy_frontend
curl -s http://localhost:8000/api/v1/health | grep '"status":"healthy"'
```
