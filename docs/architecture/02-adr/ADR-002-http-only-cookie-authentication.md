# ADR-002: Transition to HttpOnly Secure Cookie Authentication & Anti-CSRF

## Status
Proposed (Awaiting Approval Gate / FND-SEC-001)

## Context
Currently, client code in `frontend/src/lib/api.ts` stores JWT tokens in browser `localStorage` (`zaminflow_jwt`). This pattern leaves sessions vulnerable to Cross-Site Scripting (XSS) attacks: any script injected via an unescaped markdown renderer, third-party dependency, or client compromise can instantly read `localStorage` and exfiltrate user credentials.

## Decision Drivers
- OWASP Top 10 compliance (A01 Broken Access Control, A07 Identification and Authentication Failures).
- Protection of financial escrow actions against automated credential theft.
- Smooth mobile browser UX for farmers and drivers on intermittent connectivity.

## Options Considered
1. **Status Quo (JWT in localStorage):** Token read and attached as `Authorization: Bearer <token>` on every request.
2. **HttpOnly Secure SameSite=Strict Cookies with CSRF Token (Recommended):** Backend sets `access_token` and `refresh_token` as `HttpOnly; Secure; SameSite=Strict` cookies. Mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`) require an anti-CSRF token header (`X-CSRF-Token`).
3. **In-Memory JWT with Silent Refresh:** Token stored only in JavaScript memory; refreshed via iframe or background request on page load. (Complex, fragile on mobile).

## Recommendation
Adopt **Option 2**. FastAPI already supports reading the `access_token` cookie in `get_current_user` (`request.cookies.get("access_token")`), so the migration path is backwards-compatible and highly secure.

## Consequences
- **Positive:**
  - Complete immunity against XSS token exfiltration.
  - Transparent session persistence across browser refreshes and page transitions.
- **Negative:**
  - Requires CSRF token handling on state-mutating requests.
- **Triggers for Re-evaluation:**
  - If a native mobile app (React Native / Flutter) is introduced that does not use a browser webview for API calls.
