# ZaminFlow v2.0 — B2B Dairy Supply Chain & FinTech Escrow Platform

ZaminFlow connects smallholder dairy farmers, commercial dairy processors, cold-chain logistics drivers, and partner escrow banks across Uzbekistan.

---

## 1. Architecture & Stack

- **Frontend (`./frontend`):** Next.js 15 App Router (TypeScript, Tailwind CSS, Leaflet) on port `3000`
- **Backend (`./backend`):** FastAPI modular monolith (SQLAlchemy 2.0 Async, Alembic, Argon2id/JWT/HttpOnly cookies) on port `8000`
- **Database (`db`):** PostgreSQL 16 + PostGIS 3.4 (`postgis/postgis:16-3.4-alpine`) on port `5432`
- **Ingress (`caddy`):** Caddy 2 reverse proxy (`./Caddyfile`) on ports `80` / `443`

---

## 2. Quick Start (From a Fresh Clone)

### Step 1: Configure Environment
Copy `.env.example` to `.env` and populate local credentials (or use defaults in `docker-compose.yml` for local development):
```powershell
Copy-Item .env.example .env
```

### Step 2: Build and Start All Containers
```powershell
docker compose up -d --build
```

### Step 3: Run Database Migrations
The backend container runs `alembic upgrade head` automatically on startup. To verify or run migrations manually:
```powershell
docker exec dairy_backend alembic upgrade head
docker exec dairy_backend alembic current
```

### Step 4: Verify Services & Run Tests
```powershell
# 1. Backend unit & specification test suite
docker exec -e PYTHONDONTWRITEBYTECODE=1 dairy_backend pytest tests/ -p no:cacheprovider

# 2. Frontend TypeScript & production build verification
docker exec dairy_frontend npx tsc --noEmit
docker exec dairy_frontend npm run build
```

---

## 3. Primary Platform Routes

- **Public Landing Page:** `http://localhost:3000/`
- **Authentication:** `http://localhost:3000/signin` | `http://localhost:3000/signup`
- **Role Dashboards:**
  - **Farmer:** `http://localhost:3000/dashboard/farmer`
  - **Dairy Industry (Buyer):** `http://localhost:3000/dashboard/dairy`
  - **Logistics Driver:** `http://localhost:3000/dashboard/driver`
  - **Partner Bank Officer:** `http://localhost:3000/dashboard/bank`
  - **Platform Admin:** `http://localhost:3000/dashboard/admin`
- **Backend OpenAPI Spec:** `http://localhost:8000/openapi.json`

For switching role dashboards between mock telemetry and live backend REST APIs, see [`README_API_SWAP.md`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/README_API_SWAP.md).
