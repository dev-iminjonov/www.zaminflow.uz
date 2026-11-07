# ADR-004: PostGIS Cold-Chain Telemetry Modeling & Retention Policy

## Status
Proposed (Awaiting Approval Gate / FND-GIS-001)

## Context
During milk tanker transit, drivers' devices transmit GPS breadcrumbs and milk temperature readings. With 150 drivers sending updates every 30 seconds across 6-hour shifts, the platform generates $\sim 108,000$ points daily ($>3.2\text{M}$ rows monthly). Storing infinite unpartitioned geospatial coordinates in PostgreSQL will degrade index performance and bloat backup snapshots.

## Decision Drivers
- High query performance for active trip tracking and geofence entry detection.
- Fast map rendering on desktop and mobile browsers.
- Sustainable database storage and backup volume sizes.

## Options Considered
1. **Unpartitioned Single Table:** Store all coordinates in a single `delivery_telemetry` table indefinitely. (Rejected: table exceeds 10M rows within 3 months, degrading index scans).
2. **Monthly Table Partitioning + 90-Day Retention Pruning (Recommended):** Partition telemetry table by month using PostgreSQL declarative partitioning. Maintain raw 30-second coordinates for 90 days (sufficient for any quality disputes), then downsample to 5-minute waypoints or archive to cold storage.
3. **Dedicated TimescaleDB or InfluxDB Cluster:** Introduce a separate time-series database. (Rejected: unnecessary operational complexity for early stage).

## Recommendation
Adopt **Option 2**. PostgreSQL 16 + PostGIS 3.4 handles monthly partitioned spatial tables natively with GIST indexing.

## Consequences
- **Positive:**
  - Fast query execution for active shipments.
  - Drop-partition operations allow instant zero-overhead deletion of expired data without WAL churn.
- **Negative:**
  - Requires scheduled partition creation and cleanup cron jobs.
