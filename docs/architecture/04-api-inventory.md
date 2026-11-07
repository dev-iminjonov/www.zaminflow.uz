# ZaminFlow API Inventory & Contract Specification

**Document ID:** `DOC-API-001`  
**Base URL:** `/api/v1`  
**Total Endpoints:** 51  
**Protocol:** REST + WebSocket + Server-Sent Events (SSE)  

---

## 1. Authentication & Identity (`/auth`)
| Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/sign-up` | Public | Public registration for Farmer, Dairy, Driver. Admin rejected (403). |
| `POST` | `/api/v1/auth/sign-in` | Public | Authenticate via email/phone + password; issues JWT & session cookie. |
| `POST` | `/api/v1/auth/sms/send-otp` | Public | Request SMS verification code for mobile authentication. |
| `POST` | `/api/v1/auth/sms/verify-otp` | Public | Verify SMS code and authenticate farmer/driver. |
| `POST` | `/api/v1/auth/sign-out` | Authenticated | Revoke session and clear cookies. |
| `POST` | `/api/v1/auth/refresh` | Refresh Token | Rotate refresh token family and issue new access token. |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current user, organization, and KYB status. |
| `POST` | `/api/v1/auth/forgot-password`| Public | Dispatch password reset token to registered email. |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset password using valid single-use token. |
| `POST` | `/api/v1/auth/accept-invite` | Public | Accept organization member invitation with token. |

---

## 2. Administration & KYB Verification (`/admin`)
| Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/kyb/queue` | ADMIN | List pending organization verification requests. |
| `GET` | `/api/v1/admin/kyb/{org_id}` | ADMIN | Get complete KYB profile and uploaded documents. |
| `POST` | `/api/v1/admin/kyb/{org_id}/approve` | ADMIN | Approve organization KYB (transitions to `VERIFIED`). |
| `POST` | `/api/v1/admin/kyb/{org_id}/reject` | ADMIN | Reject organization KYB with mandatory reason note. |
| `POST` | `/api/v1/admin/kyb/{org_id}/suspend` | ADMIN | Suspend organization trading capabilities. |
| `POST` | `/api/v1/admin/invitations` | ADMIN | Generate secure invitation link for new admin or staff. |

---

## 3. Milk Supply Logistics & Cold Chain (`/batches`)
| Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/batches/generate-pickup-qr`| FARMER | Generate cryptographic QR token for tank pickup. |
| `POST` | `/api/v1/batches/pickup-handshake` | DRIVER | Scan farmer QR, verify temperature $\le 8^\circ\text{C}$, start transit. |
| `POST` | `/api/v1/batches/{id}/gate-arrival` | DRIVER | Log arrival at dairy intake gate. |
| `POST` | `/api/v1/batches/{id}/lab-verify` | DAIRY (LAB) | Enter titration (fat, SNF, acidity) and trigger settlement. |
| `GET` | `/api/v1/batches` | Authenticated | List batches scoped to user's organization. |

---

## 4. Escrow & Banking Ledger (`/bank`)
| Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/bank/dashboard-kpis` | BANK, ADMIN | Get total locked escrow, daily settlement, factoring totals. |
| `GET` | `/api/v1/bank/ledger` | BANK, ADMIN | Paginated double-entry financial ledger entries. |
| `GET` | `/api/v1/bank/ledger/export-csv` | BANK, ADMIN | Export financial transactions to CSV for bank audit. |
| `POST` | `/api/v1/bank/webhooks/confirm-lock`| Bank Webhook | External bank confirmation of escrow fund lock. |

---

## 5. Telemetry & Metrics (`/metrics`)
| Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/metrics/active-trade` | Public | Live telemetry KPIs, price series, regional averages. |
| `GET` | `/api/v1/metrics/stream` | Public | Server-Sent Events (SSE) stream for real-time tickers. |
| `WS` | `/api/v1/metrics/ws` | Public | 800ms heartbeat WebSocket for live trade volume updates. |
