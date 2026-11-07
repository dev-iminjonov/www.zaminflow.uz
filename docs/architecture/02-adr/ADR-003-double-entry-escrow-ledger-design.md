# ADR-003: Double-Entry Financial Ledger & Escrow Accounting

## Status
Accepted

## Context
Commercial milk supply contracts on ZaminFlow hold significant financial values (e.g. 5,000 to 20,000 liters daily at ~4,500 UZS/L = 22,500,000 to 90,000,000 UZS per shipment). The platform facilitates two payment modalities: Escrow Lock and Factoring Payout. Financial regulators and partner commercial banks require immutable auditing where money is never created or destroyed without paired balancing entries.

## Decision Drivers
- Zero tolerance for mathematical rounding errors, negative balances, or duplicate escrow payouts.
- Regulatory auditability for banking partners (Agrobank, Hamkorbank).
- Immediate reconciliation between declared volumes and titration-adjusted final payouts.

## Options Considered
1. **Mutable Account Balances:** Updating a single `balance` column on `organizations` or `users` table via `UPDATE organizations SET balance = balance + :amount`. (Rejected: prone to race conditions, lacks audit history, impossible to reconcile disputes).
2. **Double-Entry Append-Only Financial Ledger (Recommended):** An immutable `financial_ledger` table recording `debit_account`, `credit_account`, `amount_uzs`, `entry_type`, `contract_id`, `batch_id`, and `created_at`. Account balances are derived as the sum of debits minus credits.

## Decision
We enforce **Option 2 (Double-Entry Financial Ledger)**. Every financial action (Escrow Lock, Escrow Release, Factoring Payout, Factoring Fee, Dispute Split, Escrow Refund) must write an immutable row to `financial_ledger` within an atomic database transaction. Mutating or deleting ledger records is forbidden at the database constraint level.

## Consequences
- **Positive:**
  - Immutability guarantees complete auditability.
  - Reconciliation queries prove mathematical balance at any historical point in time.
- **Negative:**
  - Balance lookups require aggregate queries (mitigated by indexing on `contract_id` and cached summary snapshots).
- **Triggers for Re-evaluation:**
  - Transition to direct core-banking integration where the bank's internal ledger is the master and ZaminFlow acts solely as an instruction gateway.
