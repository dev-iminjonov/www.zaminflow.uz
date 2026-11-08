# ZaminFlow Product & Operational Metrics Framework

**Document ID:** `DOC-MET-OPR-001`  
**Purpose:** Define quantifiable measurement standards across platform adoption, operational velocity, system performance, and financial reliability.

---

## 1. North Star Metric

> **Volume of Quality-Certified Milk Settled Through Escrow (Liters / Month)**  
> *Target for Year 1:* 15,000,000 Liters / Month  
> *Why:* Reflects real economic activity, farmer participation, buyer satisfaction, and banking trust in one unified metric.

---

## 2. Role-Specific Operational Metrics

### Farmer Role
| Metric | Definition | Baseline (Current) | Launch Target |
|---|---|---|---|
| **Supply Listing Time** | Time to complete daily supply submission | Unmeasured (Mock) | $< 45\text{ seconds}$ |
| **Payout Visibility Latency** | Time from plant intake certification to payout SMS | N/A | $< 5\text{ minutes}$ |
| **Price Transparency Ratio** | % of farmers who check daily quality-adjusted price | N/A | $> 80\%$ daily active |
| **Dispute Rate** | % of batches where titration result is disputed | N/A | $< 1.5\%$ of deliveries |

### Buyer (Dairy Industry) Role
| Metric | Definition | Baseline (Current) | Launch Target |
|---|---|---|---|
| **Intake Processing Time** | Time from tanker arrival at bay to lab settlement entry | Unmeasured | $< 25\text{ minutes}$ |
| **Escrow Fulfillment Rate** | % of active contracts fully pre-funded in escrow | N/A | $100\%$ (Zero unfunded contracts) |
| **Cold-Chain Breach Rate** | % of incoming tankers with temperature excursions (> 4.5°C) | N/A | $< 0.8\%$ of total volume |
| **Procurement Cycle Time** | Time to negotiate and sign bilateral supply agreement | 14 days (manual) | $< 24\text{ hours}$ |

### Driver Role
| Metric | Definition | Baseline (Current) | Launch Target |
|---|---|---|---|
| **Pickup Handover Velocity** | Time spent at farm gate scanning QR and verifying volume | N/A | $< 4\text{ minutes}$ per stop |
| **Offline Sync Success Rate** | % of offline-captured waypoints synced without data loss | N/A | $100\%$ |
| **Route On-Time Compliance** | % of collection circuits completed before 08:30 AM | N/A | $> 95\%$ |

### Bank Role
| Metric | Definition | Baseline (Current) | Launch Target |
|---|---|---|---|
| **Escrow Reconciliation Discrepancy**| Unreconciled difference between platform ledger and bank core | 0 UZS | 0 UZS (Zero tolerance) |
| **Clearing Generation Time** | Time to generate ISO 20022 XML daily batch | N/A | $< 2\text{ seconds}$ |
| **Factoring Default Rate** | % of non-performing invoice advances (Phase 2) | N/A | $< 0.5\%$ |

### Admin Role
| Metric | Definition | Baseline (Current) | Launch Target |
|---|---|---|---|
| **KYB Verification Turnaround** | Time from document upload to admin verification | N/A | $< 12\text{ hours}$ |
| **Dispute Resolution Time** | Average time to arbitrate a titration dispute docket | N/A | $< 48\text{ hours}$ |

---

## 3. Technical & Performance SLAs

- **API P95 Latency:**
  - Read endpoints (`GET /api/v1/...`): $< 250\text{ ms}$ on 3G mobile networks.
  - Write endpoints (`POST /api/v1/...`): $< 450\text{ ms}$.
- **Core Web Vitals on Budget Mobile Profile (Moto G Power, 4G Slow / 3G Fast):**
  - Largest Contentful Paint (LCP): $< 2.2\text{ s}$
  - First Input Delay / INP: $< 100\text{ ms}$
  - Cumulative Layout Shift (CLS): $< 0.05$
- **System Availability:**
  - $99.9\%$ uptime for collection hours (04:00 AM – 11:00 AM and 16:00 PM – 21:00 PM UZT).
