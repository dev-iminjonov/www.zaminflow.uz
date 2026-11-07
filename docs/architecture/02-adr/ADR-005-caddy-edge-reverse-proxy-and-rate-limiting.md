# ADR-005: Caddy Edge Reverse Proxy & Multi-Layer Rate Limiting

## Status
Accepted

## Context
The production environment runs Caddy 2 as the public-facing edge ingress container terminating TLS on ports 80 and 443. Caddy directly proxies `/api/*` to FastAPI (`dairy_backend:8000`) and all other routes to Next.js (`dairy_frontend:3000`). Currently, authentication rate limiting exists only in the Next.js API route handler, which is completely bypassed when traffic flows through Caddy.

## Decision Drivers
- Defense-in-depth against credential stuffing, brute force on `/api/v1/auth/sign-in`, and SMS OTP exhaustion.
- Preventing Next.js proxy overhead from becoming a bottleneck for high-frequency API traffic.
- Zero-downtime TLS renewal via Caddy ACME.

## Options Considered
1. **Rely Solely on Next.js Route Proxy:** Direct all edge traffic to Next.js, which then proxies API calls to FastAPI. (Rejected: adds node process overhead, memory pressure, and introduces a single point of failure for all API requests).
2. **Multi-Layer Defense (Caddy Ingress + FastAPI Middleware) (Recommended):**
   - Caddy handles TLS termination, gzip/zstd compression, and global connection throttling.
   - FastAPI enforces endpoint-specific rate limiting (`slowapi` or custom in-memory/DB token bucket) for `/api/v1/auth/sign-in` (20 attempts/min) and `/api/v1/auth/sms/send-otp` (3 attempts/min).
   - Next.js route proxy remains a secondary development and local fallback proxy.

## Decision
We adopt **Option 2 (Multi-Layer Defense)**. Rate limiting must be enforced inside the FastAPI application container so that all requests—whether entering via Caddy, internal microservices, or direct proxy—are strictly protected.

## Consequences
- **Positive:**
  - Robust brute-force protection regardless of ingress routing.
  - Efficient direct proxying for heavy data endpoints (e.g., live telemetry stream).
- **Negative:**
  - Rate limiting state must be managed within FastAPI.
