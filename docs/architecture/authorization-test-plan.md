# ZaminFlow Authorization & Security Test Plan

**Document ID:** `DOC-TEST-AUT-001`  
**Classification:** Quality Assurance & Security Validation  
**Target Coverage:** 100% of RBAC/ABAC Boundaries and Cross-Tenant Isolations  

---

## 1. Test Strategy & Scope

The Authorization Test Plan validates that every role boundary is strictly enforced at the API layer, rejecting unauthorized access with HTTP 401 Unauthorized or HTTP 403 Forbidden.
Tests run automatically inside the Pytest automated testing harness using dedicated isolated database fixtures.

---

## 2. Mandatory Test Matrix (Negative & Boundary Cases)

| Test Case ID | Acting User Role | Attempted Action | Target Endpoint / Resource | Expected HTTP Status | Security Objective |
|---|---|---|---|---|---|
| **AUTH-TEST-01** | Anonymous (No Token) | Access Farmer KPIs | `GET /api/v1/farmer/dashboard-kpis` | `401 Unauthorized` | Verify unauthenticated access is rejected |
| **AUTH-TEST-02** | Farmer User | Access Bank Ledger | `GET /api/v1/bank/ledger` | `403 Forbidden` | Verify RBAC blocks farmer from bank data |
| **AUTH-TEST-03** | Dairy Buyer User | Submit Farmer Batch | `POST /api/v1/farmer/batches` | `403 Forbidden` | Verify buyer cannot list milk supply |
| **AUTH-TEST-04** | Driver User | Alter Contract Terms | `POST /api/v1/contracts` | `403 Forbidden` | Verify driver cannot modify commercial terms |
| **AUTH-TEST-05** | Farmer A | Access Farmer B's Batch | `GET /api/v1/farmer/batches/{farmer_b_id}` | `404 Not Found` / `403 Forbidden` | Verify strict ABAC tenancy isolation (anti-IDOR) |
| **AUTH-TEST-06** | Dairy A | View Dairy B's Contracts | `GET /api/v1/dairy/contracts/{dairy_b_id}` | `403 Forbidden` | Verify commercial price secrecy between competing dairies |
| **AUTH-TEST-07** | Public Sign-up | Request Role: `ADMIN` | `POST /api/v1/auth/register` | `400 Bad Request` | Verify admin role cannot be self-assigned during registration |
| **AUTH-TEST-08** | Any User | Directly Modify Ledger | `UPDATE financial_ledger SET amount = 0` | `PostgreSQL Trigger Exception` | Verify immutability of double-entry ledger |
| **AUTH-TEST-09** | Bank Officer | Alter Lab Titration Test | `POST /api/v1/dairy/intake/certify` | `403 Forbidden` | Verify separation of duties (bank cannot forge chemistry) |
| **AUTH-TEST-10** | Any User | Open Redirect via `?next=` | `/sign-in?next=https://evil.com` | Redirected to `/dashboard` | Verify SSRF and open redirect mitigation |

---

## 3. Automated Pytest Implementation Outline

```python
# backend/tests/test_authorization_boundaries.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_farmer_cannot_access_bank_ledger(client: AsyncClient, farmer_auth_headers: dict):
    response = await client.get("/api/v1/bank/ledger", headers=farmer_auth_headers)
    assert response.status_code == 403
    assert "permission" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_cross_tenant_batch_isolation(
    client: AsyncClient, 
    farmer_a_headers: dict, 
    farmer_b_batch_id: str
):
    response = await client.get(f"/api/v1/farmer/batches/{farmer_b_batch_id}", headers=farmer_a_headers)
    assert response.status_code in (403, 404)

@pytest.mark.asyncio
async def test_public_signup_rejects_admin_role(client: AsyncClient):
    payload = {
        "email": "hacker@evil.com",
        "password": "Password123!",
        "role": "ADMIN",
        "full_name": "Fake Admin"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "ADMIN" not in response.text
```
