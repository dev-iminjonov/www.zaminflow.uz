# ZaminFlow Telemetry API Integration Guide

This guide explains how to swap the mock data provider for real live backend REST / WebSocket endpoints in the ZaminFlow role dashboards (`Farmer`, `Dairy Industry`, `Driver`, and `Admin`).

---

## 1. Quick Switch (Environment Variable)

The dashboard data layer is located in [`frontend/src/lib/roleDashboardService.ts`](file:///c:/Users/Muhammad%20Aziz/Downloads/www.zaminflow.uz/frontend/src/lib/roleDashboardService.ts).

To switch from mock data to live backend APIs, set the following environment variable in `frontend/.env.local` (or your deployment environment):

```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```

When set to `false`, the client fetch functions (`fetchFarmerDashboardData`, `fetchDairyDashboardData`, `fetchDriverDashboardData`, `fetchAdminDashboardData`) will automatically query the backend endpoints using the authenticated user's session credentials (`credentials: "include"`).

---

## 2. Expected Backend REST Endpoints

The service expects the following JSON endpoints on the FastAPI backend:

| Role | Endpoint | Method | Response Interface |
|:---|:---|:---:|:---|
| **Farmer** | `/api/v1/farmer/dashboard` | `GET` | `FarmerDashboardData` |
| **Dairy** | `/api/v1/dairy/dashboard` | `GET` | `DairyDashboardData` |
| **Driver** | `/api/v1/driver/dashboard` | `GET` | `DriverDashboardData` |
| **Admin** | `/api/v1/admin/dashboard` | `GET` | `AdminDashboardData` |

### Expected Schema Example: Farmer (`GET /api/v1/farmer/dashboard`)
```json
{
  "todayPrice": { "value": "4,380", "unit": "UZS / L", "delta": "+12.4%" },
  "suppliedThisMonth": { "value": "18,240", "unit": "L" },
  "nextPayout": { "value": "5,256,000", "unit": "UZS" },
  "qualityGrade": { "grade": "A+", "snf": "SNF 8.7%" },
  "recentDeliveries": [
    {
      "id": "del-1",
      "destination": "To Tashkent",
      "batch": "Batch ZF-0412",
      "volume": "1,200 L",
      "grade": "A+",
      "status": "● In transit",
      "statusType": "success"
    }
  ],
  "payouts": [
    {
      "id": "pay-1",
      "batch": "ZF-0412",
      "condition": "Releases after titration",
      "amount": "5,256,000"
    }
  ]
}
```

---

## 3. Real-Time Telemetry & Polling Behavior

1. **15-Second Polling**:
   - Each overview component (`FarmerOverview`, `DairyOverview`, `DriverOverview`, `AdminOverview`) polls its respective service function every 15 seconds.
   - Polling automatically pauses when the browser tab is hidden (`document.visibilityState === 'hidden'`) and immediately refreshes when the user refocuses the tab.

2. **Upgrading to WebSockets / SSE**:
   - For sub-second live GPS tanker tracking or instant lab titration results, replace the `setInterval` in `frontend/src/components/dashboard/` with a WebSocket or EventSource listener connecting to:
     ```typescript
     const ws = new WebSocket(`wss://${window.location.host}/api/v1/ws/telemetry`);
     ws.onmessage = (event) => setData(JSON.parse(event.data));
     ```

---

## 4. Local Test Accounts

`backend/seed_four_roles.py` creates four local test users. Set the corresponding
`SEED_FARMER_PASSWORD`, `SEED_DAIRY_PASSWORD`, `SEED_DRIVER_PASSWORD`, and
`SEED_ADMIN_PASSWORD` environment variables before running the script. The script
does not contain default passwords. Never seed these test users in production.
