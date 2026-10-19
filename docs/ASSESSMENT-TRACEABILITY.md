# SmartStock — Assessment Traceability Matrix

**Project:** SmartStock — AI-Powered Inventory Management System  
**Assessment:** NT TECH INNOVATION — Full Stack Developer Practical Assessment  
**Document version:** 0.1 (Phase 01 baseline — zero source code exists)  
**Last updated:** 2026-10-18  
**Author:** Developer (traceability document prepared with mentor guidance)

---

## How to Read This Document

| Column | Meaning |
|---|---|
| **REQ-ID** | Unique requirement identifier used throughout all docs |
| **Category** | Domain area |
| **Requirement** | Exact or faithful summary from PROMPT.md / assessment |
| **Planned Module / File** | Where this will live when implemented |
| **Verification Method** | How `PASS` will be proved |
| **Status** | `NOT VERIFIED` / `IN PROGRESS` / `PASS` / `FAIL` / `BLOCKED` |

> **Rule:** A requirement may only be marked `PASS` when there is observed, reproducible evidence. "I wrote code for it" is NOT evidence.

---

## Status Legend

| Status | Meaning |
|---|---|
| `NOT VERIFIED` | Not yet implemented or not yet tested with observed output |
| `IN PROGRESS` | Work has started; evidence not yet complete |
| `PASS` | Verified by observed, reproducible evidence |
| `FAIL` | Implemented but verification failed |
| `BLOCKED` | Cannot proceed due to a dependency or external issue |

---

## Section 1 — Technology Stack

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| STK-01 | Frontend Stack | React + TypeScript + Vite | `frontend/` (not created) | `npm run build` exits 0; no type errors | `NOT VERIFIED` |
| STK-02 | Frontend Stack | Tailwind CSS v4 | `frontend/src/styles/` | Tailwind v4 in `package.json`; styles render in browser | `NOT VERIFIED` |
| STK-03 | Frontend Stack | React Router for routing | `frontend/src/app/router.tsx` | Routes resolve correctly; protected routes redirect | `NOT VERIFIED` |
| STK-04 | Frontend Stack | TanStack Query for server-state | `frontend/src/lib/query-client.ts` | Query, caching, and invalidation observed in dev tools | `NOT VERIFIED` |
| STK-05 | Frontend Stack | React Hook Form + Zod validation | `frontend/src/lib/validation/` | Invalid form inputs show inline errors; valid submissions proceed | `NOT VERIFIED` |
| STK-06 | Frontend Stack | Recharts for analytics | `frontend/src/features/reports/` | Charts render with real backend data | `NOT VERIFIED` |
| STK-07 | Frontend Stack | Lucide React icons | Throughout frontend components | Icons render; no console errors | `NOT VERIFIED` |
| STK-08 | Frontend Stack | Vitest + React Testing Library | `frontend/tests/` | `npm run test` exits 0 with observed output | `NOT VERIFIED` |
| STK-09 | Backend Stack | Node.js + TypeScript | `backend/src/` (not created) | `npm run typecheck` exits 0 | `NOT VERIFIED` |
| STK-10 | Backend Stack | NestJS framework | `backend/src/app.module.ts` | Server starts; `/health` responds 200 | `NOT VERIFIED` |
| STK-11 | Backend Stack | Fastify adapter | `backend/src/main.ts` | `@nestjs/platform-fastify` in `package.json`; no Express references | `NOT VERIFIED` |
| STK-12 | Backend Stack | PostgreSQL database | `backend/prisma/schema.prisma` | DB connection succeeds; migrations apply cleanly | `NOT VERIFIED` |
| STK-13 | Backend Stack | Prisma ORM | `backend/prisma/` | `prisma generate` and `prisma validate` exit 0 | `NOT VERIFIED` |
| STK-14 | Backend Stack | NestJS ConfigModule | `backend/src/config/` | Missing env var at startup causes descriptive error | `NOT VERIFIED` |
| STK-15 | Backend Stack | class-validator + class-transformer | DTOs throughout `backend/src/modules/` | Invalid request body returns 400 with field-level errors | `NOT VERIFIED` |
| STK-16 | Backend Stack | Swagger/OpenAPI documentation | `backend/src/main.ts` | `/api/docs` serves interactive Swagger UI | `NOT VERIFIED` |
| STK-17 | Backend Stack | Helmet security headers | `backend/src/main.ts` | Response headers include `X-Content-Type-Options` etc. | `NOT VERIFIED` |
| STK-18 | Backend Stack | Rate limiting | `backend/src/app.module.ts` | Exceeding limit returns 429 | `NOT VERIFIED` |
| STK-19 | Backend Stack | Argon2id or bcrypt password hashing | `backend/src/modules/auth/` | `passwordHash` stored in DB is never plaintext; verified manually | `NOT VERIFIED` |
| STK-20 | Backend Stack | Jest test runner (backend) | `backend/package.json` jest config | `npm test` exits 0 with observed output | `NOT VERIFIED` |
| STK-21 | AI/ML | Deterministic self-built forecasting | `backend/src/modules/ai-advisor/forecasting/` | Same inputs always return same output; no randomness | `NOT VERIFIED` |
| STK-22 | AI/ML | Google Gemini API for Bangla explanations | `backend/src/modules/ai-advisor/llm/` | Gemini returns explanation when key is set; fallback when unavailable | `NOT VERIFIED` |
| STK-23 | AI/ML | `GEMINI_MODEL` configurable via env | `.env.example` / config | Changing env var changes model used; backend-only | `NOT VERIFIED` |
| STK-24 | AI/ML | `GEMINI_API_KEY` never exposed to frontend | Backend only | Frontend bundle grep for key finds nothing; network tab shows no key | `NOT VERIFIED` |
| STK-25 | AI/ML | Deterministic fallback when Gemini unavailable | `backend/src/modules/ai-advisor/` | Disabling API key still returns valid numeric recommendations | `NOT VERIFIED` |
| STK-26 | Tooling | Git with meaningful commits | `.git/` | `git log` shows descriptive commit messages per phase | `NOT VERIFIED` |
| STK-27 | Tooling | `.env.example` with placeholders only | `backend/.env.example`, `frontend/.env.example` | File checked into git; no real secrets present | `NOT VERIFIED` |
| STK-28 | Tooling | Prisma migrations | `backend/prisma/migrations/` | `prisma migrate deploy` applies cleanly on fresh DB | `NOT VERIFIED` |
| STK-29 | Tooling | Safe seed data | `backend/prisma/seed.ts` | `npm run seed` inserts demo records; idempotent | `NOT VERIFIED` |
| STK-30 | Tooling | README with full setup guide | `README.md` | Reviewer can follow README to run project from scratch | `NOT VERIFIED` |

---

## Section 2 — Architecture and Folder Structure

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| ARCH-01 | Structure | `frontend/` and `backend/` are separate directories | Repository root | `ls` shows both directories exist | `NOT VERIFIED` |
| ARCH-02 | Structure | `frontend/src/` follows the prescribed folder layout | `frontend/src/app/`, `features/`, `components/`, `layouts/`, `hooks/`, `lib/`, `types/`, `styles/` | Directory listing matches PROMPT.md Section 2 | `NOT VERIFIED` |
| ARCH-03 | Structure | `backend/src/` follows the prescribed folder layout | `backend/src/common/`, `config/`, `database/`, `modules/` | Directory listing matches PROMPT.md Section 2 | `NOT VERIFIED` |
| ARCH-04 | Architecture | Public landing page and authenticated dashboard use separate layouts | `frontend/src/layouts/PublicLayout.tsx`, `DashboardLayout.tsx` | Route inspection shows `/` uses PublicLayout; `/dashboard/*` uses DashboardLayout | `NOT VERIFIED` |
| ARCH-05 | Architecture | Business logic kept out of React components and NestJS controllers | Services / hooks | Code review: components call hooks; controllers delegate to services | `NOT VERIFIED` |
| ARCH-06 | Architecture | Forecasting calculations separate from Gemini API calls | `forecasting/` vs `llm/` subdirs | Two distinct service files with no cross-dependency | `NOT VERIFIED` |
| ARCH-07 | Architecture | No monorepo workspace tool unless already present | `package.json` at root | No `workspaces` field in root package.json | `NOT VERIFIED` |
| ARCH-08 | API | API base path and versioning agreed | `backend/src/main.ts` | All endpoints under `/api/v1/` (or agreed prefix) | `NOT VERIFIED` |
| ARCH-09 | API | Consistent error contract (status, message, errors array) | `backend/src/common/filters/` | All 4xx/5xx responses follow the same shape | `NOT VERIFIED` |
| ARCH-10 | API | Pagination on list endpoints | All list controllers | List endpoints accept `page` and `limit`; response includes `total` | `NOT VERIFIED` |

---

## Section 3 — Database

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| DB-01 | Schema | User model with email uniqueness | `prisma/schema.prisma` L60-75 | Schema verified in Phase 01 | `IN PROGRESS` |
| DB-02 | Schema | Business multi-tenancy model | `schema.prisma` L91-110 | Schema verified; all tables carry `businessId` | `IN PROGRESS` |
| DB-03 | Schema | BusinessMember join with roles | `schema.prisma` L112-124 | Schema verified; unique `[businessId, userId]` | `IN PROGRESS` |
| DB-04 | Schema | Category with unique name per business | `schema.prisma` L140-151 | Unique constraint `[businessId, name]` verified | `IN PROGRESS` |
| DB-05 | Schema | Product with SKU unique per business | `schema.prisma` L153-180 | Unique `[businessId, sku]`; Decimal precision correct | `IN PROGRESS` |
| DB-06 | Schema | StockMovement ledger with signed quantityChange and balanceAfter | `schema.prisma` L320-342 | Schema verified; 7 movement types; audit fields present | `IN PROGRESS` |
| DB-07 | Schema | Purchase draft to received to cancelled lifecycle | `schema.prisma` L224-251 | `PurchaseStatus` enum; idempotencyKey per business | `IN PROGRESS` |
| DB-08 | Schema | SaleItem unitCost snapshot | `schema.prisma` L300-316 | `unitCost` field confirmed; historical cost cannot drift | `IN PROGRESS` |
| DB-09 | Schema | Payment with direction IN/OUT and polymorphic refs | `schema.prisma` L346-375 | `PaymentDirection` enum; customer/supplier/sale/purchase FKs | `IN PROGRESS` |
| DB-10 | Schema | Expense model | `schema.prisma` L377-392 | Verified in Phase 01 | `IN PROGRESS` |
| DB-11 | Schema | Decimal(14,2) for money, Decimal(14,3) for quantity | Throughout schema | Verified on Product, SaleItem, PurchaseItem, Payment, Expense | `IN PROGRESS` |
| DB-12 | Schema | Foreign keys with correct deletion rules | Throughout schema | Cascade on Business delete; SetNull on User delete; Restrict on Product | `IN PROGRESS` |
| DB-13 | Schema | Indexes on businessId + common query columns | Throughout schema | Verified: name, status, dates, productId indexed | `IN PROGRESS` |
| DB-14 | Migrations | Prisma migration files created and applied | `backend/prisma/migrations/` | `prisma migrate status` shows all applied | `NOT VERIFIED` |
| DB-15 | Migrations | Migration is idempotent on a fresh database | CI / test environment | `prisma migrate deploy` on empty DB succeeds | `NOT VERIFIED` |
| DB-16 | Transactions | Stock updates and sale creation are atomic | `backend/src/modules/sales/` | Test: simulate crash mid-sale; no partial records remain | `NOT VERIFIED` |
| DB-17 | Transactions | Purchase receiving updates stock exactly once | `backend/src/modules/purchases/` | Test: double-receive attempt fails; stock count verified | `NOT VERIFIED` |
| DB-18 | Data Integrity | Negative stock prevented | `backend/src/modules/inventory/` | Test: sell more than stock → 422/400; stock stays non-negative | `NOT VERIFIED` |
| DB-19 | Data Integrity | Counter model ensures document number uniqueness | `backend/src/modules/` (shared counter util) | Concurrent requests produce unique PO/INV numbers | `NOT VERIFIED` |

> **Note:** DB-01 through DB-13 are `IN PROGRESS` because the schema file is verified, but migrations have not run and no application code exists yet.

---

## Section 4 — Authentication and Security

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| AUTH-01 | Auth | User registration with validated input | `backend/src/modules/auth/` | `POST /api/v1/auth/register` with valid body returns 201 | `NOT VERIFIED` |
| AUTH-02 | Auth | Password hashed with Argon2id or bcrypt (never plaintext) | `auth.service.ts` | DB inspection shows hash; plaintext never stored | `NOT VERIFIED` |
| AUTH-03 | Auth | Login returns access token + refresh token | `auth.service.ts` | `POST /api/v1/auth/login` returns `{ accessToken, refreshToken }` | `NOT VERIFIED` |
| AUTH-04 | Auth | Access token is short-lived (configurable via `JWT_ACCESS_TTL`) | `auth.service.ts`, `.env.example` | Expired token returns 401; token TTL matches env var | `NOT VERIFIED` |
| AUTH-05 | Auth | Refresh token rotation | `auth.service.ts` | Old refresh token rejected after rotation | `NOT VERIFIED` |
| AUTH-06 | Auth | Logout revokes refresh token | `auth.service.ts` | After logout, refresh token returns 401 | `NOT VERIFIED` |
| AUTH-07 | Auth | Unauthorized routes return 401 | Guards | Calling protected endpoint without token → 401 | `NOT VERIFIED` |
| AUTH-08 | Auth | Safe error messages (no user enumeration on login) | `auth.service.ts` | Wrong email and wrong password return identical 401 message | `NOT VERIFIED` |
| AUTH-09 | Auth | Frontend stores tokens securely | `frontend/src/features/auth/` | Tokens not in localStorage; httpOnly cookie or memory store only | `NOT VERIFIED` |
| AUTH-10 | Auth | Frontend route guards redirect unauthenticated users | `frontend/src/app/routes/` | Direct URL to `/dashboard/*` without token redirects to login | `NOT VERIFIED` |
| SEC-01 | Security | Helmet headers on all responses | `backend/src/main.ts` | `curl -I` shows security headers | `NOT VERIFIED` |
| SEC-02 | Security | Rate limiting on auth endpoints at minimum | `app.module.ts` | 429 returned after N requests per minute | `NOT VERIFIED` |
| SEC-03 | Security | CORS restricted to configured origin | `backend/src/main.ts` | Request from non-allowed origin blocked | `NOT VERIFIED` |
| SEC-04 | Security | No secrets committed to git | `.gitignore`, `.env.example` | `git log --all -p` grep for real secrets finds only placeholders | `NOT VERIFIED` |
| SEC-05 | Security | GEMINI_API_KEY never in frontend bundle | Build output | `grep -r "AIza" frontend/dist` returns nothing | `NOT VERIFIED` |
| SEC-06 | Security | Input validation on all endpoints (class-validator) | All DTOs | Fuzz test: send extra fields, wrong types → 400 with descriptive errors | `NOT VERIFIED` |
| SEC-07 | Authorization | Server-side ownership check on every protected resource | All services | User A cannot read or modify Business B's records | `NOT VERIFIED` |
| SEC-08 | Authorization | IDOR prevention | All list/detail/update/delete endpoints | Request with manipulated ID returns 403 or 404 | `NOT VERIFIED` |
| SEC-09 | Authorization | Role enforcement (OWNER vs STAFF vs ACCOUNTANT) | Guards / decorators | STAFF cannot perform OWNER-only actions | `NOT VERIFIED` |
| SEC-10 | Authorization | Cross-business access blocked | Integration tests | User member of Business A cannot access Business B's data | `NOT VERIFIED` |

---

## Section 5 — Business Modules

### 5.1 Products and Categories

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| PROD-01 | Products | CRUD operations for products | `backend/src/modules/products/` | Full CRUD verified via API calls | `NOT VERIFIED` |
| PROD-02 | Products | SKU uniqueness per business | `products.service.ts` | Creating duplicate SKU in same business → 409 | `NOT VERIFIED` |
| PROD-03 | Products | Archive/soft-delete (isActive flag) | `products.service.ts` | Archived product excluded from default list; historical references intact | `NOT VERIFIED` |
| PROD-04 | Products | Category relationship (nullable) | `schema.prisma` L172 | Product can exist without category; category deletion sets null | `NOT VERIFIED` |
| PROD-05 | Products | Search and pagination | `products.controller.ts` | `GET /products?search=rice&page=1&limit=20` returns filtered results | `NOT VERIFIED` |
| PROD-06 | Products | Historical SaleItem/PurchaseItem references intact after archive | `schema.prisma` L263, L312 | Restrict deletion; old sale items retain product reference | `NOT VERIFIED` |
| CAT-01 | Categories | CRUD for categories | `backend/src/modules/categories/` | Full CRUD verified | `NOT VERIFIED` |
| CAT-02 | Categories | Unique name per business | `schema.prisma` L150 | Duplicate name → 409 | `NOT VERIFIED` |

### 5.2 Inventory

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| INV-01 | Inventory | Stock movement history ledger | `backend/src/modules/inventory/` | `GET /inventory/:productId/movements` returns chronological ledger | `NOT VERIFIED` |
| INV-02 | Inventory | Opening stock entry (OPENING movement type) | `inventory.service.ts` | Opening stock creates StockMovement with type OPENING | `NOT VERIFIED` |
| INV-03 | Inventory | Manual adjustment (ADJUSTMENT_IN / ADJUSTMENT_OUT) | `inventory.service.ts` | Adjustment creates movement; `stockQty` updated in same transaction | `NOT VERIFIED` |
| INV-04 | Inventory | Negative stock prevention | `inventory.service.ts` | Adjustment_OUT beyond current stock → 422 | `NOT VERIFIED` |
| INV-05 | Inventory | Concurrent update safety | `inventory.service.ts` | Concurrent sales of same product do not oversell | `NOT VERIFIED` |
| INV-06 | Inventory | `balanceAfter` correct in every movement | `inventory.service.ts` | Verify balance chain manually from seed data | `NOT VERIFIED` |
| INV-07 | Inventory | Returns handled (SALE_RETURN, PURCHASE_RETURN) | `inventory.service.ts` | Return creates movement; stock restored correctly | `NOT VERIFIED` |

### 5.3 Purchases

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| PUR-01 | Purchases | Create purchase in DRAFT status | `backend/src/modules/purchases/` | `POST /purchases` → status DRAFT; stock unchanged | `NOT VERIFIED` |
| PUR-02 | Purchases | Draft does not increase stock | `purchases.service.ts` | Verify `stockQty` unchanged after draft creation | `NOT VERIFIED` |
| PUR-03 | Purchases | Receive purchase → stock increases exactly once | `purchases.service.ts` | Receive → stock increases; second receive attempt → 409/422 | `NOT VERIFIED` |
| PUR-04 | Purchases | Cancel purchase | `purchases.service.ts` | Cancel DRAFT → status CANCELLED; received purchase cannot be cancelled | `NOT VERIFIED` |
| PUR-05 | Purchases | Supplier payable tracked via Payment | `purchases.service.ts` | Supplier balance reflects unpaid purchase total | `NOT VERIFIED` |
| PUR-06 | Purchases | Idempotency key prevents duplicate creates | `schema.prisma` L247 | Same idempotency key returns existing record | `NOT VERIFIED` |
| PUR-07 | Purchases | Document number auto-generated (PO-XXXX) | Counter util | Numbers unique per business; no gaps under concurrent load | `NOT VERIFIED` |
| PUR-08 | Purchases | Rollback on failure leaves no partial records | `purchases.service.ts` | Simulate DB error mid-receive; no StockMovement orphan | `NOT VERIFIED` |

### 5.4 Sales

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| SALE-01 | Sales | Create sale with items | `backend/src/modules/sales/` | `POST /sales` → 201; stock deducted; SaleItem rows created | `NOT VERIFIED` |
| SALE-02 | Sales | Stock deducted atomically with sale creation | `sales.service.ts` | Sale + StockMovement in single DB transaction | `NOT VERIFIED` |
| SALE-03 | Sales | Insufficient stock rejected | `sales.service.ts` | Selling qty > stockQty → 422; no partial records | `NOT VERIFIED` |
| SALE-04 | Sales | Cost snapshot on SaleItem at time of sale | `sales.service.ts` | `unitCost` on SaleItem equals product `costPrice` at sale time | `NOT VERIFIED` |
| SALE-05 | Sales | Discount applied correctly | `sales.service.ts` | `total = subtotal - discount`; verified by calculation | `NOT VERIFIED` |
| SALE-06 | Sales | Idempotency key prevents duplicate sales | `schema.prisma` L294 | Duplicate key → returns existing sale, not new record | `NOT VERIFIED` |
| SALE-07 | Sales | Void sale | `sales.service.ts` | Void → status VOIDED; stock restored; receivable adjusted | `NOT VERIFIED` |
| SALE-08 | Sales | Concurrent sale safety | `sales.service.ts` | Two concurrent requests for last unit; only one succeeds | `NOT VERIFIED` |
| SALE-09 | Sales | Document number auto-generated (INV-XXXX) | Counter util | Unique per business | `NOT VERIFIED` |

### 5.5 Customers, Suppliers, and Payments

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| CSP-01 | Customers | CRUD for customers | `backend/src/modules/customers/` | Full CRUD verified | `NOT VERIFIED` |
| CSP-02 | Customers | Opening balance for pre-existing receivables | `schema.prisma` L210 | Opening balance included in receivable calculation | `NOT VERIFIED` |
| CSP-03 | Suppliers | CRUD for suppliers | `backend/src/modules/suppliers/` | Full CRUD verified | `NOT VERIFIED` |
| CSP-04 | Suppliers | Opening balance for pre-existing payables | `schema.prisma` L190 | Opening balance included in payable calculation | `NOT VERIFIED` |
| CSP-05 | Payments | Record customer payment (IN) | `backend/src/modules/payments/` | Payment created; customer receivable reduced | `NOT VERIFIED` |
| CSP-06 | Payments | Record supplier payment (OUT) | `payments.service.ts` | Payment created; supplier payable reduced | `NOT VERIFIED` |
| CSP-07 | Payments | Partial payments supported | `payments.service.ts` | Multiple partial payments sum to total owed | `NOT VERIFIED` |
| CSP-08 | Payments | Payment methods (CASH, BKASH, NAGAD, BANK, CARD, OTHER) | `schema.prisma` L49-56 | All methods accepted and stored correctly | `NOT VERIFIED` |
| CSP-09 | Payments | Idempotency key prevents duplicate payments | `schema.prisma` L371 | Duplicate key → existing payment returned | `NOT VERIFIED` |
| CSP-10 | Payments | Customer and supplier payment directions separate | `schema.prisma` L346-375 | `direction` field distinguishes IN/OUT clearly | `NOT VERIFIED` |

### 5.6 Expenses and Reports

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| EXP-01 | Expenses | Record expenses by category | `backend/src/modules/expenses/` | `POST /expenses` creates record with free-text category | `NOT VERIFIED` |
| EXP-02 | Expenses | Date filter on expense list | `expenses.controller.ts` | `GET /expenses?from=&to=` returns filtered results | `NOT VERIFIED` |
| RPT-01 | Reports | Revenue = sum of completed sale totals in period | `backend/src/modules/reports/` | Manual calculation matches API response | `NOT VERIFIED` |
| RPT-02 | Reports | COGS = sum of (qty x unitCost snapshot) for sales in period | `reports.service.ts` | Uses SaleItem.unitCost, not current product costPrice | `NOT VERIFIED` |
| RPT-03 | Reports | Gross profit = Revenue minus COGS | `reports.service.ts` | Verified by calculation on known data | `NOT VERIFIED` |
| RPT-04 | Reports | Net profit = Gross profit minus Operating expenses | `reports.service.ts` | Verified by calculation | `NOT VERIFIED` |
| RPT-05 | Reports | Customer receivables report | `reports.service.ts` | `openingBalance + sales - payments_IN` verified by data | `NOT VERIFIED` |
| RPT-06 | Reports | Supplier payables report | `reports.service.ts` | `openingBalance + purchases - payments_OUT` verified | `NOT VERIFIED` |
| RPT-07 | Reports | Stock valuation (qty x costPrice) | `reports.service.ts` | Verified against current stockQty x costPrice per product | `NOT VERIFIED` |
| RPT-08 | Reports | Date range and timezone filter (Asia/Dhaka) | `reports.service.ts` | Filtering by date boundary in BD timezone returns correct records | `NOT VERIFIED` |
| RPT-09 | Reports | Discounts and returns treated consistently | `reports.service.ts` | Accounting policy documented in DATABASE.md; applied consistently | `NOT VERIFIED` |
| RPT-10 | Reports | Historical profit never recalculated with today's cost | `reports.service.ts` | Edit product costPrice; old sale report unchanged | `NOT VERIFIED` |

---

## Section 6 — Dashboard

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| DASH-01 | Dashboard | All metrics sourced from real backend APIs | `frontend/src/features/dashboard/` | Network tab shows API calls; no hardcoded values in JS | `NOT VERIFIED` |
| DASH-02 | Dashboard | No fake/hardcoded demo metrics | Frontend components | Code review: no mock data in production paths | `NOT VERIFIED` |
| DASH-03 | Dashboard | Date filters work on all dashboard cards | Dashboard API | Change date range → metrics change | `NOT VERIFIED` |
| DASH-04 | Dashboard | Loading state shown while data fetches | Dashboard components | Skeleton/spinner shown before data arrives | `NOT VERIFIED` |
| DASH-05 | Dashboard | Error state shown on API failure | Dashboard components | Kill backend → dashboard shows error, not crash | `NOT VERIFIED` |
| DASH-06 | Dashboard | Empty state shown when no data | Dashboard components | Fresh business shows empty state, not 0-filled cards | `NOT VERIFIED` |
| DASH-07 | Dashboard | Charts render with real data | `features/reports/` | Chart data matches API response | `NOT VERIFIED` |
| DASH-08 | Dashboard | Mutation updates refresh relevant queries | TanStack Query | Create sale → dashboard metric updates without full page reload | `NOT VERIFIED` |

---

## Section 7 — Public Landing Page and Frontend UX

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| LAND-01 | Landing Page | Public `/` route uses `PublicLayout` | `frontend/src/layouts/PublicLayout.tsx` | Route renders without auth check | `NOT VERIFIED` |
| LAND-02 | Landing Page | Value proposition and feature sections | `frontend/src/features/landing/` | Sections visible in browser | `NOT VERIFIED` |
| LAND-03 | Landing Page | AI advisor section explained | Landing page | AI section explains capabilities honestly | `NOT VERIFIED` |
| LAND-04 | Landing Page | FAQ and footer present | Landing page | Visible in browser | `NOT VERIFIED` |
| LAND-05 | Landing Page | Login / Get Started navigation works | Landing page | Buttons navigate to login/register correctly | `NOT VERIFIED` |
| LAND-06 | Landing Page | No private business data exposed | Landing page | No authenticated API calls from landing page | `NOT VERIFIED` |
| UX-01 | UX | Responsive: mobile, tablet, desktop | All pages | Manual test at 375px, 768px, 1280px widths | `NOT VERIFIED` |
| UX-02 | UX | Keyboard accessible navigation | All interactive elements | Tab through all controls; focus visible | `NOT VERIFIED` |
| UX-03 | UX | Form labels and aria attributes | All forms | Screen reader announces form fields correctly | `NOT VERIFIED` |
| UX-04 | UX | Colour contrast meets WCAG AA | All text | Contrast ratio >= 4.5:1 for body text | `NOT VERIFIED` |
| UX-05 | UX | Confirmation dialogs for destructive actions | Delete/void/cancel UI | User prompted before irreversible action | `NOT VERIFIED` |
| UX-06 | UX | Success and error feedback after mutations | All forms | Toast/alert shown after save or error | `NOT VERIFIED` |
| UX-07 | UX | Session expiry handled gracefully | Auth guard | Expired token → redirect to login with message | `NOT VERIFIED` |
| UX-08 | UX | UI language Bangla-first | All UI text | Interface text in Bangla where required | `NOT VERIFIED` |
| UX-09 | UX | BDT currency symbol used throughout | All monetary displays | Currency symbol and formatting correct | `NOT VERIFIED` |

---

## Section 8 — AI Stock Advisor

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| AI-01 | Forecasting | Deterministic forecast from recent sales history | `backend/src/modules/ai-advisor/forecasting/` | Same inputs always return same output; no randomness | `NOT VERIFIED` |
| AI-02 | Forecasting | 7-day and 28-day averages considered | `forecasting.service.ts` | Algorithm documented; calculation verified by hand | `NOT VERIFIED` |
| AI-03 | Forecasting | Edge: zero demand product | `forecasting.service.ts` | Product with no sales → forecast = 0; reorder = safety stock | `NOT VERIFIED` |
| AI-04 | Forecasting | Edge: new product (no history) | `forecasting.service.ts` | Recommendation labelled experimental; no division-by-zero | `NOT VERIFIED` |
| AI-05 | Forecasting | Edge: missing days / stockouts in history | `forecasting.service.ts` | Stockout days handled (not treated as zero demand) | `NOT VERIFIED` |
| AI-06 | Forecasting | Edge: outliers in sales data | `forecasting.service.ts` | Outlier handling documented | `NOT VERIFIED` |
| AI-07 | Reorder | Lead time, safety stock, review horizon used | `forecasting.service.ts` | Formula: reorderPoint = avgDailyDemand x (leadTime + reviewPeriod) + safetyStock | `NOT VERIFIED` |
| AI-08 | Reorder | Suggested quantity considers budget constraint | `forecasting.service.ts` | Budget limit reduces suggested qty with explanation | `NOT VERIFIED` |
| AI-09 | Reorder | Quantities rounded sensibly (no fractional pcs) | `forecasting.service.ts` | Integer or unit-appropriate rounding applied | `NOT VERIFIED` |
| AI-10 | Gemini | Gemini called backend-only | `llm.service.ts` | No Gemini calls in frontend code; verified by grep | `NOT VERIFIED` |
| AI-11 | Gemini | Response validates against schema before use | `llm.service.ts` | Invalid Gemini response triggers fallback, not crash | `NOT VERIFIED` |
| AI-12 | Gemini | Timeout and rate limit handled | `llm.service.ts` | Gemini timeout → fallback response within configured ms | `NOT VERIFIED` |
| AI-13 | Gemini | Explanation in Bangla | `llm.service.ts` | Gemini response contains Bangla text when API key set | `NOT VERIFIED` |
| AI-14 | Gemini | LLM output does not determine stock/financial values | `ai-advisor.controller.ts` | Numeric values come from deterministic service; LLM provides text only | `NOT VERIFIED` |
| AI-15 | Evaluation | Chronological backtesting (no data leakage) | `docs/TESTING.md` or eval script | Train on history[0..n-1]; test on history[n]; no future data used | `NOT VERIFIED` |
| AI-16 | Evaluation | MAE calculated and reported | Eval script / docs | MAE value documented with sample size | `NOT VERIFIED` |
| AI-17 | Evaluation | Comparison with simple baseline (e.g. 7-day average) | Eval script / docs | Baseline MAE computed and compared | `NOT VERIFIED` |
| AI-18 | Evaluation | Insufficient data labelled experimental | API response | `confidence: "experimental"` or similar flag when below N data points | `NOT VERIFIED` |
| AI-19 | Evaluation | No fabricated results | `docs/TESTING.md` | All MAE/evaluation numbers reproducible from real data | `NOT VERIFIED` |

---

## Section 9 — Testing

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| TEST-01 | Backend Unit | Auth service: hashing and token generation | `test/unit/auth/` | Jest unit tests pass with observed output | `NOT VERIFIED` |
| TEST-02 | Backend Unit | Forecasting service: all edge cases | `test/unit/ai-advisor/` | Unit tests with known inputs and expected outputs | `NOT VERIFIED` |
| TEST-03 | Backend Unit | Reorder calculator: formula correctness | `test/unit/ai-advisor/` | Tests verify formula by hand-calculated values | `NOT VERIFIED` |
| TEST-04 | Backend Unit | Report calculations: revenue, COGS, profit | `test/unit/reports/` | Unit tests with fixed data sets | `NOT VERIFIED` |
| TEST-05 | Backend Integration | Sale atomicity: crash mid-sale leaves no orphan | `test/integration/sales/` | Integration test observed passing | `NOT VERIFIED` |
| TEST-06 | Backend Integration | Insufficient stock prevents sale | `test/integration/sales/` | Test observed passing | `NOT VERIFIED` |
| TEST-07 | Backend Integration | Purchase received exactly once | `test/integration/purchases/` | Test observed passing | `NOT VERIFIED` |
| TEST-08 | Backend Integration | Tenant isolation: cross-business access blocked | `test/integration/auth/` | Test observed passing | `NOT VERIFIED` |
| TEST-09 | Backend Integration | Payment reconciliation | `test/integration/payments/` | Test observed passing | `NOT VERIFIED` |
| TEST-10 | Frontend Unit | Form validation shows correct errors | `frontend/tests/` | Vitest + RTL tests observed passing | `NOT VERIFIED` |
| TEST-11 | Frontend Unit | Auth flow: login/logout state changes | `frontend/tests/` | Tests observed passing | `NOT VERIFIED` |
| TEST-12 | Coverage | `npm run test:cov` shows meaningful coverage | Both apps | Coverage report reviewed; critical paths covered | `NOT VERIFIED` |

---

## Section 10 — Documentation

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| DOC-01 | README | Setup prerequisites documented | `README.md` | Reviewer can follow from clone to running app | `NOT VERIFIED` |
| DOC-02 | README | Environment setup with `.env.example` | `README.md` | Step-by-step env setup documented | `NOT VERIFIED` |
| DOC-03 | README | Database migration and seed commands | `README.md` | Commands documented and verified working | `NOT VERIFIED` |
| DOC-04 | README | All npm scripts documented | `README.md` | Each script explained | `NOT VERIFIED` |
| DOC-05 | README | Architecture overview | `README.md` | Folder structure and data flow explained | `NOT VERIFIED` |
| DOC-06 | README | Swagger URL documented | `README.md` | URL works when backend running | `NOT VERIFIED` |
| DOC-07 | README | AI evaluation and limitations documented honestly | `README.md` | Limitations and evaluation method described accurately | `NOT VERIFIED` |
| DOC-08 | README | Known issues and troubleshooting | `README.md` | At least common setup issues documented | `NOT VERIFIED` |
| DOC-09 | Docs | `docs/PRD.md` with user roles, routes, acceptance criteria | `docs/PRD.md` | File exists and is complete | `NOT VERIFIED` |
| DOC-10 | Docs | `docs/DATABASE.md` with schema rationale | `docs/DATABASE.md` | Accounting policy for COGS/profit documented | `NOT VERIFIED` |
| DOC-11 | Docs | `docs/API.md` with API contract | `docs/API.md` | All endpoints documented | `NOT VERIFIED` |
| DOC-12 | Docs | `docs/SECURITY.md` with security decisions | `docs/SECURITY.md` | Auth strategy, token storage, CORS, rate limiting documented | `NOT VERIFIED` |
| DOC-13 | Docs | `docs/TESTING.md` with test strategy and AI evaluation | `docs/TESTING.md` | Test types, coverage goals, AI backtesting documented | `NOT VERIFIED` |
| DOC-14 | Docs | `docs/DEMO-CHECKLIST.md` | `docs/DEMO-CHECKLIST.md` | Checklist matches actual implemented functionality | `NOT VERIFIED` |

---

## Section 11 — Git and Delivery

| REQ-ID | Category | Requirement | Planned Module / File | Verification Method | Status |
|---|---|---|---|---|---|
| GIT-01 | Git | Meaningful commit messages per phase/feature | `.git/` | `git log --oneline` shows descriptive messages | `NOT VERIFIED` |
| GIT-02 | Git | No secrets committed | All commits | `git log --all -p` grep for real secrets finds only placeholders | `NOT VERIFIED` |
| GIT-03 | Git | No build artifacts committed | `.gitignore` | `node_modules/`, `dist/`, `coverage/` not in git tree | `NOT VERIFIED` |
| GIT-04 | Git | `.env` files not committed | `.gitignore` | `.env` absent from `git ls-files` | `NOT VERIFIED` |
| GIT-05 | Delivery | `frontend/` build verified (`npm run build` exits 0) | CI / local | Observed output of successful build | `NOT VERIFIED` |
| GIT-06 | Delivery | `backend/` build verified (`npm run build` exits 0) | CI / local | Observed output of successful build | `NOT VERIFIED` |
| GIT-07 | Delivery | Developer can explain every submitted file | Assessment demo | Not an automated check; assessed by reviewer | `NOT VERIFIED` |

---

## Section 12 — Assessment Independence Policy

| REQ-ID | Category | Requirement | Status | Notes |
|---|---|---|---|---|
| IND-01 | Independence | AI tools used only for planning, teaching, debugging, and review | `NOT VERIFIED` | Developer confirms: no AI-generated complete features submitted as own work |
| IND-02 | Independence | Developer can explain every file in the submission | `NOT VERIFIED` | Demo requirement; verified by examiner |
| IND-03 | Independence | No complete AI-generated solution submitted | `NOT VERIFIED` | Self-declared; evidenced by commit history showing incremental work |

---

## Missing Evidence and Ambiguities

### Critical Missing Items

1. `backend/package.json` has no `dependencies` declared — the entire stack is undeclared. Must be added before any verification is possible.
2. `backend/src/` does not exist — zero application code exists.
3. `frontend/` directory does not exist — frontend has not been scaffolded.
4. No Prisma migrations — schema written but never applied.
5. `seed.ts` and `setup-db.ts` referenced in scripts but file bodies are missing.

### Ambiguities Requiring Clarification Before Implementation

| ID | Ambiguity | Affects |
|---|---|---|
| AMB-01 | JWT strategy: httpOnly cookies vs Bearer header? CSRF implications differ. | AUTH-09, SEC-03 |
| AMB-02 | Refresh token strategy: single token or family rotation? | AUTH-05 |
| AMB-03 | Role enforcement scope: which endpoints are OWNER-only vs STAFF-allowed? | SEC-09, DB-03 |
| AMB-04 | Void sale: does it restore stock? What if stock was subsequently sold? | SALE-07 |
| AMB-05 | Forecast algorithm: simple moving average, weighted average, or EMA? | AI-01, AI-02 |
| AMB-06 | Safety stock formula: fixed days or demand-variability based? | AI-07 |
| AMB-07 | `JWT_ACCESS_TTL` and `JWT_REFRESH_TTL` in test/setup-env.ts but missing from `.env.example` | AUTH-04 |
| AMB-08 | No assessment brief PDF available — requirements sourced from PROMPT.md only | All |
| AMB-09 | Accounting policy for voided sales in reports: excluded from revenue entirely? | RPT-01, RPT-02 |
| AMB-10 | COGS policy: weighted-average cost (as schema suggests) or FIFO? | RPT-02, DB-11 |

---

## Summary Statistics

| Section | Total | NOT VERIFIED | IN PROGRESS | PASS | FAIL | BLOCKED |
|---|---|---|---|---|---|---|
| Technology Stack (STK) | 30 | 30 | 0 | 0 | 0 | 0 |
| Architecture (ARCH) | 10 | 10 | 0 | 0 | 0 | 0 |
| Database (DB) | 19 | 6 | 13 | 0 | 0 | 0 |
| Auth and Security (AUTH/SEC) | 20 | 20 | 0 | 0 | 0 | 0 |
| Business Modules | 53 | 53 | 0 | 0 | 0 | 0 |
| Dashboard (DASH) | 8 | 8 | 0 | 0 | 0 | 0 |
| Landing Page and UX | 15 | 15 | 0 | 0 | 0 | 0 |
| AI Advisor (AI) | 19 | 19 | 0 | 0 | 0 | 0 |
| Testing (TEST) | 12 | 12 | 0 | 0 | 0 | 0 |
| Documentation (DOC) | 14 | 14 | 0 | 0 | 0 | 0 |
| Git and Delivery (GIT) | 7 | 7 | 0 | 0 | 0 | 0 |
| Independence (IND) | 3 | 3 | 0 | 0 | 0 | 0 |
| **TOTAL** | **210** | **197** | **13** | **0** | **0** | **0** |

The 13 IN PROGRESS items are database schema requirements where the schema file is verified, but migrations have not run and no application code uses it yet.

---

## Next Recommended Tasks

1. **Prompt 03 — Scope and Risks:** Run the MVP scoping exercise to decide which of the 210 requirements are mandatory vs optional for the deadline.
2. **Fix `.env.example`:** Add `JWT_ACCESS_TTL` and `JWT_REFRESH_TTL` to `backend/.env.example` (AMB-07).
3. **Populate `backend/package.json`:** Add `dependencies` and `devDependencies` for the full stack; run `npm install`.
4. **Create `backend/src/`:** Start with `main.ts` and `app.module.ts`.
5. **Scaffold `frontend/`:** Use `npm create vite@latest . -- --template react-ts`.
6. **Make the first git commit** once foundation files are in place.
7. **Resolve AMB-01 through AMB-10** before implementing the affected modules.

---

*This document must be updated as requirements move from NOT VERIFIED to PASS. Never mark a requirement PASS without observed, reproducible evidence.*
