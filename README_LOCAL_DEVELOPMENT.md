# Local Development Guide for ZaminFlow Dairy Platform

## Prerequisites
- **Docker Desktop** (or Docker Engine) installed and running on your Windows machine.
- `docker` and `docker compose` commands available in your command prompt (PowerShell or CMD).
- Sufficient free ports: **80**, **443**, **3000**, **8000**, **5432**.

## Quick Start
1. **Create environment file**
   ```powershell
   copy .env.example .env
   # Edit .env if you need to change credentials or secrets
   ```
2. **Build and start the stack**
   ```powershell
   docker compose up --build -d
   ```
   This will build the backend (FastAPI), frontend (Next.js), PostgreSQL + PostGIS, and Caddy reverse proxy.
3. **Run database migrations**
   ```powershell
   docker exec -it dairy_backend alembic upgrade head
   ```
   (`dairy_backend` is the container name defined in `docker-compose.yml`.)
4. **Verify the API**
   ```powershell
   curl http://localhost/api/v1/health
   ```
   Expected response: `{ "status": "healthy", "architecture": "modular-monolith-v2.0" }`
5. **Open the web UI**
   - Visit **http://localhost** in your browser. Caddy will proxy to the Next.js app on port 3000.
   - You should see the desktop portal landing page. Use the provided authentication endpoints to register a user (e.g., `/api/v1/auth/register`).

## Common Tasks
- **Stop the stack**: `docker compose down`
- **View logs**: `docker logs -f dairy_backend` (replace with the service name you need)
- **Run backend tests**: `docker exec -it dairy_backend pytest`

## Troubleshooting
- **Docker not found**: Ensure Docker Desktop is installed and the `docker` command is in your PATH.
- **Port conflicts**: Change the ports in `docker-compose.yml` and `.env` accordingly.
- **Database connection errors**: Verify `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` match the values in `.env`.

For any further issues, consult the detailed documentation in the `docs/` directory of the repository.
