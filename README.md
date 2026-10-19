# SmartStock — AI-Powered Inventory & POS Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify_5-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **Practical Assessment Submission:** NT TECH INNOVATION — Full Stack Developer  
> **Candidate:** Siam Ahmed  
> **Target Audience:** Retail & Wholesale SMEs in Bangladesh (Grocery, Supermarkets, FMCG Distributors)  
> **Currency:** Bangladeshi Taka (BDT ৳) with poysha precision  
> **Evaluation Date:** 19 October 2026  
> **Repository:** https://github.com/engsiam/smartStock  

---

## 1. Project Overview & Problem Solved

Traditional retail and wholesale grocery businesses in Bangladesh (*mudir dokan*, supermarkets, and consumer goods wholesalers) face severe operational inefficiencies:
1. **Stockouts & Overstocking:** Businesses frequently stock out of fast-moving consumer goods (tea, edible oils, rice) or tie up critical working capital in slow-moving inventory.
2. **Loss of Margin Visibility:** Product costs fluctuate constantly with supplier deliveries, but shops lack moving weighted-average cost tracking, resulting in inaccurate gross profit calculations.
3. **Manual Bookkeeping & Audit Vulnerability:** Sales, inventory adjustments, and returns are often unrecorded or tracked on paper without an immutable audit trail.

**SmartStock** solves these challenges by combining:
- A high-speed **Point of Sale (POS)** terminal supporting Bangladeshi payment channels (**Cash, bKash, Nagad, Card, Credit**) and instant thermal receipt generation.
- An **atomic inventory ledger** recording every stock movement with signed adjustments (`SALE`, `PURCHASE_RECEIVE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `SALE_RETURN`).
- An **AI Reorder Advisor** combining deterministic 30-day velocity safety-stock formulas with **Google Gemini 2.5 Flash** for actionable natural language explanations in **Bangla (বাংলা)** and **English**, complete with **1-Click Purchase Order drafting**.
- **Dynamic Database Architecture:** Full dual-connection pooling (`DATABASE_URL` + `DIRECT_URL`) supporting local PostgreSQL as well as **Supabase Cloud** deployment seamlessly via `.env`.

---

## 2. Technology Stack

### Frontend (`frontend/`)
- **Core Framework:** React 19 + TypeScript + Vite 6
- **Styling:** Tailwind CSS v4 (Glassmorphic dark design system)
- **Routing:** React Router v7 (separate Public Landing and Authenticated Workspace layouts)
- **Server State:** TanStack Query v5 (automatic query invalidation, background refetching, and caching)
- **Visual Analytics:** Recharts (Revenue trend area charts & category distribution bar charts)
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library

### Backend (`backend/`)
- **Runtime & Framework:** Node.js + NestJS 11 + Fastify 5 adapter (maximum throughput and low overhead)
- **Database & ORM:** PostgreSQL 16 + Prisma ORM v6 (with `directUrl` for Supabase pooler compatibility)
- **Authentication & Security:** Argon2id password hashing, JWT token rotation (`7d` access / `30d` refresh), `@fastify/helmet` security headers, and rate limiting (`@nestjs/throttler`)
- **Validation:** `class-validator` + `class-transformer` with strict whitelist enforcement
- **Documentation:** Interactive OpenAPI / Swagger UI
- **AI / ML Integration:** `@google/genai` (Gemini 2.5 Flash) with deterministic rule-based fallback and chronological backtesting evaluation script
- **Testing:** Jest (Unit & Integration test suites)

---

## 3. Seeded Demo Accounts (1-Click Login Ready)

The database comes pre-seeded with realistic Bangladeshi FMCG products (Ispahani Tea, Teer Soybean Oil, Miniket Rice, ACI Pure Salt, Pran Frooto) and 3 role-based demo accounts:

| Persona | Name | Role | Email | Password | Scope & Permissions |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **👑 Owner** | Siam Ahmed | `OWNER` | `owner@smartstock.local` | `Password123!` | Full admin access, settings, team management, void sales |
| **🧑‍💼 Staff** | Karim Ullah | `STAFF` | `staff@smartstock.local` | `Password123!` | POS terminal checkout, stock lookup, receiving goods |
| **📊 Accountant** | Nasreen Sultana | `ACCOUNTANT` | `accountant@smartstock.local` | `Password123!` | Financial overview, stock movement ledger, export reports |

*Default Business:* **Dhaka Grocery & General Store** (`biz_dhaka_grocery_01`)

---

## 4. Quickstart Guide (Local Execution)

### Prerequisites
- **Node.js:** v20.x or v22.x
- **PostgreSQL:** v16.x running on `localhost:5432` with user `smartstock` (or configured via Supabase in `backend/.env`)

### Backend Setup
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment (copy .env.example)
cp .env.example .env

# 3. Apply Prisma migrations and seed database
npx prisma migrate deploy
npm run seed

# 4. Start backend development server
npm run dev
```
- API Base URL: `http://localhost:3000/api`
- Health Probe: `http://localhost:3000/health`
- Swagger Docs: `http://localhost:3000/api/docs`

### Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
- Access application at: **`http://localhost:5173`**

---

## 5. Automated Verification & Testing Commands

All approved test and build commands are fully operational:

| Application | Command | Description | Observed Result |
| :--- | :--- | :--- | :---: |
| **Backend** | `npm run typecheck` | TypeScript compilation check | **0 errors** |
| **Backend** | `npm run lint` | ESLint static code analysis | **0 errors** |
| **Backend** | `npm test` | Complete Jest test suite (unit + integration) | **4/4 suites passed (6 tests)** |
| **Backend** | `npm run eval:ai` | Chronological AI backtesting & MAE benchmark | **0 errors (MAE: 2.43)** |
| **Backend** | `npm run build` | Production NestJS compilation | **0 errors (`backend/dist/`)** |
| **Frontend** | `npm run typecheck` | TypeScript typecheck (`tsc -b`) | **0 errors** |
| **Frontend** | `npm run lint` | ESLint static analysis | **0 errors, 0 warnings** |
| **Frontend** | `npm test` | Vitest unit test suite | **2/2 files passed (4 tests)** |
| **Frontend** | `npm run build` | Production Vite bundle build | **Built in 8.31s** |

---

## 6. AI / ML Feature & Evaluation Report

### Practical Problem
Predict daily replenishment demand for fast-moving consumer items without exposing the store to stockouts or tying up unnecessary capital in excess inventory.

### Model Architecture
1. **Deterministic Core:**
   - **Daily Sales Velocity ($V$):** $\frac{\sum_{t=1}^{30} \text{units sold}_t}{30}$
   - **Lead-Time Demand ($LTD$):** $V \times \text{LeadTimeDays}$
   - **Safety Stock Buffer ($SS$):** $\lceil V \times \max(2, \text{round}(\text{LeadTimeDays} \times 0.75)) \rceil$
   - **Reorder Point ($ROP$):** $LTD + SS$
   - **Recommended Order Qty:** $\max(0, \lceil V \times 14 \rceil + SS - \text{CurrentStock})$
2. **Generative Natural-Language Layer:**
   - Passes validated metrics to **Google Gemini 2.5 Flash** (`@google/genai`) to produce concise 2-sentence actionable advice in **Bangla (বাংলা)** or English.
   - Strict **timeout protection (10,000ms)** and **zero LLM dependency** for numeric values: if the API key is missing or the external service times out, an instant deterministic Bangla/English advisory is rendered.
   - Financial figures and stock levels are never determined by the LLM.

### Chronological Historical Backtesting (No Data Leakage)
Run command: `npm run eval:ai` in `backend/`

```text
=========================================================================================================
Model / Strategy                                 | MAE (units) | RMSE  | Stockout Risk | Capital Buffer
---------------------------------------------------------------------------------------------------------
SmartStock Weighted Velocity (Production)        | 2.43        | 2.93   | 1 days (3%)   | 14 days cover
Baseline: 7-Day Simple Moving Average (SMA-7)    | 3.00        | 3.98   | 4 days (13%)  | 12 days cover
Baseline: Naive Persistence (Yesterday Demand)   | 4.47        | 5.60   | 6 days (20%)  | 10 days cover
---------------------------------------------------------------------------------------------------------
```

- **Accuracy Improvement:** SmartStock achieved an MAE of **2.43 units** (a **19% improvement** over the standard SMA-7 baseline).
- **Service Level:** 97% of simulated days avoided stockouts while maintaining a lean 14-day working capital buffer.
- **Known Limitations:** Flash demand surges during sudden cultural holidays (e.g., Eid pre-shopping) or severe supplier supply-chain blockages require manual lead-time overrides.

---

## 7. Documentation Index

Detailed engineering documentation is located in the `docs/` directory:
- [PRD.md](docs/PRD.md): Product Requirements, Personas, and User Stories
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): System Architecture, Fastify vs Express, and Multi-Tenancy
- [DATABASE.md](docs/DATABASE.md): Schema, Poysha Decimal Precision, and Weighted-Average Cost Model
- [API.md](docs/API.md): Full REST API Specification & Error Contract
- [SECURITY.md](docs/SECURITY.md): Authentication, RBAC, Helmet, CORS, and Secrets Policy
- [TESTING.md](docs/TESTING.md): QA Testing Strategy, Unit & Integration Suites, and Backtesting Protocol
- [DEMO-CHECKLIST.md](docs/DEMO-CHECKLIST.md): Step-by-Step Live Demonstration Walkthrough
- [SUBMISSION.md](SUBMISSION.md): Candidate Submission Package & Executive Summary

---

## 8. License & Assessment Compliance

This project was built for the **NT TECH INNOVATION Full Stack Developer Practical Assessment**. All business logic, database transactions, and frontend components were independently designed and verified against the assessment guidelines.