# ZaminFlow STRIDE Threat Model & Security Architecture

**Document ID:** `DOC-SEC-001`  
**Methodology:** Microsoft STRIDE Threat Modeling  
**Target:** Production Release v2.0  
**Security Architect:** Combined ARB Review  

---

## 1. Assets, Threat Actors & Trust Boundaries

### 1.1 Critical Assets
1. **Financial Escrow & Factoring Funds:** Escrow balances held in commercial bank accounts.
2. **Quality Titration Data:** Acidity, fat, and SNF test results determining milk price payouts.
3. **User PII & Authentication Credentials:** Password hashes, SMS OTP tokens, phone numbers, passport scans, STIR/TIN.
4. **Platform Integrity:** Admin verification decisions, dispute arbitration, and rating scores.

### 1.2 Threat Actors
- **Rogue / Competitor Farmer:** Attempts to spoof QR tokens, fake titration, or falsify tank volume.
- **Compromised Driver:** Transports unchilled milk, alters GPS logs, or falsifies pickup times.
- **Dishonest Dairy Plant Receiver:** Fabricates high acidity or low fat test results to artificially depress payouts.
- **External Attacker:** Credential stuffing, brute-force OTP attacks, DDoS, or man-in-the-middle attacks.
- **Malicious Insider / Rogue Admin:** Unauthorized escrow releases or falsified KYB approvals.

---

## 2. STRIDE Analysis & Defenses

| Threat Category | Potential Attack Scenario | Platform Vulnerability / Asset | Implemented Defense & Architecture Control |
| :--- | :--- | :--- | :--- |
| **Spoofing Identity** | Attacker impersonates an Admin by submitting `role=ADMIN` on public sign-up. | Public registration endpoint (`/api/v1/auth/sign-up`) | **QA-001 Fix:** Server-side validation strictly enforces role whitelist (`FARMER`, `INDUSTRY`, `DRIVER`). Admin creation requires cryptographic email invite token. |
| **Spoofing Identity** | Attacker intercepts driver QR token to steal milk batch during pickup. | Delivery batch QR token | Cryptographic single-use token tied to signed digital supply contract; verified within 30-minute expiry window. |
| **Tampering with Data** | Attacker intercepts `/api/v1/batches/{id}/lab-verify` and alters fat % to inflate payout. | Titration entry endpoint | Endpoint restricted to `INDUSTRY (LAB_TECH)` role; values locked to physical sample vial code; immutable double-entry ledger posting. |
| **Tampering with Data** | Driver modifies device system clock to forge timely pickup before milk spoilage. | Batch pickup timestamp | Server-generated `TIMESTAMPTZ DEFAULT NOW()` recorded at backend receipt; client timestamps ignored. |
| **Repudiation** | Dairy claims it never authorized an escrow lock for a farmer contract. | Supply contract agreement | Both parties must digitally sign contract with timestamped audit log before bank lock is accepted. |
| **Information Disclosure** | Rogue farmer queries `/api/v1/batches` and views other farmers' prices and bank accounts. | Batch listing endpoint (IDOR risk) | Multi-tenant scoping: queries strictly filter by `organization_id = current_user.organization_id`. |
| **Information Disclosure** | Attacker steals JWT access token from `localStorage` via XSS. | Client-side token storage | **FND-SEC-001:** Migrating to `HttpOnly; Secure; SameSite=Strict` cookies with anti-CSRF token verification. |
| **Denial of Service** | Attacker spams `/api/v1/auth/sms/send-otp` to exhaust platform SMS budget. | SMS gateway integration | Strict rate limiting: maximum 3 OTP requests per phone number per 15 minutes; IP throttling on ingress. |
| **Elevation of Privilege** | Driver attempts to call `/api/v1/admin/kyb/queue` to approve own vehicle KYB. | Admin verification queue | Fastify RBAC dependency `require_role(["ADMIN"])` rejects unauthorized sub-roles with HTTP 403 Forbidden. |

---

## 3. Defense-in-Depth Summary
1. **Network Boundary:** Caddy reverse proxy with HSTS, TLS 1.3, and gzip/zstd encoding.
2. **Application Boundary:** Input validation via Pydantic v2 schemas; strict typed route guards.
3. **Database Boundary:** Foreign key cascades, check constraints on enum states, and immutable ledger triggers.
