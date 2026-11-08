# ZaminFlow First 72 Hours Production Monitoring Runbook

**Document ID:** `DOC-OPS-003`  
**Squad Lead:** SRE & Performance Specialist  
**Status:** Approved Standard  
**Date:** 2026-11-08  

---

## 1. Key Metrics & Alert Thresholds (First 72 Hours)

| Metric | Target / Normal | Warning Threshold | Critical Alert (Pager) | Check Frequency |
|:---|:---:|:---:|:---:|:---:|
| **API Error Rate (5xx)** | $0\%$ | $> 0.5\%$ | $> 2.0\%$ | 1 minute |
| **HTTP 429 Rate Limits** | $< 10\text{/hr}$ | $> 50\text{/hr}$ (Potential brute force) | $> 200\text{/hr}$ | 5 minutes |
| **PostgreSQL Connection Count** | $< 15\text{ active}$ | $> 35\text{ active}$ | $> 60\text{ active}$ | 1 minute |
| **Public Stats Compute Interval** | Exactly $60\text{ s}$ | $> 120\text{ s}$ | Stale $> 300\text{ s}$ | 1 minute |
| **Disk Storage (Postgres Data)** | $< 30\%$ | $> 70\%$ | $> 85\%$ | 1 hour |
| **Morning Intake Spike (05:00-09:00)** | Latency $< 200\text{ ms}$ | Latency $> 500\text{ ms}$ | Latency $> 2000\text{ ms}$ | Continuous |

---

## 2. Morning Collection Peak Window Monitoring (05:00 – 09:00 Tashkent Time)

1. The critical period for milk logistics is the morning collection window (05:00 to 09:00 local time).
2. On-call engineer monitors:
   - Dairy gate titration submission latency.
   - Driver GPS telemetry ping rate.
   - Escrow lock/release database transactions.
3. Daily summary report dispatched to stakeholder Telegram channel at 10:00 Tashkent time.
