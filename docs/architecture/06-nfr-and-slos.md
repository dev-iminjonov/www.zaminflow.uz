# ZaminFlow Non-Functional Requirements (NFR) & Service Level Objectives (SLO)

**Document ID:** `DOC-NFR-001`  
**Target Release:** Production v2.0  
**Status:** Baseline Specification  

---

## 1. Service Level Indicators (SLI) & Objectives (SLO)

| Service Area | Indicator (SLI) | Target Objective (SLO) | Measurement Method |
| :--- | :--- | :--- | :--- |
| **Availability** | Ratio of non-5xx HTTP responses over total requests | **99.7% monthly uptime** ($\le 2.16$ hrs downtime/month) | Caddy access logs & Prometheus blackbox probe |
| **API Latency (P95)** | Time to complete non-streaming REST API requests | **$\le 250\text{ms}$ (P95)**, $\le 600\text{ms}$ (P99) | FastAPI middleware timing header |
| **Real-time Telemetry** | Latency of live trade updates & active shipment stream | **$\le 1,200\text{ms}$ end-to-end** | WebSocket ticker timestamp delta |
| **Database Query** | P95 latency of relational & spatial queries | **$\le 50\text{ms}$ (P95)** | PostgreSQL `pg_stat_statements` |
| **Recovery Point (RPO)**| Maximum tolerable data loss window in disaster | **$< 15$ minutes** | PostgreSQL continuous WAL archiving |
| **Recovery Time (RTO)** | Time to restore full operational service from backup | **$< 2$ hours** | Automated restore drill script |

---

## 2. Core Web Vitals Performance Budgets (Next.js Frontend)

Measured on throttled 4G mobile emulation (360px & 390px viewports):
- **Largest Contentful Paint (LCP):** $\le 2.5\text{s}$ (Good). The hero 3D visual and dashboard charts must use preloaded optimized WebP/AVIF formats with fixed container aspect ratios to eliminate layout shift.
- **Cumulative Layout Shift (CLS):** $\le 0.05$ (Target $\le 0.10$). Skeletons must match exact component bounding boxes during data fetching.
- **Interaction to Next Paint (INP):** $\le 200\text{ms}$. Smooth touch feedback on carousel scrolling and tab switching.

---

## 3. Resilience & Failure Modes

1. **SMS Gateway Outage:** If Eskiz.uz fails, API returns standard error code `SMS_GATEWAY_UNAVAILABLE`; user is offered alternative verification via registered email or Telegram bot.
2. **Database Reconnect:** `AsyncSessionLocal` utilizes `pool_pre_ping=True` and connection recycling (`pool_recycle=3600`) to recover automatically from transient database network disconnects.
3. **Driver Offline Resilience:** Driver app caches QR verification payloads locally; synchronizes with backend upon cell signal re-establishment.
