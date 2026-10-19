# SmartStock — Practical Assessment Submission Package

> **Organization:** NT TECH INNOVATION  
> **Position:** Full Stack Developer  
> **Candidate Name:** Siam Ahmed  
> **Submission Date:** 19 October 2026  
> **Submission Contact (WhatsApp):** 01945411140  
> **Repository:** https://github.com/engsiam/smartStock.git 

---

## 1. Executive Summary

**SmartStock** is an enterprise-grade, full-stack inventory management and Point-of-Sale (POS) platform engineered specifically for retail and wholesale SMEs in Bangladesh (grocery stores, supermarkets, FMCG distributors).

It bridges the gap between manual cash-register operations and automated inventory control by providing:
1. **High-Speed Point-of-Sale (POS):** Multi-channel payments (**Cash, bKash, Nagad, Card, Credit**) in **Bangladeshi Taka (BDT ৳)** with poysha precision, instant thermal receipt formatting, and automatic stock decrements.
2. **Atomic Inventory Ledger:** Strict transactional integrity (`tx.sale`, `tx.purchase.receive`, `tx.product.adjust`) with immutable stock movement tracking preventing race conditions and negative inventory drift.
3. **Dynamic Cloud & Supabase Connectivity:** Full dual-connection architecture (`DATABASE_URL` for high-throughput connection pooling via port 6543, `DIRECT_URL` for migrations via port 5432) allowing seamless transition between local PostgreSQL and **Supabase Cloud**.
4. **AI Demand Forecasting & Reorder Advisor:** A hybrid architecture combining a deterministic 30-day velocity safety-stock formula with **Google Gemini 2.5 Flash** for natural-language advisory in **Bangla (বাংলা)** and English, equipped with **1-Click Purchase Order Drafting**.

---

## 2. Technology Stack & Architectural Decisions

### Frontend (`frontend/`)
- **Core Framework:** React 19 + TypeScript + Vite 6
- **Styling:** Vanilla Tailwind CSS v4 design system (dark glassmorphic UI, responsive layouts, accessibility compliant)
- **Routing:** React Router v7 with split layout architecture (Public Landing Page vs. Authenticated Workspace Shell)
- **State & Server Cache:** TanStack Query v5 with optimistic updates and targeted query invalidation
- **Charts & Data Visualization:** Recharts (Revenue trend area charts, Category inventory valuation bars)
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library (Unit tests for formatters, POS cart math, and components)

### Backend (`backend/`)
- **Framework:** Node.js + NestJS 11 with **Fastify 5 adapter** (delivering up to 2x HTTP throughput and lower memory footprint compared to default Express)
- **Database & ORM:** PostgreSQL 16 + Prisma ORM v6 with dual connection strings (`url` + `directUrl`)
- **Security & Hardening:**
  - Password hashing with **Argon2id** (memory-hard, resistant to GPU attacks)
  - JWT Authentication with token rotation (`7d` access, `30d` refresh) and automatic frontend token refresh interceptors
  - `@fastify/helmet` CSP security headers, CORS origin protection, and `@nestjs/throttler` rate limiting
  - Strict input validation via `class-validator` and `class-transformer` with `whitelist: true`
- **AI Integration:** `@google/genai` (Gemini 2.5 Flash) with deterministic safety stock fallback and chronological backtesting suite
- **Testing:** Jest (Unit tests for forecasting & controllers; integration tests for tenant data isolation and atomic stock transactions)

---

## 3. Seeded Demo Accounts (Ready to Test)

The system includes pre-seeded realistic Bangladeshi FMCG products (Ispahani Mirzapore Tea, Teer Soybean Oil, Miniket Rice, Radhuni Turmeric, Pran Frooto) and 3 role-based accounts:

| Role | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **👑 Business Owner** | `owner@smartstock.local` | `Password123!` | Complete administrative access, team management, voiding invoices, financial overview |
| **🧑‍💼 Sales / Store Staff** | `staff@smartstock.local` | `Password123!` | POS terminal checkout, barcode/product search, receiving purchase orders |
| **📊 Accountant** | `accountant@smartstock.local` | `Password123!` | Stock movement ledger audits, COGS tracking, margin analytics, financial reports |

*Default Store:* **Dhaka Grocery & General Store** (`biz_dhaka_grocery_01`)

---

## 4. Key Functional Highlights

1. **Point of Sale (POS) & Checkout:**
   - Real-time search across products by Name, SKU, or Barcode.
   - Out-of-stock prevention: cart automatically bounds quantities to available inventory.
   - Dual payment support (Cash, bKash, Nagad, Card, Bank, Credit) with change due calculation.
   - Instant printable thermal receipt modal with invoice sequence (`INV-0001`).

2. **Inventory Catalog & Auditing:**
   - Filter by Category, Low-Stock threshold, or keyword.
   - Real-time stock adjustment modal (`Stock In (+)` / `Stock Out (-)`) with mandatory audit reason logging.
   - Side-drawer audit ledger showing complete history of balance transitions ($A \rightarrow B$).

3. **Purchase Orders & Goods Receiving:**
   - Multi-item Purchase Order drafting (`PO-0001`).
   - Atomic Goods Receipt: automatically recalculates the moving weighted-average cost price ($WAC$) for products upon receiving deliveries.

4. **AI Reorder Advisor & Demand Forecasting:**
   - Analyzes 30-day velocity to calculate Reorder Points ($ROP$), Safety Stock buffers ($SS$), and suggested order quantities.
   - Gemini 2.5 Flash natural language restock explanations in **Bangla (বাংলা)** and **English**.
   - Zero LLM dependency: financial numbers and order quantities are computed deterministically, with Gemini providing natural language context.
   - **1-Click PO generation** directly from AI recommendations.

5. **Financial & Dashboard Analytics:**
   - Dynamic real-time revenue, estimated COGS, Gross Profit, and Gross Margin (%) in BDT.
   - Category distribution valuation and today's sales breakdown.

---

## 5. Verification & Test Evidence

All test suites and production builds pass with zero defects:

| Component | Command | Result |
| :--- | :--- | :---: |
| **Backend Tests** | `npm test` (Jest) | **4/4 suites passed (6 tests)** |
| **Backend Typecheck** | `npm run typecheck` | **0 errors** |
| **Backend Build** | `npm run build` | **Compiled successfully (`dist/`)** |
| **AI Evaluation Benchmark** | `npm run eval:ai` | **Passed (MAE: 2.43 units, 19% better than SMA-7)** |
| **Frontend Tests** | `npm test` (Vitest) | **2/2 test files passed (4 tests)** |
| **Frontend Typecheck** | `npm run typecheck` | **0 errors** |
| **Frontend Production Build** | `npm run build` | **Built in 8.31s with Vite** |

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v20+ or v22+)
- PostgreSQL 16 (or Supabase credentials)

### Backend Setup
```bash
cd backend
npm install
# Configure backend/.env (or use preconfigured defaults)
npx prisma migrate deploy
npm run seed
npm run dev # or npm run start:dev
```
- API Endpoint: `http://localhost:3000/api`
- Health Probe: `http://localhost:3000/health`
- Swagger Documentation: `http://localhost:3000/api/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 7. Submission Message for WhatsApp (01945411140)

```text
Dear NT TECH INNOVATION Team,

Please find my practical assessment submission for the Full Stack Developer position:

• Candidate: Siam Ahmed
• Project: SmartStock — AI-Powered Inventory & POS Management System for Bangladesh SMEs
• Submission Date: 19 October 2026
• GitHub Repository: [INSERT_YOUR_GITHUB_REPO_URL]

Key Highlights:
1. Full Stack Architecture: React 19 + TypeScript + Vite + Tailwind CSS v4 on Frontend; NestJS 11 + Fastify + PostgreSQL 16 + Prisma v6 on Backend.
2. Local & Supabase Cloud Ready: Dual-connection pooling (directUrl + url) supporting seamless local PostgreSQL and Supabase Cloud deployment via .env.
3. POS & Inventory Ledger: Real-time checkout (Cash, bKash, Nagad), printable thermal receipts, and atomic stock movements with moving weighted-average costing.
4. AI Reorder Advisor: Deterministic safety-stock forecasting evaluated via chronological backtesting (MAE: 2.43) + Google Gemini 2.5 natural language explanations in Bangla & English with 1-Click PO drafting.
5. Production Quality: 100% tests passing (Jest & Vitest), clean TypeScript compilation, and comprehensive documentation in README.md and docs/.

Demo Credentials:
- Owner: owner@smartstock.local / Password123!
- Staff: staff@smartstock.local / Password123!
- Accountant: accountant@smartstock.local / Password123!

I look forward to discussing the architecture and implementation with you.

Best regards,
Siam Ahmed
Phone / WhatsApp:01742080475
```
