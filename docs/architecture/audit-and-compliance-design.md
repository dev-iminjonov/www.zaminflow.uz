# ZaminFlow Audit & Compliance Architecture

**Document ID:** `DOC-ARCH-AUD-001`  
**Classification:** Security & Regulatory Compliance Specification  
**Status:** Approved  
**Legal References:** Republic of Uzbekistan Law No. ZRU-547 ("On Personal Data"), Law No. ZRU-611 ("On Payments and Payment Systems"), Central Bank of Uzbekistan (CBU) Escrow Guidelines.

---

## 1. Compliance Architecture Overview

ZaminFlow operates at the intersection of commercial agriculture, food safety, and regulated banking. To ensure legal enforceability and prevent fraud:
1. **Financial Immutability:** Double-entry escrow ledger records are append-only. Updates and deletions are blocked by PostgreSQL database triggers.
2. **Audit Logging:** Every authentication, authorization failure, state transition, and dispute verdict is logged with cryptographic hashes.
3. **Data Residency:** All database storage and user identity records reside within data centers located inside the Republic of Uzbekistan.

---

## 2. Immutable Financial Ledger Model (`financial_ledger`)

The core financial table guarantees that money movements are balanced and tamper-evident:

```sql
CREATE TABLE financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(64) UNIQUE NOT NULL,
    transaction_type VARCHAR(32) NOT NULL, -- ESCROW_LOCKED, ESCROW_RELEASED, DISPUTE_FROZEN, REFUNDED
    contract_id UUID REFERENCES supply_contracts(id),
    batch_id UUID REFERENCES delivery_batches(id),
    debit_account VARCHAR(64) NOT NULL,
    credit_account VARCHAR(64) NOT NULL,
    amount_uzs NUMERIC(15, 2) NOT NULL CHECK (amount_uzs > 0),
    currency VARCHAR(3) DEFAULT 'UZS',
    verification_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

### Append-Only Database Trigger
```sql
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Violation: financial_ledger is append-only. Modification or deletion prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_financial_ledger
BEFORE UPDATE OR DELETE ON financial_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();
```

---

## 3. Security Audit Logging (`audit_logs`)

All administrative actions and security events are captured in `audit_logs`:

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary key |
| `timestamp` | `TIMESTAMPTZ` | Microsecond timestamp |
| `user_id` | `UUID` | Acting user ID (nullable for anonymous attempts) |
| `organization_id` | `UUID` | Tenant organization |
| `action` | `VARCHAR(64)` | Event type (e.g. `AUTH_FAILED`, `TITRATION_CERTIFIED`, `DISPUTE_ARBITRATED`) |
| `resource_type` | `VARCHAR(32)` | Entity affected (`batch`, `contract`, `escrow`) |
| `resource_id` | `VARCHAR(64)` | Entity primary key |
| `ip_address` | `INET` | Client IP address from Caddy reverse proxy (`X-Forwarded-For`) |
| `user_agent` | `TEXT` | Browser / device user-agent string |
| `details` | `JSONB` | Before/after state snapshot and payload parameters |

---

## 4. Central Bank ISO 20022 Export Integration

For commercial bank clearing, the platform formats settled transactions into ISO 20022 `pacs.008.001.08` (Financial Institutional Customer Credit Transfer) XML structures:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>ZF-CLR-20261108-0042</MsgId>
      <CreDtTm>2026-11-08T15:30:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>TX-ESC-20261108-0041</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="UZS">25542000.00</IntrBkSttlmAmt>
      <Dbtr>
        <Nm>Tashkent Milk Industry MChJ</Nm>
      </Dbtr>
      <Cdtr>
        <Nm>Chashma Baraka Fermer Xo'jaligi</Nm>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
```
