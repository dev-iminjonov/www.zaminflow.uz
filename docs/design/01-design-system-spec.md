# ZaminFlow Design System Specification: Tokens, Primitives & Components

**Document ID:** `DOC-DSGN-002`  
**Status:** Unified Production Standard  

---

## 1. Design Tokens Specification

### 1.1 Color Tokens
```css
:root {
  /* Brand Green Spectrum */
  --color-brand-primary: #00C853;       /* Vibrant interactive primary */
  --color-brand-accessible: #087a3c;    /* Accessible text on white/mint (4.5:1 WCAG AA) */
  --color-brand-dark-text: #22d36b;     /* Accessible text on dark backgrounds */
  --color-brand-mint-surface: #E8F5E9;  /* Mint badge/card background */

  /* Deep Slate & Navy Spectrum */
  --color-navy-dark: #102A38;           /* Primary button, deep footer */
  --color-forest-dark: #1A362D;         /* High-contrast dark typography */
  --color-bg-dark-primary: #0A1926;     /* Dark mode root background */
  --color-bg-dark-card: #13293D;        /* Dark mode card container */

  /* Status Colors */
  --color-status-success: #00C853;      /* Delivered, Settled, Escrow Released */
  --color-status-warning: #F59E0B;      /* Pending titration, in-transit warning */
  --color-status-danger: #EF4444;       /* Temperature breach, dispute frozen, rejection */
  --color-status-info: #1B98E0;         /* Escrow locked, factoring active */
}
```

---

## 2. Component Primitives & Standard States

### 2.1 Interactive Buttons
- **Touch Target:** Minimum $\ge 44 \times 44\text{px}$ (`min-w-[44px] min-h-[44px]`).
- **States:**
  - `Default`: High contrast background with smooth rounded corners (`rounded-full` or `rounded-xl`).
  - `Hover`: Subtle elevation scale (`scale-[1.02]`) and brightness shift.
  - `Active`: Slight press depression (`scale-95`).
  - `Disabled`: `opacity-50 cursor-not-allowed pointer-events-none`.
  - `Loading`: Centered SVG spinner, label hidden with `aria-live="polite"`.

### 2.2 Status Pills & Badges (`StatusPill.tsx`)
- Standardized across all 4 dashboards:
  - `Cold-Chain Safe`: Mint background `#E8F5E9`, green dot, text `#087a3c`.
  - `In-Transit`: Soft blue background `#E0F2FE`, blue dot, text `#0369A1`.
  - `Dispute Frozen`: Rose background `#FFE4E6`, red dot, text `#BE123C`.

### 2.3 Data KPI Cards
- Standard layout:
  1. Top Row: Metric Title (muted slate) + Category Icon / Status Pill.
  2. Middle Row: Value Numeral (`text-3xl font-extrabold`) + Unit (`UZS`, `L`, `°C`, `%`).
  3. Bottom Row: Comparative Trend Indicator (`+4.2% vs yesterday`) with green/red arrow.
