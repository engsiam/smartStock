# SmartStock — System Architecture & Design Document

**Document Version:** 1.0  
**Stack:** React 19 + TypeScript + Tailwind v4 + NestJS 11 + Fastify 5 + Prisma 6 + PostgreSQL 16 + Gemini 2.5 Flash  

---

## 1. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|  React 19 SPA (Vite 6, TypeScript, Tailwind CSS v4, Lucide React, Recharts)    |
|                                                                                 |
|  +------------------------+  +-----------------------------------------------+  |
|  |     PublicLayout       |  |               DashboardLayout                 |  |
|  |  - Landing Page        |  |  - Executive Dashboard (Recharts Analytics)   |  |
|  |  - Auth / Login Screen |  |  - Inventory Catalog & Stock Adjustment       |  |
|  |  - API Docs Link       |  |  - POS Checkout & Thermal Invoicing          |  |
|  |                        |  |  - Purchases & Moving-Average Cost Receiving  |  |
|  |                        |  |  - AI Reorder Advisor (Bangla / English)      |  |
|  |                        |  |  - Settings & Tenant RBAC Switcher            |  |
|  +------------------------+  +-----------------------------------------------+  |
+---------------------------------------|-----------------------------------------+
                                        | HTTPS / JSON (Bearer JWT + x-business-id)
                                        v
+---------------------------------------------------------------------------------+
|                                APPLICATION TIER                                 |
|  NestJS 11 Framework on Fastify 5 Adapter (High Throughput, Low Overhead)       |
|                                                                                 |
|  Global Middleware & Interceptors:                                              |
|  - @fastify/helmet: Security headers (CSP, HSTS, X-Content-Type-Options)         |
|  - @nestjs/throttler: Rate limiting (300 requests / 60s)                        |
|  - JwtAuthGuard: Token verification & user extraction                           |
|  - RolesGuard: RBAC role verification (OWNER, STAFF, ACCOUNTANT)                |
|  - Fastify Static: Serves Swagger UI at /api/docs                               |
|                                                                                 |
|  Feature Modules:                                                               |
|  +-------------+  +---------------+  +--------------+  +---------------------+  |
|  | AuthModule  |  | ProductModule |  | SalesModule  |  | PurchasesModule     |  |
|  | - Argon2id  |  | - Stock Ledger|  | - Atomic POS |  | - PO Lifecycle      |  |
|  | - JWT Mint  |  | - Adjustments |  | - Invoicing  |  | - Weighted Avg Cost |  |
|  +-------------+  +---------------+  +--------------+  +---------------------+  |
|  +---------------------+  +--------------------+  +--------------------------+  |
|  | BusinessModule      |  | HealthModule       |  | AiAdvisorModule          |  |
|  | - Financial Overview|  | - /health probe    |  | - Deterministic Forecast |  |
|  | - Team & Customers  |  |                    |  | - Gemini 2.5 Flash (LLM) |  |
|  +---------------------+  +--------------------+  +--------------------------+  |
+---------------------------------------|-----------------------------------------+
                                        | Prisma ORM (Connection Pool, PrismaClient)
                                        v
+---------------------------------------------------------------------------------+
|                                 DATA TIER                                       |
|  PostgreSQL 16 Relational Database Engine                                       |
|  - Schema isolation per tenant (businessId foreign keys & composite indices)    |
|  - ACID Transaction boundaries ($transaction) for atomic checkouts and POs     |
|  - Immutable audit trail (StockMovement ledger)                                 |
|  - Decimal(14,2) precision for all BDT currency and costs                       |
+---------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Decisions

### 2.1 Fastify Adapter vs Express
NestJS runs on top of the **Fastify 5** HTTP engine (`@nestjs/platform-fastify`). Fastify was selected because:
- Provides up to **2x faster throughput** and lower latency than Express under high-frequency point-of-sale loads.
- Native integration with modern Fastify plugins (`@fastify/helmet` and `@fastify/static`).

### 2.2 Multi-Tenant Data Isolation
SmartStock uses a **shared-database, column-isolated tenancy model**:
- Every business account is assigned a unique `businessId`.
- Every domain entity (`Product`, `Category`, `Sale`, `Purchase`, `Supplier`, `Customer`, `StockMovement`, `Counter`) contains a non-nullable `businessId` foreign key.
- Security enforcement: The active tenant is extracted from the authenticated user's session or the verified `x-business-id` header. All database queries strictly scope `where: { businessId }`.

### 2.3 Transactional Consistency & Financial Invariants
1. **Sales Checkout Atomicity:**
   - Validates that every line item has sufficient stock (`stockQty >= requestedQty`).
   - Increments tenant invoice counter (`INV-XXXX`).
   - Inserts `Sale` and `SaleItem` records with historical `unitCost` snapshots.
   - Atomically decrements `stockQty` on `Product`.
   - Inserts negative `StockMovement` entries with `balanceAfter`.
   - Creates `Payment` receipt.
   - All executed within a single `prisma.$transaction`. If any step fails, the entire sale rolls back with zero partial data.

2. **Purchase Receiving & Moving-Weighted Average Cost:**
   - On goods receipt, product unit cost is updated using the weighted average formula:
     $$\text{New Cost} = \frac{(\text{Current Stock} \times \text{Current Cost}) + (\text{Received Qty} \times \text{Received Cost})}{\text{Current Stock} + \text{Received Qty}}$$
   - Prevents duplicate receiving through a status guard check (`PurchaseStatus.RECEIVED`).

3. **AI Reorder Advisor Decoupling:**
   - Financial figures, reorder points, and recommended order quantities are computed **100% deterministically in TypeScript**.
   - The LLM (`Gemini 2.5 Flash`) is strictly isolated as an advisory presentation layer. Under offline conditions or timeouts, an instant rule-based fallback renders without blocking the UI.
