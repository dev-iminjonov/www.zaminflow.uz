# ZaminFlow Frontend Role Architecture

**Document ID:** `DOC-ARCH-FE-001`  
**Classification:** Frontend Architecture & Routing Specification  
**Status:** Approved  

---

## 1. Directory Structure & Role-Based Route Organization

The Next.js App Router enforces clean separation of concerns by scoping each role to its dedicated layout hierarchy.

```
frontend/src/app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── (public)/
│   ├── page.tsx          # Landing page
│   ├── contact/
│   └── about/
├── dashboard/
│   ├── layout.tsx        # Common shell (Auth guard, responsive shell)
│   ├── farmer/
│   │   ├── layout.tsx    # Mobile bottom-nav shell
│   │   ├── page.tsx      # Farmer Home & KPIs
│   │   ├── supply/       # List daily milk supply
│   │   ├── batches/      # Batch history & titration
│   │   └── payouts/      # Escrow payout ledger
│   ├── dairy/
│   │   ├── layout.tsx    # Desktop sidebar shell
│   │   ├── page.tsx      # Plant intake & capacity overview
│   │   ├── catalog/      # Farm supply catalog & filter
│   │   ├── contracts/    # Bilateral contract management
│   │   ├── fleet/        # GIS fleet tracking map
│   │   ├── intake/       # Lab titration certification
│   │   └── finance/      # Escrow reserves & 1C export
│   ├── driver/
│   │   ├── layout.tsx    # High-contrast mobile PWA shell
│   │   ├── page.tsx      # Route stop list & navigation
│   │   ├── pickup/       # QR scan & dual signature
│   │   └── telemetry/    # Cold-chain sensor status
│   ├── bank/
│   │   ├── layout.tsx    # High-security financial workstation shell
│   │   ├── page.tsx      # Escrow vault & collateral liquidity
│   │   ├── ledger/       # Immutable journal viewer
│   │   └── clearing/     # ISO 20022 clearing export
│   └── admin/
│       ├── layout.tsx    # Operations console shell
│       ├── page.tsx      # Platform overview & metrics
│       ├── kyb/          # Organization approval queue
│       ├── disputes/     # Titration arbitration dockets
│       └── audit/        # Security audit trail viewer
```

---

## 2. Hardened Server-Side Middleware (`middleware.ts`)

The existing insecure fallback to plain cookies (`zaminflow_role`) is eliminated.

### Rules Enforced by Middleware:
1. **JWT Verification:** Extracts token from `zaminflow_token` HttpOnly cookie or `Authorization` header. Decodes payload and checks expiry (`exp`).
2. **Role Path Alignment:**
   - If user visits `/dashboard/farmer/*` and `jwt.role !== 'FARMER'` and `jwt.role !== 'ADMIN'`:
     $\to$ Redirects to appropriate user role dashboard or returns HTTP 403.
   - If user visits `/dashboard/dairy/*` and `jwt.role !== 'INDUSTRY'` and `jwt.role !== 'ADMIN'`:
     $\to$ Redirects.
   - If user visits `/dashboard/bank/*` and `jwt.role !== 'BANK'` and `jwt.role !== 'ADMIN'`:
     $\to$ Redirects.
   - If user visits `/dashboard/admin/*` and `jwt.role !== 'ADMIN'`:
     $\to$ Redirects to home.
3. **Safe Return URL Handling (`?next=`):**
   - Strictly sanitizes `?next=` query parameter.
   - Disallows open redirects to external protocols (`http:`, `https:`, `//`, `javascript:`).
   - Only permits relative paths starting with `/dashboard/`.

---

## 3. Data Fetching Strategy: Zero Mock Data

The legacy `USE_MOCK_DATA = true` flag in `roleDashboardService.ts` is permanently removed.
- **Server Components:** Fetch initial dashboard state via authenticated server-side calls (`fetch(API_URL, { cache: 'no-store', headers: { Cookie: ... } })`).
- **Client React Query Hooks:** Manage optimistic updates, polling, and mutations.
- **Error Boundaries:** Each role route includes an `error.tsx` boundary displaying localized error messages and retry mechanisms.
- **Skeleton Loaders:** Every route includes a role-tailored `loading.tsx` shimmer skeleton.
