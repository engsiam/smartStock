# SmartStock — Security Architecture & Threat Model

**Document Version:** 1.0  
**Status:** Implemented & Verified  

---

## 1. Authentication & Password Security

### Argon2id Password Hashing
- SmartStock utilizes **Argon2id** (the winner of the Password Hashing Competition) via the native `argon2` library.
- Configuration:
  - Memory cost: 65,536 KiB (`m=65536`)
  - Time iterations: 3 iterations (`t=3`)
  - Parallelism: 4 threads (`p=4`)
  - Cryptographically secure random 16-byte salt per hash.
- Passwords are never stored in plaintext or logged to console/files.

### JWT Token Lifecycle
- **Access Token:** Short-lived (`15m` TTL) signed with HMAC-SHA256. Carries minimal claims: `sub` (User ID), `email`, and `name`.
- **Refresh Token:** Cryptographically random 64-character hex string stored with hashed mapping. Rotated upon use.
- **Route Guards:** NestJS `JwtAuthGuard` intercepts incoming requests, validates signature, verifies token expiry, and extracts the user context.

---

## 2. Role-Based Access Control (RBAC)

The application enforces three distinct roles across backend endpoints and UI controls:

| Role | Permitted Actions | Restricted Actions |
| :--- | :--- | :--- |
| `OWNER` | Full system access, company profile updates, team role assignments, product creation/editing, POS checkout, voiding sales, purchase order receiving, and financial exports. | None |
| `STAFF` | POS checkout, product search, catalog view, and receiving approved purchase orders. | Cannot void sales, cannot view store profit margins, cannot edit team members or settings. |
| `ACCOUNTANT` | Full read-only access to sales invoices, financial overview, stock movement audit ledger, and CSV exports. | Cannot modify product prices, cannot process POS checkout. |

Enforcement is implemented via the `@Roles('OWNER', ...)` decorator and `RolesGuard`.

---

## 3. Network & Transport Security

1. **Helmet HTTP Headers (`@fastify/helmet`):**
   - Content Security Policy (CSP)
   - Strict-Transport-Security (HSTS)
   - X-Content-Type-Options: `nosniff`
   - X-Frame-Options: `DENY`
   - Referrer-Policy: `no-referrer`

2. **CORS (Cross-Origin Resource Sharing):**
   - Configurable via `CORS_ORIGIN` in `backend/.env`.
   - Defaults strictly to trusted frontend URL (`http://localhost:5173`).

3. **Rate Limiting (`@nestjs/throttler`):**
   - Protects against brute-force attacks and denial-of-service attempts.
   - Limit: 300 requests per 60-second window. Requests exceeding threshold return `429 Too Many Requests`.

---

## 4. Multi-Tenant Isolation & IDOR Protection

- Every table query is guarded by `where: { businessId }`.
- When an entity ID is provided via route parameters (e.g., `GET /api/products/:id` or `POST /api/sales/:id/void`), the service queries:
  ```typescript
  const record = await this.prisma.entity.findFirst({
    where: { id, businessId },
  });
  if (!record) throw new NotFoundException();
  ```
- If a user from Business B manipulates the ID to target a record belonging to Business A, the query returns `404 Not Found` rather than leaking existence or data.

---

## 5. Secrets Hygiene & API Key Isolation

- `GEMINI_API_KEY` is strictly backend-only. It is loaded through `ConfigService` in NestJS and never passed to the frontend.
- Production environment variables are stored in git-ignored `.env` files.
- Sample environment files (`backend/.env.example`, `frontend/.env.example`) contain placeholders only (`CHANGE_ME`).
- Verified: Zero matches for Google API key patterns (`AIza...`) in git commits or frontend bundle.
