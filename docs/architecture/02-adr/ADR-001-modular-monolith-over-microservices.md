# ADR-001: Modular Monolith Architecture over Microservices

## Status
Accepted

## Context
ZaminFlow is an early-stage B2B AgriTech & FinTech platform connecting farmers, logistics drivers, commercial dairy processors, and partner banks in Uzbekistan. The team is small (2–4 engineers), operating with limited DevOps bandwidth. The business requires high data integrity across transactional boundaries: milk quality titration results immediately trigger automated escrow release, ledger debit/credit postings, and notification dispatch.

## Decision Drivers
- Operational simplicity and single-unit deployment.
- Strict ACID transactional guarantees across orders, delivery batches, and financial ledger entries without distributed transaction overhead (no two-phase commit / saga orchestrator complexity).
- Low infrastructure cost within Uzbekistan datacenters.
- Fast onboarding and debuggability for junior and mid-level full-stack engineers.

## Options Considered
1. **Microservices Architecture:** Decomposing into Auth Service, Order Service, Logistics Service, and FinTech Ledger Service communicating over RabbitMQ/Kafka or gRPC.
2. **Modular Monolith (FastAPI + PostgreSQL):** A single Python codebase structured into isolated domain modules (`auth_rbac`, `smart_contracts`, `qr_logistics`, `escrow_ledger`, `metrics`, `notifications`) sharing a single PostgreSQL 16 database with strict foreign key constraints and clear service boundaries.

## Decision
We choose the **Modular Monolith Architecture (Option 2)**. Domain logic is compartmentalized inside `backend/app/modules/<domain>/` with clear dependency direction (modules do not cross-import circular dependencies; financial ledger is only called via explicit service functions).

## Consequences
- **Positive:**
  - Local transactions ensure escrow releases and batch state changes are atomic (zero risk of orphaned escrow state).
  - Single Docker container (`dairy_backend`) simplifies hosting, local development, and CI/CD pipelines.
  - Reduced network latency between domain boundaries.
- **Negative:**
  - Deployment rolls out the entire backend monolith simultaneously.
- **Triggers for Re-evaluation:**
  - Sustained load exceeding 5,000 requests/second with identified domain bottlenecks (e.g., GPS telemetry ingestion consuming all DB connections).
  - Engineering team expanding beyond 15 engineers with independent deployment cadence requirements.
