# ADR-006: Hybrid RBAC/ABAC and Strict Tenancy Data Isolation

**Status:** Approved  
**Date:** 2026-11-08  
**Squad:** Security Engineer, Backend Specialist, Frontend Specialist  

---

## 1. Context and Problem Statement

ZaminFlow brings together five distinct participant types with conflicting commercial interests: farmers seeking maximum milk yield returns, dairy processors protecting procurement margins and lab intake data, drivers operating on the road, partner banks auditing escrow solvency, and platform administrators arbitrating disputes.
Previously, the frontend had client-side mock role toggling and the middleware allowed role fallback using unverified cookies (`zaminflow_role`). We must establish an uncompromising authorization standard that prevents cross-tenant data leaks and privilege escalations.

---

## 2. Decision Drivers

- **Security & Regulatory Compliance:** Bank escrow data and farmer financial records are protected under Republic of Uzbekistan financial secrecy and personal data protection laws (Law No. ZRU-547).
- **Zero Trust Architecture:** Never trust the frontend client. Every request must be cryptographically authenticated and authoritatively checked at the database layer.
- **Maintainability & Performance:** Authorization checks must execute with minimal latency overhead ($< 5\text{ ms}$).

---

## 3. Considered Options

1. **Option 1: Pure RBAC (Role-Based Access Control alone)**
   - Check role string (`user.role == 'FARMER'`).
   - *Failure Mode:* A farmer could pass batch ID `123` belonging to another farmer cooperative and view or alter their milk volume. RBAC has no concept of entity ownership.
2. **Option 2: External ABAC Engine (e.g. Open Policy Agent / OPA Rego sidecar)**
   - High architectural overhead, added network hop per request, overkill for a modular monolith.
3. **Option 3: Hybrid RBAC + SQL-Enforced Attribute Tenancy (Selected)**
   - Fast role check in FastAPI dependencies, combined with strict SQL repository `WHERE` scoping on `organization_id` or contractual assignment foreign keys.

---

## 4. Decision

We adopt **Option 3: Hybrid RBAC + SQL-Enforced Attribute Tenancy**.
- Role checks (`require_role(['FARMER', 'ADMIN'])`) act as Gate 1.
- Database repositories enforce Gate 2 by filtering records by `organization_id` or explicit relation graphs.
- Frontend middleware validates server-signed JWT tokens only; unverified role cookies are completely rejected.

---

## 5. Consequences

- **Positive:**
  - Complete prevention of IDOR (Insecure Direct Object Reference) vulnerabilities.
  - Sub-millisecond authorization check overhead.
  - Clear, auditable permissions matrix.
- **Negative / Trade-offs:**
  - Requires developers to ensure every repository query includes tenancy filters.
  - Multi-party visibility (e.g. buyer viewing a batch in transit) requires explicit join conditions on active contracts.
