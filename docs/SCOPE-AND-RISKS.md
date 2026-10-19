# SmartStock — Scope and Risks

**Document type:** Project planning — Phase 01, Prompt 03  
**Project:** SmartStock — AI-Powered Inventory Management System  
**Assessment:** NT TECH INNOVATION — Full Stack Developer Practical Assessment  
**Document version:** 1.0  
**Date:** 2026-10-18  
**Status:** DRAFT — awaiting developer approval before implementation begins

> **Planning only.** No application code was generated or modified to produce this document.  
> All implementation must be independently authored by the developer.

---

## 1. Executive Summary

SmartStock is a full-stack inventory management system targeting small shops and grocery businesses in Bangladesh. The assessment requires a coherent, working application — not a prototype — with real database persistence, verified authentication, server-side authorization, tested business logic, deterministic AI forecasting, and honest documentation.

**Current state (Phase 01 baseline):**
- Zero source code exists in `backend/src/` or `frontend/`
- `backend/package.json` has no `dependencies` or `devDependencies` declared
- No npm packages installed
- Prisma schema is complete and verified but no migrations exist
- No git commits have been made

**Conclusion:** The project is at day-zero. Every line of application code is still to be written. A disciplined, phased approach focused on the mandatory workflow is essential.

---

## 2. Assessment Constraints

These constraints are non-negotiable and must be satisfied before submission:

| Constraint | Detail |
|---|---|
| Stack | React + TypeScript + Vite + Tailwind v4 (frontend); NestJS + Fastify + Prisma + PostgreSQL (backend) |
| Separate directories | `frontend/` and `backend/` must be distinct |
| Separate layouts | Public landing page and authenticated dashboard must use different layout components |
| Real data only | All dashboard metrics must come from real backend APIs and real database records |
| No fake metrics | Hardcoded demo values or fake success notifications are explicitly prohibited |
| Password hashing | Argon2id or bcrypt — never plaintext |
| Authorization | Server-side ownership checks on every protected resource |
| AI must be deterministic | Forecasting calculations must not depend on Gemini output |
| Gemini key backend-only | `GEMINI_API_KEY` must never reach the frontend bundle |
| Deterministic fallback | Application must work correctly when Gemini is unavailable |
| Test evidence required | Tests must be run and output observed — not just written |
| Honest documentation | No fabricated results, unverified claims, or misleading metrics |
| Independent authorship | Developer must implement and be able to explain every file |
| Currency | BDT (৳) throughout |
| Language | Bangla-first UI |

---

## 3. Mandatory MVP Feature List (Category A)

These features are required by the assessment. None may be classified as optional.

### 3.1 Foundation (prerequisite for everything)

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Backend `package.json` dependencies declared and installed | Nothing can run without this | Blocks all backend work | Small |
| `backend/src/` scaffolded: `main.ts`, `app.module.ts` | NestJS entry point | STK-10, STK-11 | Small |
| Fastify adapter configured | Required stack | STK-11 | Small |
| ConfigModule with startup validation | Fail-fast on missing secrets | STK-14 | Small |
| Prisma migration created and applied | Database must exist | DB-14, DB-15 | Small |
| Health endpoint `GET /health` | Proves server is live | STK-10 | Small |
| Swagger/OpenAPI at `/api/docs` | Required by assessment | STK-16 | Small |
| Helmet + CORS + rate limiting configured | Security baseline | SEC-01, SEC-02, SEC-03 | Small |
| `.env.example` updated with `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | Environment correctness | AMB-07 | Tiny |
| Frontend scaffolded with Vite + React + TypeScript + Tailwind v4 | Frontend must exist | STK-01, STK-02 | Small |
| First meaningful git commit | Git hygiene | STK-26, GIT-01 | Tiny |

**Acceptance:** Both apps start locally (`npm run start:dev`, `npm run dev`). `/health` returns 200. `/api/docs` renders. No secrets committed.

---

### 3.2 Authentication (blocks all authenticated features)

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| `POST /auth/register` with class-validator DTOs | User onboarding | AUTH-01, STK-15 | Medium |
| Password hashed with Argon2id | Secure credential storage | AUTH-02, STK-19 | Small |
| `POST /auth/login` → access token + refresh token | Session start | AUTH-03 | Medium |
| Short-lived access token (15 min default) | Limit exposure window | AUTH-04 | Small |
| Refresh token rotation | Prevent token replay | AUTH-05 | Medium |
| `POST /auth/logout` revokes refresh token | Clean session end | AUTH-06 | Small |
| JWT guard on all protected routes → 401 | Route protection | AUTH-07 | Small |
| No user-enumeration on login failure | Security | AUTH-08 | Small |
| Frontend auth flow: login, register, logout, token storage | User experience | AUTH-09, AUTH-10 | Medium |
| Frontend route guard → redirect to login | Authenticated routes protected | AUTH-10 | Small |

**Acceptance criteria:**
- `POST /auth/register` with valid body → 201, user in DB with hashed password
- `POST /auth/login` → 200 with tokens; wrong credentials → 401 (same message for wrong email and wrong password)
- Accessing `/products` without token → 401
- After logout, old refresh token → 401

---

### 3.3 Business and Multi-tenancy

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Create business on registration | Tenant isolation root | DB-02, SEC-07 | Small |
| All resources scoped to `businessId` | Data isolation | SEC-07 to SEC-10 | Foundational |
| Server-side ownership check on every query | IDOR prevention | SEC-08, SEC-10 | Medium |
| Cross-business access test | Prove isolation | TEST-08 | Medium |

**Acceptance:** User A in Business A cannot read, update, or delete records belonging to Business B. Verified by integration test with observed passing output.

---

### 3.4 Products and Categories

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Category CRUD | Organise products | CAT-01, CAT-02 | Small |
| Product CRUD with search + pagination | Core catalog | PROD-01 to PROD-05 | Medium |
| SKU uniqueness per business | Duplicate prevention | PROD-02 | Small |
| Archive (soft delete) — isActive flag | Historical data safety | PROD-03, PROD-06 | Small |
| Frontend: product list, create, edit, archive | User workflow | STK-01 | Medium |

---

### 3.5 Inventory

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Opening stock (OPENING movement) | Starting balance | INV-02 | Small |
| Manual adjustment (ADJUSTMENT_IN / ADJUSTMENT_OUT) | Corrections | INV-03 | Small |
| Negative stock prevention | Data integrity | INV-04, DB-18 | Small |
| `balanceAfter` maintained correctly | Audit trail | INV-06 | Small |
| Stock movement history endpoint | Traceability | INV-01 | Small |
| Frontend: view movements, adjust stock | User workflow | STK-01 | Small |

---

### 3.6 Purchases

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Create purchase in DRAFT (no stock change) | Purchase order | PUR-01, PUR-02 | Medium |
| Receive purchase → atomic stock increase (once only) | Goods receipt | PUR-03, DB-17 | Medium |
| Cancel DRAFT purchase | Workflow correction | PUR-04 | Small |
| Auto-generated document number (PO-XXXX) | Document management | PUR-07 | Small |
| Idempotency key on create | Duplicate prevention | PUR-06 | Small |
| Atomic rollback on failure | Data integrity | PUR-08 | Medium |
| Frontend: create purchase, receive goods | User workflow | STK-01 | Medium |

**Acceptance criteria:**
- Draft creates no StockMovement rows
- Receive creates exactly one StockMovement of type PURCHASE per item
- Second receive attempt → 409/422
- Simulate DB failure mid-receive → no orphaned StockMovement

---

### 3.7 Sales

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Create sale with items — atomic stock deduction | Revenue recording | SALE-01, SALE-02, DB-16 | Large |
| Insufficient stock check → 422, no partial records | Data integrity | SALE-03 | Medium |
| Cost snapshot on SaleItem at sale time | Historical profit accuracy | SALE-04, RPT-02 | Small |
| Discount calculation | Business flexibility | SALE-05 | Small |
| Auto-generated document number (INV-XXXX) | Document management | SALE-09 | Small |
| Idempotency key on create | Duplicate prevention | SALE-06 | Small |
| Concurrent sale safety (optimistic lock or serializable) | Oversell prevention | SALE-08, INV-05 | Large |
| Frontend: create sale, view sales list | User workflow | STK-01 | Medium |

**Acceptance criteria:**
- Sale creates SaleItem rows with `unitCost` = product's `costPrice` at that moment
- Selling qty > stockQty → 422; no Sale, SaleItem, or StockMovement created
- Two concurrent requests for last unit → exactly one succeeds; one fails with 422
- `total = subtotal − discount`; verified by calculation

---

### 3.8 Customers, Suppliers, and Payments

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Customer CRUD with opening balance | Receivables tracking | CSP-01, CSP-02 | Small |
| Supplier CRUD with opening balance | Payables tracking | CSP-03, CSP-04 | Small |
| Record customer payment (direction IN) | Reduce receivable | CSP-05 | Small |
| Record supplier payment (direction OUT) | Reduce payable | CSP-06 | Small |
| Partial payments | Realistic business flows | CSP-07 | Small |
| All payment methods (CASH, BKASH, NAGAD, etc.) | Local payment landscape | CSP-08 | Small |
| Idempotency key on payments | Duplicate prevention | CSP-09 | Small |
| Frontend: customer list, supplier list, payment entry | User workflow | STK-01 | Medium |

---

### 3.9 Expenses

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Record expense by free-text category | Operating cost tracking | EXP-01, EXP-02 | Small |
| Date filter on expense list | Period analysis | EXP-02 | Small |
| Frontend: expense entry and list | User workflow | STK-01 | Small |

---

### 3.10 Reports and Dashboard

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Revenue = sum of COMPLETED sale totals in period | P&L statement | RPT-01 | Medium |
| COGS using SaleItem.unitCost snapshots (not current cost) | Accurate profit | RPT-02, RPT-10 | Medium |
| Gross profit and net profit | Business health | RPT-03, RPT-04 | Small |
| Customer receivables (openingBalance + sales − payments) | Outstanding dues | RPT-05 | Medium |
| Supplier payables (openingBalance + purchases − payments) | Outstanding payables | RPT-06 | Medium |
| Stock valuation (qty × costPrice) | Asset reporting | RPT-07 | Small |
| Date range filter in Asia/Dhaka timezone | Period accuracy | RPT-08 | Medium |
| Dashboard: all cards from real API, no hardcoded values | Assessment requirement | DASH-01 to DASH-08 | Large |
| Loading, error, and empty states on all dashboard cards | UX completeness | DASH-04 to DASH-06 | Medium |
| Charts with real data using Recharts | Visual analytics | STK-06, DASH-07 | Medium |
| TanStack Query cache invalidation on mutations | Data freshness | DASH-08 | Small |

---

### 3.11 AI Stock Advisor

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| Deterministic daily demand estimate (7-day and 28-day averages) | Forecast baseline | AI-01, AI-02 | Medium |
| Reorder point calculation (avgDemand × (leadTime + review) + safetyStock) | Reorder trigger | AI-07 | Medium |
| Suggested order quantity with rounding | Actionable recommendation | AI-09 | Small |
| Edge cases: zero demand, new product, stockout days, outliers | Robustness | AI-03 to AI-06 | Medium |
| Gemini integration (backend only) for Bangla explanation | Assessment AI requirement | AI-10 to AI-13 | Medium |
| Deterministic fallback when Gemini unavailable | Resilience | AI-14, STK-25 | Small |
| Insufficient data flag ("experimental" confidence) | Honest output | AI-18 | Small |
| Frontend: AI advisor panel with recommendations | User workflow | STK-01 | Medium |
| `GEMINI_API_KEY` never in frontend bundle | Security | STK-24, SEC-05 | Small |

---

### 3.12 Public Landing Page

| Feature | Business Value | Assessment Relevance | Effort |
|---|---|---|---|
| `/` with PublicLayout (separate from DashboardLayout) | Assessment requirement | LAND-01, ARCH-04 | Medium |
| Value proposition, features, AI section, FAQ, footer | Marketing and demo | LAND-02 to LAND-04 | Medium |
| Working login / get-started navigation | Onboarding flow | LAND-05 | Small |
| No private data on public page | Security | LAND-06 | Small |

---

### 3.13 Testing (mandatory evidence)

| Feature | Assessment Relevance | Effort |
|---|---|---|
| Unit tests: forecasting edge cases, report calculations, auth hashing | TEST-01 to TEST-04 | Medium |
| Integration tests: sale atomicity, insufficient stock, purchase receive-once, tenant isolation, payment reconciliation | TEST-05 to TEST-09 | Large |
| Frontend tests: form validation, auth state | TEST-10, TEST-11 | Medium |
| All tests run and output observed (not just written) | TEST-12 | Ongoing |

---

### 3.14 Documentation (mandatory for submission)

| Document | Assessment Relevance | Effort |
|---|---|---|
| `README.md` with setup, scripts, architecture, AI limitations, known issues | DOC-01 to DOC-08 | Medium |
| `docs/PRD.md` | DOC-09 | Small |
| `docs/DATABASE.md` (accounting policy, COGS method) | DOC-10 | Small |
| `docs/API.md` | DOC-11 | Small |
| `docs/SECURITY.md` | DOC-12 | Small |
| `docs/TESTING.md` with AI backtesting and MAE | DOC-13 | Medium |
| `docs/DEMO-CHECKLIST.md` | DOC-14 | Small |
| Meaningful git commits throughout | GIT-01 to GIT-04 | Ongoing |

---

## 4. Deferrable Features (Category B)

These add value but can be deferred until the mandatory workflow is stable and tested.

| Feature | Why Deferrable | Risk if Deferred |
|---|---|---|
| Sale void / reversal | Complex stock restoration; edge cases high | Demo incomplete if sales errors occur |
| Purchase return (PURCHASE_RETURN movement) | Less common workflow | Minor gap in movement type coverage |
| Sale return (SALE_RETURN movement) | Complex stock/payment reversal | Minor gap |
| Role-based access control (OWNER vs STAFF vs ACCOUNTANT) | Roles defined in schema but enforcement complex | SEC-09 partially unmet |
| Budget-constrained reorder suggestions | AI enhancement | AI-08 unmet |
| Multi-business per user (selecting active business) | Tenancy feature | UX friction without it |
| Stock low-stock alerts / notifications | Proactive operations | Not assessed |
| Weighted-average cost recalculation on purchase | Accurate COGS over time | Current schema supports it; can start with last-purchase cost |

---

## 5. Optional Enhancements (Category C)

These are explicitly not required for the initial assessment submission.

| Feature | Notes |
|---|---|
| Deployment to cloud (Render, Railway, Fly.io) | Optional per PROMPT.md §1.1 Tooling |
| PDF invoice export | Nice-to-have |
| Barcode / QR scanning | Hardware dependency |
| SMS / email notifications | External service dependency |
| Advanced ML model (ARIMA, Prophet) | Far exceeds assessment scope |
| Multi-currency support | Only BDT required |
| Mobile app | Not in scope |
| Audit log UI | Schema supports it via StockMovement |

---

## 6. Core Business Workflow and Acceptance Criteria

The following end-to-end workflow must be demonstrable from real data:

### Workflow Steps

```
1. Register user → creates user and business in DB
2. Login → receive access + refresh tokens
3. Create categories (e.g., "Rice", "Oil")
4. Create products with SKU, selling price, reorder level
5. Set opening stock (OPENING StockMovement)
6. Create a purchase (DRAFT) → receive it → stock increases
7. Create a sale → stock decreases → cost snapshot recorded
8. Pay a supplier (OUT) → payable reduces
9. Receive payment from customer (IN) → receivable reduces
10. Record an operating expense
11. View dashboard: revenue, COGS, profit, stock value, receivables, payables — all from API
12. View AI advisor: reorder recommendations based on sales history
13. View inventory movements: full audit trail
```

### End-to-End Acceptance Criteria

| Step | Evidence Required |
|---|---|
| Register | 201 response; user row in DB; password is hash not plaintext |
| Login | Token pair returned; protected endpoint accepts access token |
| Product/Category | Records in DB; list endpoint returns them; archive removes from default list |
| Opening stock | StockMovement type=OPENING created; stockQty updated |
| Purchase receive | stockQty before < stockQty after; StockMovement type=PURCHASE exists |
| Sale | stockQty reduced; SaleItem.unitCost = product.costPrice at time of sale |
| Insufficient stock | stockQty unchanged; no orphaned records; 422 returned |
| Payments | Receivable/payable balance changes correctly |
| Dashboard | All cards return non-hardcoded values; verified by changing data |
| AI advisor | Numeric recommendations from deterministic code; Gemini only adds text |
| Movements | Chronological list; balanceAfter chain is consistent |

---

## 7. Dependency Map

### Dependency Table

| Module | Hard Dependencies (must exist first) | Soft Dependencies (improves when available) |
|---|---|---|
| Foundation (packages, main.ts) | Node.js, npm | — |
| Prisma schema + migration | Foundation | — |
| ConfigModule + env validation | Foundation | — |
| Auth module | Foundation, Prisma, ConfigModule | — |
| Business/tenancy scope | Auth | — |
| Categories | Auth, Business/tenancy | — |
| Products | Auth, Categories | — |
| Inventory service | Auth, Products, Prisma transactions | — |
| Purchases | Auth, Products, Inventory service | Suppliers |
| Sales | Auth, Products, Inventory service | Customers |
| Customers | Auth | Sales (for receivables) |
| Suppliers | Auth | Purchases (for payables) |
| Payments | Auth, Customers, Suppliers, Sales, Purchases | — |
| Expenses | Auth | — |
| Reports | Auth, Sales, Purchases, Payments, Expenses | — |
| Dashboard API | Reports | — |
| AI forecasting | Sales (history), Products | — |
| Gemini integration | AI forecasting, ConfigModule | — |
| Frontend foundation | Frontend packages, Vite | Backend running |
| Frontend auth | Frontend foundation | Auth API |
| Frontend dashboard | Frontend auth | Dashboard API, Reports API |
| Frontend AI advisor | Frontend auth | AI advisor API |
| Tests (unit) | Relevant service | — |
| Tests (integration) | All modules under test, test DB | — |
| Documentation | All implemented modules | — |

### Recommended Implementation Sequence

```
Phase A — Foundation (prerequisite for all)
  1. Declare dependencies in backend/package.json → npm install
  2. Create backend/src/main.ts + app.module.ts (Fastify, Helmet, CORS, throttler, Swagger)
  3. ConfigModule with env validation (startup fails on missing required vars)
  4. Prisma database module + first migration
  5. Health endpoint GET /health
  6. Scaffold frontend: Vite + React + TypeScript + Tailwind v4
  7. First git commit

Phase B — Authentication
  8. Auth module: register, login, logout, refresh
  9. JWT guard, CurrentUser decorator
  10. Business creation on register
  11. Frontend: login page, register page, token storage, route guard
  12. Auth integration tests (tenant isolation, token rotation, logout)
  13. Git commit

Phase C — Core Catalog
  14. Categories CRUD + pagination
  15. Products CRUD + search + pagination + archive
  16. Frontend: product list, create/edit form, category selector
  17. Git commit

Phase D — Inventory
  18. Inventory service: opening stock, adjustments, movement ledger
  19. Negative stock guard
  20. Frontend: stock view, movement history
  21. Git commit

Phase E — Purchases
  22. Purchases module: create draft, receive (atomic), cancel
  23. Counter util for PO-XXXX numbers
  24. Suppliers CRUD
  25. Frontend: purchase create, receive goods
  26. Purchase integration tests
  27. Git commit

Phase F — Sales
  28. Sales module: create with atomic stock deduction, cost snapshot
  29. Insufficient stock → 422
  30. Concurrent sale safety
  31. Customers CRUD
  32. Idempotency on sale create
  33. Frontend: sale/checkout form
  34. Sale integration tests (atomicity, oversell)
  35. Git commit

Phase G — Payments and Expenses
  36. Payments module (IN/OUT)
  37. Expenses module
  38. Frontend: payment entry, expense entry
  39. Git commit

Phase H — Reports and Dashboard
  40. Reports service: revenue, COGS, profit, receivables, payables, stock value
  41. Dashboard API endpoint aggregating key metrics
  42. Frontend: dashboard with all cards from real API
  43. Recharts for revenue trend chart
  44. Loading / error / empty states
  45. Git commit

Phase I — AI Advisor
  46. Forecasting service: daily demand, reorder point, suggested qty
  47. Edge cases and fallback
  48. Gemini service (backend only) for Bangla explanation
  49. Frontend: AI advisor panel
  50. Unit tests for forecasting edge cases
  51. Git commit

Phase J — Public Landing Page
  52. PublicLayout separate from DashboardLayout
  53. Landing page sections (hero, features, AI explanation, FAQ, footer)
  54. Navigation to login/register
  55. Git commit

Phase K — Quality and Documentation
  56. Run all tests; observe and record output
  57. Fix all failing tests before proceeding
  58. Write README, docs/PRD.md, DATABASE.md, API.md, SECURITY.md, TESTING.md, DEMO-CHECKLIST.md
  59. Final build verification: both apps
  60. Final git commit and tag
```

---

## 8. Prioritized Risk Register

| RISK-ID | Description | Probability | Impact | Priority | Early Warning | Mitigation | Verification |
|---|---|---|---|---|---|---|---|
| R-01 | Requirements misunderstood — feature built incorrectly | Medium | High | P1 | Traceability gaps; feature doesn't match test criteria | Review ASSESSMENT-TRACEABILITY.md before each module; ask mentor early | Integration test passes with correct behaviour |
| R-02 | Scope creep — optional features built before core works | High | High | P1 | Core workflow steps not yet passing; time pressure | Strict adherence to Phase A–K sequence; no optional work until Phase H is stable | Core workflow demo succeeds before Phase I starts |
| R-03 | Concurrent sales causing oversell | Medium | High | P1 | No test for concurrency; only single-request tests | Use Prisma `$transaction` with serializable isolation or optimistic lock + retry on stock check | Concurrent test: two requests for last unit; only one returns 201 |
| R-04 | Stock calculation errors — incorrect `balanceAfter` or `stockQty` | Medium | High | P1 | Manual spot-check fails; ledger doesn't reconcile | All stock changes in single transactions; unit tests with known inputs; spot-check with seed data | balanceAfter chain verified from opening to current |
| R-05 | Financial totals incorrect — COGS using today's cost instead of snapshot | Medium | High | P1 | Report changes after product price edit | Always read `SaleItem.unitCost`, never `Product.costPrice` in report queries | Edit costPrice; old sale report unchanged — verified manually |
| R-06 | Authentication vulnerability — weak hashing, token not revoked | Low | Critical | P1 | Hash in DB is recognizable plaintext; refresh still valid after logout | Use Argon2id with default params; revoke refresh token row on logout; family-rotation on refresh | DB inspection shows hash prefix (e.g., `$argon2id`); post-logout refresh → 401 |
| R-07 | Business data isolation failure (IDOR) | Low | Critical | P1 | User A can see User B's products in API response | Every service query includes `WHERE businessId = currentBusinessId`; integration test | Isolation test observed passing |
| R-08 | AI output presented as authoritative fact | Medium | High | P1 | LLM response used directly for reorder qty or financial figures | Numeric values from deterministic service only; Gemini adds Bangla text explanation only | Code review: report/reorder numbers never come from Gemini response |
| R-09 | `package.json` has no dependencies — entire setup blocked | Verified | Critical | P1 | Already confirmed in Phase 01 | Immediate action: declare and install all packages | `npm ls --depth=0` shows all packages; `npm run build` exits 0 |
| R-10 | Prisma migration destructive or incompatible | Low | High | P2 | Migration alters existing data columns | Never run destructive migrations without approval; test on fresh DB | `prisma migrate deploy` on empty DB succeeds; `prisma migrate status` clean |
| R-11 | Insufficient historical data for AI forecasting | High | Medium | P2 | Less than 7 days of sales data in seed | Label recommendations "experimental" when < 7 days of data; seed provides at least 30 days | AI response includes `confidence: "experimental"` for new products |
| R-12 | Gemini API unavailable or rate-limited | Medium | Low | P2 | Gemini returns error; response is null or malformed | Backend catches all Gemini errors; returns deterministic result + null explanation | Kill Gemini key; advisor still returns numeric recommendations |
| R-13 | Inadequate test coverage — critical paths untested | High | High | P2 | `npm test` passes but critical scenarios not covered | Write tests for sale atomicity, oversell, receive-once, tenant isolation before claiming pass | Test coverage report reviewed; integration tests for each critical invariant |
| R-14 | Frontend token storage insecure | Medium | High | P2 | Tokens in localStorage; XSS can read them | Use httpOnly cookie or in-memory storage with refresh via httpOnly cookie | Inspect localStorage in browser — no tokens; network tab shows httpOnly cookie |
| R-15 | No meaningful git commits | High | Medium | P2 | Single large commit at end; history unclear | Commit at end of each implementation phase with descriptive message | `git log --oneline` shows per-phase commits |
| R-16 | Deployment not verified | Medium | Medium | P3 | README claims deployed; URL doesn't work | Do not claim deployment unless URL observed live | Only document deployment if URL is verified and stable |
| R-17 | Assessment independence violation | Low | Critical | P1 | AI generates complete feature; developer cannot explain it | Use AI only for planning, review, debugging; implement every file independently | Developer explains every file in demo; commit history shows incremental work |
| R-18 | Documentation incomplete or inaccurate | Medium | High | P3 | README steps fail on clean machine; Swagger wrong | Write docs against running code; test setup steps on clean env | Reviewer follows README from zero and succeeds |

---

## 9. AI/ML Scope and Evaluation Plan

### What the AI Advisor Must Do (MVP)

**Inputs required (from real database):**
- `SaleItem` rows for the product: date, qty sold
- Current `Product.stockQty`
- `Product.leadTimeDays` (default 3)
- `Product.reorderLevel`
- Review period (configurable, default 7 days)

**Algorithm (deterministic — no LLM involved):**

```
Step 1: Gather sales for last 28 days (excluding void sales)
Step 2: Compute 7-day average daily demand = sum(qty sold in last 7 days) / 7
Step 3: Compute 28-day average daily demand = sum(qty sold in last 28 days) / 28
Step 4: Use the more conservative (higher) estimate as forecastDailyDemand
Step 5: Safety stock = forecastDailyDemand × safetyDays (e.g., 2)
Step 6: Reorder point = forecastDailyDemand × (leadTimeDays + reviewPeriod) + safetyStock
Step 7: Days of stock remaining = currentStock / max(forecastDailyDemand, 0.001)
Step 8: Suggested order qty = max(0, reorderPoint - currentStock)  [rounded to nearest unit]
Step 9: Stockout risk flag if daysRemaining < leadTimeDays
```

**Outputs:**
- `forecastDailyDemand: number`
- `reorderPoint: number`
- `suggestedOrderQty: number`
- `daysOfStockRemaining: number`
- `stockoutRisk: boolean`
- `confidence: "sufficient" | "low" | "experimental"`
- `dataPointsUsed: number`
- `explanation: string | null` (populated by Gemini in Bangla if available)

**Edge case handling:**

| Scenario | Handling |
|---|---|
| No sales history | `forecastDailyDemand = 0`; `suggestedOrderQty = reorderLevel`; `confidence = "experimental"` |
| Less than 7 days of data | Use available days; `confidence = "low"` |
| Stockout days in history | Do not count stockout days as zero demand; calculate demand from days with stock |
| Outlier (day with 10x normal) | Cap daily demand at median × 3 to reduce outlier impact (documented assumption) |
| `currentStock <= 0` | `daysOfStockRemaining = 0`; immediate stockout risk |

### Gemini Integration (MVP)

- Called **after** deterministic calculation completes
- Receives: product name, forecastDailyDemand, reorderPoint, suggestedOrderQty, confidence, dataPointsUsed
- Returns: Bangla language explanation (string)
- Validated: response is a non-empty string; if invalid, fallback = null
- Timeout: `GEMINI_TIMEOUT_MS` (default 10000ms)
- If unavailable: `explanation = null`; numeric outputs unchanged

### Backtesting and Evaluation

**Method (chronological — no data leakage):**

```
For each product with >= 30 days of sales history:
  For each evaluation day d from day 15 to last day:
    Train: use sales from day 1 to day d-1
    Predict: forecastDailyDemand for day d
    Actual: actual_qty_sold on day d
    Error: |predicted - actual|
MAE = mean(all errors)

Baseline: 7-day simple average (predict tomorrow = avg of last 7 days)
Compare: model MAE vs baseline MAE
```

**Minimum data requirement:** 30 days of sales history per product for backtesting. Products with less data are labelled "experimental."

**Result reporting:**
- Report actual MAE value computed from real seed or production data
- Report sample size (number of products, number of evaluation days)
- Report baseline MAE for comparison
- If MAE ≤ baseline MAE: model provides value; if not, document honestly

**Known limitations to document:**
1. Simple averaging does not capture seasonality or trends
2. Stockout days in history underestimate true demand
3. Results are product-level; no cross-product correlation
4. Performance degrades with very low sales volume (< 1 unit/day)
5. Recommendations are estimates, not guaranteed quantities

---

## 10. Recommended Implementation Phases

| Phase | Work | Relative Effort | Produces |
|---|---|---|---|
| A | Foundation: packages, NestJS+Fastify, config, Prisma migration, health, Swagger, frontend scaffold | Medium | Both apps start; DB connected |
| B | Authentication: register, login, refresh, logout, guards, frontend auth | Medium | Secure login/logout; protected routes |
| C | Catalog: categories, products CRUD, frontend product list | Medium | Products viewable in browser |
| D | Inventory: opening stock, adjustments, movement ledger | Small | Stock levels visible |
| E | Purchases: draft, receive (atomic), cancel, suppliers | Medium | Goods receipt works |
| F | Sales: checkout (atomic, oversell-safe, cost snapshot), customers | Large | Core revenue workflow |
| G | Payments and expenses | Small | Financial flows complete |
| H | Reports + dashboard (from real data, no hardcoded values) | Large | Assessment core demo ready |
| I | AI advisor: deterministic forecast, Gemini explanation, frontend panel | Medium | AI requirement satisfied |
| J | Public landing page | Small | Separate public/dashboard layouts |
| K | Testing, documentation, final build verification, git history | Medium | Submission ready |

**Critical path:** A → B → C → D → E → F → G → H (everything else depends on Phases A–H being stable)

**Minimum demo-ready milestone:** Phases A through H complete with passing integration tests. Phases I–K then add AI, landing page, and polish.

---

## 11. Definition of MVP Completion

The MVP is complete when ALL of the following are true:

- [ ] Both apps (`frontend/` and `backend/`) start from a clean clone using README instructions
- [ ] `npm run typecheck` exits 0 on both
- [ ] `npm run build` exits 0 on both (observed output saved)
- [ ] `npm test` exits 0 on backend with observed output for: auth, sale atomicity, insufficient stock, receive-once, tenant isolation
- [ ] End-to-end workflow (Section 6) demonstrated with real seed data
- [ ] Dashboard metrics change when underlying data changes
- [ ] AI advisor returns numeric recommendations when Gemini key is empty (fallback verified)
- [ ] No hardcoded mock values in production code paths
- [ ] No secrets in `git log --all`
- [ ] `prisma migrate deploy` succeeds on a fresh database
- [ ] README setup steps verified on a clean environment
- [ ] Developer can explain every file in the repository

---

## 12. Open Questions and Assumptions

| ID | Question / Assumption | Impact | Decision Needed By |
|---|---|---|---|
| OQ-01 | JWT strategy: httpOnly cookies (requires CORS credentials) or Authorization header? | AUTH-09, SEC-03 | Before Phase B |
| OQ-02 | Refresh token: single token or family invalidation on compromise? | AUTH-05 | Before Phase B |
| OQ-03 | Which actions are OWNER-only vs STAFF-allowed? (e.g., can STAFF create products?) | SEC-09 | Before Phase C |
| OQ-04 | Sale void: restore stock? What if stock already sold onward? | SALE-07 | Before Phase F |
| OQ-05 | COGS: weighted-average (schema suggests) or last-purchase cost? | RPT-02, DOC-10 | Before Phase H |
| OQ-06 | Voided sales: excluded from revenue in reports? | RPT-01 | Before Phase H |
| OQ-07 | Accounting for returns in revenue and COGS | RPT-09 | Before Phase H |
| OQ-08 | `ASSUMED`: One user creates one business on registration; additional business creation deferred | ARCH scope | Confirm |
| OQ-09 | `ASSUMED`: Safety stock = forecastDailyDemand × 2 days (fixed); not variability-based | AI-07 | Confirm |
| OQ-10 | `ASSUMED`: Weighted-average cost policy for COGS (stored in schema as costPrice) | RPT-02 | Confirm |
| OQ-11 | `ASSUMED`: Voided sales excluded from all revenue and COGS calculations | RPT-01 | Confirm |
| OQ-12 | Does the assessment provide a specific deadline? Current plan assumes adequate time for Phases A–K. | All | Confirm |

---

## 13. Recommended Next Step

**Prompt 04 — PRD Review**

Before writing any code, resolve the open questions above and create `docs/PRD.md` defining:
- User roles and their permissions (resolves OQ-03)
- All application routes (public and authenticated)
- Acceptance criteria per feature
- Out-of-scope items
- Accounting policy decisions (resolves OQ-05, OQ-06, OQ-07)
- Token strategy decision (resolves OQ-01, OQ-02)

Alternatively, if time pressure is acute, proceed directly to **Phase A implementation** (Prompt 08 — Environment and Secrets, Prompt 09 — Dependencies and Baseline, Prompt 10 — Backend Foundation) while keeping this document as the implementation reference.

**Do not begin implementation until this scope document is reviewed and approved.**

---

## 14. Files Created or Modified in This Prompt

| File | Action |
|---|---|
| `docs/SCOPE-AND-RISKS.md` | Created (this document) |
| `docs/ASSESSMENT-TRACEABILITY.md` | Not modified |
| Application source code | Not modified |
| Database files | Not modified |

---

*Stop. Awaiting developer review and approval of this scope document before proceeding to Prompt 04 or any implementation work.*
