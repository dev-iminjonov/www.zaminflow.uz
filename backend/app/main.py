from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.modules.auth_rbac.service import router as auth_router
from app.modules.disputes.service import router as disputes_router
from app.modules.inquiries.service import router as inquiries_router
from app.modules.escrow_ledger.service import (
    get_bank_dashboard_kpis,
    router as bank_router,
)
from app.modules.geo_matching.service import router as matching_router
from app.modules.notifications.service import router as notifications_router
from app.modules.profiles_kyb.service import router as profiles_router
from app.modules.public_stats.service import router as public_stats_router
from app.modules.qr_logistics.service import router as batches_router
from app.modules.smart_contracts.service import router as contracts_router
from app.modules.trust_rating.service import router as trust_router

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def nightly_bank_settlement_report_job() -> None:
    """In-process APScheduler background job for nightly Partner Bank settlement summary."""
    try:
        async with AsyncSessionLocal() as db:
            kpis = await get_bank_dashboard_kpis(db)
            logger.info("Nightly Bank Settlement Report Generated: %s", kpis)
    except Exception as exc:
        logger.warning("Nightly settlement job skipped: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    scheduler.add_job(
        nightly_bank_settlement_report_job,
        "cron",
        hour=23,
        minute=55,
        id="nightly_bank_settlement",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profiles_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(matching_router, prefix=settings.API_V1_STR)
app.include_router(contracts_router, prefix=settings.API_V1_STR)
app.include_router(bank_router, prefix=settings.API_V1_STR)
app.include_router(batches_router, prefix=settings.API_V1_STR)
app.include_router(trust_router, prefix=settings.API_V1_STR)
app.include_router(disputes_router, prefix=settings.API_V1_STR)
app.include_router(inquiries_router, prefix=settings.API_V1_STR)
app.include_router(public_stats_router, prefix=settings.API_V1_STR)
app.include_router(public_stats_router, prefix="/api")
app.include_router(public_stats_router)


@app.get("/health")
@app.get("/api/health")
@app.get(f"{settings.API_V1_STR}/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "architecture": "modular-monolith-v3.0"}
