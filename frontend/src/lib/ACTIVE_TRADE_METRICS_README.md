# Active Trade Metrics (Live statistics) — Integration Guide

## 1. Overview
The **Active Trade Metrics** component is an accessible, real-time telemetry dashboard designed for ZaminFlow's B2B dairy supply platform in Uzbekistan. It faithfully implements the exact visual design reference from `Main.dc.html`, adhering to all design tokens, typography, glassmorphism cards, and responsive layouts.

## 2. File Architecture
* **Data Layer**: [`frontend/src/lib/activeTradeMetricsData.ts`](./activeTradeMetricsData.ts)
* **Component**: [`frontend/src/components/ActiveTradeMetrics.tsx`](../components/ActiveTradeMetrics.tsx)
* **Routes**:
  * Landing page anchor section: `#stats` on [`frontend/src/app/page.tsx`](../app/page.tsx)
  * Dedicated standalone route: [`frontend/src/app/stats/page.tsx`](../app/stats/page.tsx)

## 3. How to Connect the Real API
Connecting to the production backend requires modifying **only a single configuration flag** in [`activeTradeMetricsData.ts`](./activeTradeMetricsData.ts):

```typescript
// frontend/src/lib/activeTradeMetricsData.ts

// Step 1: Switch this flag to false
export const USE_MOCK_DATA = false;
```

### Backend Contract
The frontend expects an endpoint at:
```http
GET /api/v1/metrics/active-trade?range={Today|7D|30D|12M}&region={all|andijan|samarqand|fergana|namangan|qashqadaryo|tashkent|syrdarya}
```

Returning JSON payload matching `ActiveTradeMetricsPayload`:
```json
{
  "kpis": {
    "avgPrice": { "value": 4380, "unit": "UZS / L", "delta": "+12.4%" },
    "volumeToday": { "value": 186400, "unit": "L", "delta": "+3.8%" },
    "activeShipments": { "value": 47, "unit": "trucks", "delta": "+3.2°C cold" },
    "securedEscrow": { "value": 48500000, "unit": "UZS" }
  },
  "priceSeries": {
    "title": "Average farm-gate price, last 30 days",
    "low": 3890,
    "high": 4420,
    "latestPrice": 4380,
    "points": [
      { "date": "Oct 8", "price": 3920, "x": 44, "y": 160 },
      ...
    ],
    "xAxisLabels": { "start": "Oct 8", "middle": "Oct 23", "end": "Nov 7" },
    "trendSummary": "Line chart: average milk price rising from about 3,890 to 4,380 UZS per litre over 30 days"
  },
  "gradeDistribution": [
    { "grade": "Grade A+", "percentage": 46 },
    { "grade": "Grade A", "percentage": 31 },
    { "grade": "Grade B", "percentage": 17 },
    { "grade": "Grade C", "percentage": 6 }
  ],
  "regionPrices": [
    { "region": "Andijan", "price": 4420, "barWidthPct": 100 },
    { "region": "Samarqand", "price": 4350, "barWidthPct": 95 },
    ...
  ],
  "shipments": [
    {
      "id": "sh-1",
      "route": "Sayxunobod → Tashkent",
      "batchId": "ZF-0412",
      "telemetryStatus": "GPS locked",
      "temperature": 3.2,
      "eta": "28 min ETA",
      "status": "in_transit",
      "statusText": "● In transit"
    },
    ...
  ],
  "lastUpdated": 1794037200000
}
```

## 4. Features & Behaviors
1. **Silent Polling**: Queries silently every 12 seconds with zero visual "updated" noise. Automatically pauses when tab is hidden and resumes immediately when focused.
2. **Smooth Number Count-up**: JetBrains Mono figures count up smoothly on first load and on filter changes. Respects `prefers-reduced-motion`.
3. **Interactive Hand-Rolled SVG Chart**: Line + gradient area chart with hover/touch/keyboard tooltip, crosshairs, and dynamic trend badge.
4. **States**:
   - Animated skeleton loading states on initial fetch.
   - Per-card error state with a dedicated `Retry` trigger.
   - Empty state for unpopulated regions (e.g. `Surxondaryo`).
   - "Data delayed" top alert banner if telemetry exceeds 60 seconds without update.
5. **Accessibility**:
   - Single semantic `<h1>`.
   - Accessible `<select>` and segmented `<button>` radios with `aria-checked`.
   - Hidden `aria-live="polite"` region notifying assistive technology of filter updates.
