# ZaminFlow API

FastAPI service for authentication, organization profiles, KYB, logistics, contracts, escrow, notifications, and dashboards.

The container entrypoint runs `app.bootstrap`, which safely recognizes the Supabase schema already applied to the production project, records its Alembic baseline, applies pending migrations, and starts Uvicorn on the port supplied by the hosting platform.
