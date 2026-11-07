# ZaminFlow V3.0 — Architectural Decisions & Design Deviations Log

This document records the architectural resolutions, explicit design decisions, and system deviations implemented in **ZaminFlow V3.0** (Next.js 15 App Router, TypeScript, Tailwind CSS, Modular Monolith Backend) in accordance with the *ZaminFlow — AI Design Agent Master Prompt (UI/UX + Front-End Build)* and *Technical Specification & Task Book (SRS v3.0)*.

---

## 1. Zero Telegram Mini App (TMA) Architecture & Web-Only Field Consoles

- **Reference**: Section 1 & Section 10 (*Farmer & Driver Field Consoles*)
- **Context**: Previous iterations (v1.0 & v2.0) mixed Telegram Mini App SDKs (`@twa-dev/sdk`, `window.Telegram.WebApp`, `initData`) directly inside the Next.js frontend repository.
- **Resolution**:
  - 100% of Telegram-specific packages, hooks, and routes were removed from this codebase.
  - Farmer and Driver workflows were re-architected as **dedicated, mobile-first Web Field Consoles** under `frontend/src/app/(field)/farmer/*` and `frontend/src/app/(field)/driver/*`.
  - Field consoles use standard web geolocation APIs, HTML5 camera streams (`MediaDevices.getUserMedia`), and responsive touch targets (minimum 44px to 56px).
  - A separate standalone TMA repository was provisioned externally for dedicated Telegram deployment in the future.

---

## 2. Strict Decimal & Financial Precision (NUMERIC(19,4) & Tabular Numerals)

- **Reference**: Section 2 & Section 6 (*Financial Data Integrity*)
- **Context**: Standard floating point arithmetic (`number`) causes rounding errors when calculating Fat/SNF bonuses, factoring discount deductions, and escrow distributions.
- **Resolution**:
  - All financial amounts in Uzbek Som (UZS), milk volumes in Liters (L), chemical metrics (Fat %, SNF %, Acidity °T), and transaction hashes are rendered using `font-mono tabular-nums`.
  - All dynamic pricing logic strictly reproduces the specification benchmark:
    $$\text{Volume: } 1,000\text{ L}, \quad \text{Base Price: } 4,000\text{ UZS/L}, \quad \text{Fat: } 4.00\% \ (\alpha = 0.15), \quad \text{SNF: } 8.70\% \ (\beta = 0.10)$$
    $$\text{Multiplier} = 1 + 0.15 \times (4.00 - 3.60) + 0.10 \times (8.70 - 8.50) = 1 + 0.06 + 0.02 = 1.0800\text{x}$$
    $$\text{Unit Price} = 4,000 \times 1.0800 = 4,320.00\text{ UZS/L}$$
    $$\text{Total Payout} = 1,000 \times 4,320.00 = 4,320,000.00\text{ UZS}$$
  - The double-entry general ledger enforces the invariant $\sum \text{Debits} \equiv \sum \text{Credits}$ with zero discrepancy.

---

## 3. WCAG AA Contrast Compliance & Color Token Tuning

- **Reference**: Section 4 (*Global Design Tokens & Palette*)
- **Context**: The brand green `#059669` achieves an approximately 4.2:1 contrast ratio against pure white (`#FFFFFF`), slightly below the WCAG AA requirement of 4.5:1 for normal body text and primary buttons.
- **Resolution**:
  - Primary button fills and essential text links were standardized to **Deep Forest Emerald (`#047857`)**, which achieves a compliant **5.5:1** contrast ratio against white surfaces.
  - `#059669` and `#10B981` are reserved for non-text fills, icons, status badge backgrounds (`bg-emerald-50`), focus rings, and cinematic glows (`shadow-glowEmerald`).

---

## 4. Elimination of Generic AI Placeholders & Mock Tractions

- **Reference**: Section 2 (*Truthfulness & Real-World Domain Fidelity*)
- **Context**: Generic templates often display placeholder marketing metrics like "4.82M Liters Traded" or lorem ipsum text, degrading enterprise trust.
- **Resolution**:
  - The public landing page maintains a strict **visible word count budget ($\le 120$ words)**, focusing on the core value proposition:
    *"Bank escrow and cold-chain infrastructure for raw milk trading across Uzbekistan. Pre-funded factory escrows, PostGIS route matching, and instantaneous quality-adjusted settlements."*
  - All test data across portals represent realistic, geographically consistent Uzbek agricultural clusters:
    - **Farms**: Baraka Dairy Farm LLC (Sayxunobod, Sirdaryo), Chinoz Golden Meadow Cooperative.
    - **Processors**: Toshkent Dairy JSC (Zangiota), Chirchiq Agro Processing LLC.
    - **Partner Banks**: Ipoteka-Bank JSCIB, Agrobank JSCB.

---

## 5. Unified Next.js 15 Route Group Hierarchy & Shell Separation

- **Reference**: Section 7 (*Route Inventory & Layout Architecture*)
- **Context**: Different platform stakeholders have vastly differing viewport and interaction requirements.
- **Resolution**:
  - `src/app/(portal)/*`: Desktop-first 216px navy sidebar layout (`#0F172A`), 56px top header with real-time workspace context, notifications bell, and date display. Used for Industry, Bank, and Super-Admin portals.
  - `src/app/(field)/*`: Mobile & tablet-first centered column (max 560px on `#F1F5F9` canvas) with a 64px bottom tab navigation bar for one-thumb field operation. Used for Farmer, Driver, and Gate-Scanner terminals.
  - `src/app/(public)/*` & Auth: Cinematic midnight surface (`#070B14`), glassmorphism pill navigation, glowing dawn arc SVG, and split-screen 50/50 authentication forms.

---

## 6. Route Consolidation: Tablet Gate & Lab Terminal

- **Reference**: Section 11.6 (*Gate Reception & Lab Terminal*)
- **Context**: An earlier duplicate route existed at `src/app/(portal)/gate-scanner` which conflicted with Next.js route groups.
- **Resolution**:
  - The route was consolidated into `src/app/(field)/gate-scanner/page.tsx` as a high-density, touch-friendly tablet terminal.
  - Includes role-aware switching (Plant Owner full view, Gate Receiver weighbridge view, Lab Technician chemical titration view), automated density calculation ($\rho = 1.030\text{ kg/L}$), rapid antibiotic strip test interlock (0.0 ppb), tamper-evident reference sample chain-of-custody retention, and instant escrow release/dispute modal controls.

---

## 7. Suspense Boundaries for Next.js Prerendering

- **Reference**: Next.js 15 App Router Prerender Requirements
- **Context**: In Next.js 15, reading query parameters via `useSearchParams()` during static prerendering requires an explicit `<Suspense>` wrapper to prevent build-time de-optimization.
- **Resolution**:
  - All pages reading search parameters (`/sign-in`, `/driver/scan`, `/verify-email`, `/reset-password`, `/accept-invite`) were wrapped in top-level `<Suspense>` boundary components with fallback loaders.
