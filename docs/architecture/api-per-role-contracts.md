# ZaminFlow Role-Specific API Contracts

**Document ID:** `DOC-ARCH-API-001`  
**Classification:** Technical Interface Specification  
**Status:** Approved Specification  

---

## 1. Overview & Base Routing Structure

All API endpoints require authentication via Bearer token in the `Authorization` header or secure HttpOnly session cookie, with the exception of public authentication routes (`/api/v1/auth/login`).

- Base URL: `https://zaminflow.uz/api/v1`
- Standard Response Envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2026-11-08T10:15:30Z",
    "request_id": "req-89a1-0f2c"
  }
}
```

---

## 2. Farmer Role Endpoints (`/api/v1/farmer/...`)

### `GET /api/v1/farmer/dashboard-kpis`
- **Authorized Roles:** `FARMER`, `ADMIN`
- **Description:** Returns live farm-gate baseline price, today's active batch count, total milk liters delivered this month, and pending escrow payouts.
- **Tenancy:** Enforces `WHERE farmer_id = current_user.org_id`.
- **Response Schema:**
```json
{
  "today_base_price_uzs": 4850,
  "price_trend_delta": 50,
  "active_batches_count": 1,
  "month_volume_liters": 38400,
  "pending_payout_uzs": 18240000,
  "settled_payout_uzs": 167998000
}
```

### `POST /api/v1/farmer/batches`
- **Authorized Roles:** `FARMER`
- **Description:** Submits a daily available milk supply batch for collection.
- **Request Body:**
```json
{
  "volume_liters": 1500,
  "milking_session": "MORNING",
  "cooling_tank_temp_celsius": 3.4,
  "pickup_window_start": "06:00:00",
  "pickup_window_end": "08:30:00",
  "notes": "Grade A Holstein herd"
}
```

---

## 3. Buyer (Dairy Industry) Endpoints (`/api/v1/dairy/...`)

### `GET /api/v1/dairy/procurement-feed`
- **Authorized Roles:** `INDUSTRY`, `ADMIN`
- **Query Params:** `region`, `min_volume`, `min_fat`, `cooling_verified`
- **Description:** Paginated catalog of verified available milk batches across agricultural cooperatives.

### `POST /api/v1/dairy/contracts`
- **Authorized Roles:** `INDUSTRY`
- **Description:** Proposes a bilateral supply contract with quality-based formula tiers.
- **Request Body:**
```json
{
  "farmer_id": "org_farmer_091",
  "daily_target_liters": 5000,
  "start_date": "2026-12-01",
  "end_date": "2027-05-31",
  "base_price_uzs_per_liter": 4800,
  "base_fat_percent": 3.60,
  "fat_premium_per_tenth_uzs": 120,
  "fat_penalty_per_tenth_uzs": 150,
  "base_snf_percent": 8.50,
  "snf_premium_per_tenth_uzs": 100,
  "max_acidity_terner": 18.0
}
```

### `POST /api/v1/dairy/intake/certify`
- **Authorized Roles:** `INDUSTRY`
- **Description:** Logs certified laboratory titration and weighbridge volume, computes final settlement price, and triggers escrow release.
- **Request Body:**
```json
{
  "batch_id": "batch_zf_1049",
  "certified_gross_volume_liters": 4950,
  "measured_fat_percent": 3.95,
  "measured_snf_percent": 8.70,
  "measured_acidity_terner": 16.5,
  "antibiotic_test_passed": true,
  "density_kg_per_m3": 1028.5,
  "technician_cert_pin": "9821"
}
```

---

## 4. Driver Logistics Endpoints (`/api/v1/driver/...`)

### `GET /api/v1/driver/routes/today`
- **Authorized Roles:** `DRIVER`, `ADMIN`
- **Description:** Returns the assigned sequential milk collection circuit, stops, and batch manifests for today.

### `POST /api/v1/driver/pickup/confirm`
- **Authorized Roles:** `DRIVER`
- **Description:** Confirms custody transfer at the farm gate with dipstick volume, temperature, and signatures.
- **Request Body:**
```json
{
  "batch_id": "batch_zf_1049",
  "dipstick_volume_liters": 1200,
  "vat_discharge_temp_celsius": 3.4,
  "alcohol_test_passed": true,
  "farmer_signature_svg_data": "data:image/svg+xml;base64,...",
  "driver_signature_svg_data": "data:image/svg+xml;base64,...",
  "offline_recorded_timestamp": "2026-11-08T06:14:22Z"
}
```

### `POST /api/v1/driver/telemetry`
- **Authorized Roles:** `DRIVER`
- **Description:** Ingests GPS waypoint and tanker compartment temperature reading.
- **Request Body:**
```json
{
  "route_id": "route_sam_01",
  "latitude": 39.6542,
  "longitude": 66.9597,
  "speed_kmh": 62.4,
  "compartment_temp_celsius": 3.3,
  "recorded_at": "2026-11-08T07:22:00Z"
}
```

---

## 5. Bank & Escrow Endpoints (`/api/v1/bank/...`)

### `GET /api/v1/bank/dashboard-kpis`
- **Authorized Roles:** `BANK`, `ADMIN`
- **Description:** Returns aggregate platform escrow balances, active guarantees, daily released payouts, and frozen dispute values.

### `GET /api/v1/bank/ledger`
- **Authorized Roles:** `BANK`, `ADMIN`
- **Query Params:** `page`, `page_size`, `type`, `date_from`, `date_to`
- **Description:** Returns double-entry ledger entries with cryptographic validation checksums.

### `GET /api/v1/bank/ledger/export-csv` (and `/export-iso20022`)
- **Authorized Roles:** `BANK`, `ADMIN`
- **Description:** Generates structured ISO 20022 `pacs.008` XML clearing file or signed CSV journal.

---

## 6. Admin Endpoints (`/api/v1/admin/...`)

### `POST /api/v1/admin/organizations/{id}/verify`
- **Authorized Roles:** `ADMIN`
- **Description:** Approves or rejects organization onboarding following KYB review.

### `POST /api/v1/admin/disputes/{id}/arbitrate`
- **Authorized Roles:** `ADMIN`
- **Description:** Enforces binding titration settlement verdict, dividing frozen escrow reserves.
