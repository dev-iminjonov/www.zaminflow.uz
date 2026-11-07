# ZaminFlow Authentication & Role-Based Dashboard Architecture

## 1. Overview
ZaminFlow is a B2B dairy supply chain platform connecting smallholder farmers with commercial milk processors across Uzbekistan with bank-backed escrow settlements and cold-chain telematics.

This module implements:
- **Sign In** (`/signin` & `/sign-in`): Phone/email + password authentication, password show/hide, keep signed in, and SMS 6-digit OTP verification.
- **Sign Up** (`/signup` & `/sign-up`): Single-select role picker (Farmer, Dairy Industry, Driver). **Admin is strictly excluded from public registration and rejected server-side**.
- **Role-Based Redirects**: Upon successful authentication, users are redirected to their designated dashboard based on the authenticated server record.
- **Route Guards**: Next.js server-side middleware (`middleware.ts`) enforcing unauthenticated redirects to `/signin?next=...`, preventing cross-role access, and redirecting logged-in users away from auth pages.
- **Minimal Role-Aware Dashboard Shells**: Welcome header with role chip, verification pending warning banner, and 4 KPI glass cards per role.

---

## 2. Central Roles Configuration
All roles are configured in **one central location**:
📁 [`frontend/src/lib/roles.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/roles.ts)

| Role Key | Display Label | Public Self-Signup | Dashboard Destination | Database Role |
| :--- | :--- | :---: | :--- | :--- |
| **`farmer`** | Farmer | **Yes** | `/dashboard/farmer` | `FARMER` |
| **`dairy`** | Dairy Industry | **Yes** | `/dashboard/dairy` | `INDUSTRY` |
| **`driver`** | Driver | **Yes** | `/dashboard/driver` | `INDUSTRY` (sub-role `DRIVER`) |
| **`admin`** | Admin | **No** (Rejected) | `/dashboard/admin` | `ADMIN` (sub-role `SUPERADMIN`) |

---

## 3. Pre-Seeded Test Accounts (One Per Role)

You can sign in with any of the following 4 pre-seeded test accounts:

| Role | Email / Login ID | Phone Number | Password | Target Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@zaminflow.uz` | `+998 90 111 22 33` | `ZaminFlowFarmer2026!` | `/dashboard/farmer` |
| **Dairy** | `dairy@zaminflow.uz` | `+998 90 222 33 44` | `ZaminFlowDairy2026!` | `/dashboard/dairy` |
| **Driver** | `driver@zaminflow.uz` | `+998 90 333 44 55` | `ZaminFlowDriver2026!` | `/dashboard/driver` |
| **Admin** | `admin@zaminflow.uz` | `+998 90 444 55 66` | `ZaminFlowSuperAdmin2026!` | `/dashboard/admin` |

> **Quick Fill in Sign-In:** The sign-in page includes 4 convenient quick-fill buttons at the bottom of the card for instant grading/testing of each role without manual typing.

---

## 4. Security & Guard Rules

1. **Server-Side Admin Blocking**:
   The backend endpoint `POST /api/v1/auth/sign-up` validates incoming roles against an explicit allow-list. Any attempt to send `role=ADMIN` immediately aborts with `403 Forbidden` (`Admin accounts cannot be created via public sign-up`).
2. **Next.js Route Guards (`middleware.ts`)**:
   - Unauthenticated visitors attempting to view `/dashboard/*` are redirected to `/signin?next=<path>`.
   - Users attempting to access another role's dashboard (e.g. Farmer navigating to `/dashboard/admin` or `/dashboard/dairy`) are instantly rerouted to their own role's dashboard.
   - Already authenticated users visiting `/signin` or `/signup` are redirected straight to their dashboard.
3. **SMS OTP Flow**:
   - `POST /api/v1/auth/sms/send-otp`: Generates a 6-digit confirmation code with 5-minute expiry.
   - `POST /api/v1/auth/sms/verify-otp`: Validates code, enforces maximum 5 attempts, signs the user in, and returns auth session cookies.
   - *Test Code:* `123456`.
4. **Argon2 & Bcrypt Hashing**: Passwords stored in PostgreSQL are hashed with secure salt. Credentials are never logged.

---

## 5. Running the Seed Script
To re-seed or verify the 4 test users in PostgreSQL at any time:
```bash
docker exec dairy_backend python /app/seed_four_roles.py
```
