# SmartStock --- Complete Project Blueprint and A-to-Z Agent Prompt Guide

**Project:** SmartStock --- AI-Powered Inventory Management System\
**Assessment:** NT TECH INNOVATION --- Full Stack Developer Practical
Assessment\
**Architecture:** One repository with separate `frontend/` and
`backend/` applications\
**Workflow:** Inspect → Plan → Implement independently → Test → Review →
Fix → Retest → Demonstrate

------------------------------------------------------------------------

# 1. Non-Negotiable Project Decisions

The agent must not invent a different stack or restructure the
repository without discussing the reason and receiving approval.

## 1.1 Required Technology Stack

### Frontend --- `frontend/`

-   React
-   TypeScript
-   Vite
-   Tailwind CSS v4
-   React Router for routing
-   TanStack Query for server-state fetching, caching, and invalidation
-   React Hook Form + Zod for form validation
-   Recharts for analytics charts
-   Lucide React for icons
-   Vitest + React Testing Library for frontend tests

Use compatible, maintained versions and the package manager/lockfile
already present. Do not upgrade or replace major versions without
explaining compatibility and migration impact.

### Backend --- `backend/`

-   Node.js with TypeScript
-   NestJS
-   Fastify adapter
-   PostgreSQL
-   Prisma ORM
-   NestJS ConfigModule for environment configuration
-   class-validator + class-transformer for DTO validation
-   Swagger/OpenAPI for API documentation
-   Helmet and rate limiting using packages compatible with the current
    NestJS/Fastify setup
-   Argon2id or bcrypt for password hashing
-   Vitest or the existing compatible NestJS/Jest test setup for unit
    and integration tests

Choose one test runner per application unless a clear need for more than
one is justified. Confirm compatibility with the actual package versions
before adding packages.

### AI and forecasting

-   Deterministic, self-built forecasting and reorder calculation in the
    backend.
-   Google Gemini API for optional natural-language explanations in
    Bangla.
-   Keep the model ID configurable through `GEMINI_MODEL`; verify the
    currently available model ID in official Google documentation before
    configuring it.
-   Never expose `GEMINI_API_KEY` to the frontend.
-   Forecast and financial calculations must not depend on the LLM
    response.
-   Provide a deterministic fallback when Gemini is unavailable.
-   Evaluate forecasting using chronological historical backtesting,
    MAE, and comparison with a simple baseline.

### Tooling and delivery

-   Git and meaningful commits
-   `.env.example` containing placeholders only
-   Prisma migrations and safe seed data where appropriate
-   README with setup, scripts, architecture, testing, AI evaluation,
    limitations, and troubleshooting
-   Frontend and backend build verification
-   Local execution first; deployment is optional and must not be
    claimed unless verified

## 1.2 Product Decisions

-   Product name: **SmartStock**
-   Target: small shops and grocery businesses in Bangladesh
-   Currency: BDT (৳)
-   UI language: Bangla-first, with English support where practical
-   Public landing page and authenticated application must use separate
    layouts and route groups.
-   Frontend and backend must be in separate directories.
-   All dashboard data must come from real backend APIs and persistent
    database records.
-   Do not use fake dashboard metrics or fake success notifications as
    substitutes for functionality.
-   Implement a coherent MVP before optional features.
-   AI coding assistance must comply with the assessment independence
    policy. The brief prohibits AI-generated project code and copied
    complete solutions. Use the agent for planning, teaching, debugging,
    test design, and reviewing code you write; do not submit an
    AI-generated complete project as your own.

------------------------------------------------------------------------

# 2. Required Folder Structure

The agent must compare the actual repository with this target structure.
Do not blindly overwrite existing work. Explain deviations and request
approval for significant changes.

``` text
smart-stock/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── providers/
│   │   │   ├── routes/
│   │   │   └── router.tsx
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── forms/
│   │   │   ├── feedback/
│   │   │   └── data-display/
│   │   ├── layouts/
│   │   │   ├── PublicLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── features/
│   │   │   ├── landing/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── businesses/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── inventory/
│   │   │   ├── purchases/
│   │   │   ├── sales/
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── payments/
│   │   │   ├── expenses/
│   │   │   ├── reports/
│   │   │   ├── ai-advisor/
│   │   │   └── settings/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── query-client.ts
│   │   │   └── validation/
│   │   ├── types/
│   │   ├── styles/
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── middleware/
│   │   │   ├── pipes/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── config/
│   │   ├── database/
│   │   └── modules/
│   │       ├── health/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── businesses/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── inventory/
│   │       ├── purchases/
│   │       ├── sales/
│   │       ├── customers/
│   │       ├── suppliers/
│   │       ├── payments/
│   │       ├── expenses/
│   │       ├── reports/
│   │       ├── ai-advisor/
│   │       │   ├── forecasting/
│   │       │   ├── llm/
│   │       │   └── dto/
│   │       └── settings/
│   ├── test/
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── PRD.md
│   ├── RND.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   └── DEMO-CHECKLIST.md
├── .gitignore
├── PROMPT.md
└── README.md
```

### Folder-structure rules

-   This is the target architecture, not proof that files already exist.
-   Do not create empty files just to imitate the tree. Create a file
    when it has a defined responsibility.
-   Follow the repository's existing naming conventions unless a
    documented change is approved.
-   Keep business logic out of React components and NestJS controllers.
-   Keep forecasting calculations separate from Gemini API calls.
-   Avoid a monorepo workspace tool unless the current repository
    already uses one or a clear requirement justifies it.
-   Never delete or overwrite existing user code without explicit
    approval.
-   If the repository differs from the target, produce a safe migration
    plan first.

------------------------------------------------------------------------

# 3. How to Use This Guide

1.  Save this document as `PROMPT.md` at the repository root.
2.  Use one numbered prompt at a time.
3.  Start with Phase 01; do not skip discovery.
4.  Wait for the agent's report and review the evidence.
5.  Implement and understand the code yourself in line with the
    assessment rules.
6.  Run tests using scripts that actually exist in the package
    manifests.
7.  Continue only after the current phase's exit criteria are met.
8.  Record unresolved issues as `BLOCKED` or `NOT VERIFIED`; never hide
    them.

## Mandatory agent instructions

Paste at the start of a session:

> You are my senior engineering mentor, architecture reviewer, QA
> advisor, security reviewer, and AI/ML evaluation assistant for
> SmartStock. Follow `PROMPT.md` and the approved project documents.
> First inspect the actual repository. Do not assume files or features
> exist. Use the exact stack and target structure defined in this
> document unless you explain a material problem and obtain my approval.
> Work on one phase at a time. The assessment prohibits AI-generated
> project code and copied complete solutions, so do not generate a
> complete submission or implement entire features on my behalf. Help me
> plan, learn, independently implement, debug, test, and review code I
> provide. Never claim a test, command, feature, or deployment succeeded
> unless the result was observed. Mark unverified items `NOT VERIFIED`.
> Do not skip failing tests, expose secrets, run destructive database
> commands, or rewrite Git history without explicit approval. End every
> phase with evidence, findings, blockers, and exit criteria.

------------------------------------------------------------------------

# 4. A-to-Z Sequential Prompts

## Phase 01 --- Inspect and Plan

### Prompt 01 --- Repository Discovery

> Inspect the repository without modifying files. Report the real folder
> structure, current Git branch and working tree, package managers,
> package scripts, dependencies, entry points, environment files, Prisma
> schema/migrations, tests, and docs. Do not print secret values.
> Distinguish verified facts from assumptions. List missing and broken
> items.

**Exit:** The repository state is documented and no files were changed.

### Prompt 02 --- Assessment Traceability

> Read the assessment brief and existing project docs. Create a
> requirements matrix with requirement ID, assessment criterion,
> expected behavior, frontend area, backend module, database dependency,
> security rule, required test, priority, and status. Use only
> `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `PASS`, `FAIL`, and
> `NOT VERIFIED`. Require evidence before `PASS`.

**Exit:** Every assessment criterion is traceable.

### Prompt 03 --- Scope and Risks

> Propose a realistic MVP for the deadline. Separate mandatory,
> recommended, and optional features. Map dependencies and identify
> high-risk work. Do not silently remove requirements or add major
> features. Ask me to approve scope changes.

**Exit:** MVP and priorities are approved.

## Phase 02 --- Requirements and Architecture

### Prompt 04 --- PRD Review

> Review `docs/PRD.md` if present. Check user roles, routes, functional
> requirements, business workflows, UX states, acceptance criteria, and
> out-of-scope items. Identify contradictions and untestable
> requirements. Recommend precise changes for my approval.

### Prompt 05 --- R&D and Stack Verification

> Review `docs/RND.md`. Confirm the chosen stack:
> React/TypeScript/Vite/Tailwind v4 frontend;
> NestJS/Fastify/Prisma/PostgreSQL backend; deterministic forecasting
> plus optional Gemini explanations. Check compatibility with actual
> package versions and official documentation. Do not invent package
> versions, model IDs, pricing, or API capabilities.

### Prompt 06 --- Architecture and API Contract

> Review the frontend/backend boundary, route layout, API base path,
> request/response formats, error contract, authentication, pagination,
> and data flow. Keep frontend and backend separate. The landing page
> and authenticated dashboard need separate layouts. Produce an API
> contract for approval before integration.

### Prompt 07 --- Database and Relationships

> Review `docs/DATABASE.md`, Prisma schema, and migrations. Check User,
> Business, BusinessMember, Category, Product, Supplier, Customer,
> Purchase, PurchaseItem, Sale, SaleItem, StockMovement, Payment, and
> Expense as needed. Check foreign keys, business isolation, uniqueness,
> indexes, decimal precision, deletion rules, cost snapshots, and
> transaction boundaries. Never run destructive commands.

**Phase exit:** Requirements, architecture, API contract, and schema
agree.

## Phase 03 --- Foundation

### Prompt 08 --- Environment and Secrets

> Review environment variables, startup validation, `.env.example`,
> `.gitignore`, logging, and frontend environment usage. Ensure secrets
> are not exposed or committed. Do not reveal secret values. Explain
> safe local setup.

### Prompt 09 --- Dependencies and Baseline

> Inspect actual package scripts and lockfiles. Guide me through
> installed dependency checks, type-checking, lint, tests, Prisma
> validation, and builds. Record baseline outputs before feature
> changes. Never invent commands or claim success without output.

### Prompt 10 --- Backend Foundation

> Review NestJS/Fastify setup, ConfigModule, validation, exception
> handling, logging, CORS, Helmet, rate limiting, Swagger, health
> endpoint, and Prisma connectivity. Identify issues and explain focused
> fixes for me to implement.

### Prompt 11 --- Frontend Foundation

> Review React/Vite configuration, routing, public/dashboard layouts,
> shared UI, design tokens, API client, query handling, error
> boundaries, forms, accessibility, and responsive behavior. Recommend
> focused fixes; do not replace the architecture without approval.

**Phase exit:** Both apps run locally and baseline checks are recorded.

## Phase 04 --- Authentication and Security

### Prompt 12 --- Authentication

> Review registration, login, logout, password hashing, session/token
> expiry, unauthorized responses, route guards, and safe error handling.
> Explain secure choices and relevant CSRF/token-storage trade-offs. A
> login form alone is not proof of secure authentication.

### Prompt 13 --- Authorization and Tenant Isolation

> Review server-side ownership checks for every protected operation.
> Check IDOR, manipulated IDs, role enforcement, and cross-business
> access. Design negative tests proving that users cannot read or modify
> another business's records.

**Phase exit:** Authentication and authorization tests have observed
passing results.

## Phase 05 --- Business Modules

For each prompt, request acceptance criteria, review the code you
implement, run tests, and only then proceed.

### Prompt 14 --- Products and Categories

> Review CRUD, archive behavior, SKU uniqueness per business, category
> relationships, search, pagination, filters, validation, and historical
> references. Identify missing tests.

### Prompt 15 --- Inventory

> Review stock movement history, initial stock, adjustments, returns,
> traceability, negative-stock prevention, concurrent updates, and
> transaction consistency.

### Prompt 16 --- Purchases

> Review draft, receive, completion, cancellation, and return rules.
> Draft purchases must not increase stock. Receiving must increase stock
> exactly once. Check supplier payable, totals, duplicate requests, and
> rollback.

### Prompt 17 --- Sales

> Review checkout, sale items, stock deduction, discounts, cost
> snapshots, payments, insufficient stock, duplicate requests,
> concurrent sales, and atomic transactions. Verify failed operations
> leave no partial records.

### Prompt 18 --- Customers, Suppliers, and Payments

> Review partial payments, customer receivables, supplier payables,
> payment methods, duplicate payments, refunds, and reconciliation.
> Customer receipts and supplier payments must be modelled separately
> where necessary.

### Prompt 19 --- Expenses and Reports

> Review revenue, COGS, gross profit, operating expenses, net profit,
> receivables, payables, and stock valuation. Define accounting policy,
> timezone/date filters, discount/return treatment, and historical
> costs. Do not recalculate historical profit from today's product cost.

### Prompt 20 --- Dashboard Data Integrity

> Verify all cards, charts, tables, and reports against actual
> backend/database records. Check date filters, empty/loading/error
> states, refresh behavior, and mutation updates. Remove hardcoded demo
> metrics and fake success messages.

**Phase exit:** Core user flows work from UI through API to persistent
data, with tests for critical invariants.

## Phase 06 --- Public Website and Dashboard

### Prompt 21 --- Landing Page

> Review `/` using `PublicLayout`. Verify value proposition, feature
> sections, workflow, AI explanation, FAQ, footer, responsive behavior,
> accessibility, and working login/get-started navigation. No private
> business data may be public.

### Prompt 22 --- Dashboard Routes

> Review protected `/dashboard/*` routes and `DashboardLayout`,
> navigation, session expiry, direct URL access, role permissions,
> loading/error/empty states, and backend authorization. Every feature
> must call real APIs.

### Prompt 23 --- UX and Accessibility

> Review mobile/tablet/desktop behavior, keyboard access, focus, labels,
> contrast, tables, forms, confirmation dialogs, loading states, error
> recovery, and success feedback. Report reproducible defects by
> severity.

## Phase 07 --- AI Stock Advisor

### Prompt 24 --- Forecasting

> Review the deterministic forecast using recent sales history,
> including 7-day and 28-day averages if appropriate. Test zero demand,
> new products, missing days, stockouts, returns, outliers, and
> insufficient history. Manually calculate sample cases. Do not claim a
> trained ML model unless one is actually trained.

### Prompt 25 --- Reorder Calculator

> Verify forecast demand, lead time, safety stock, review horizon, stock
> coverage, reorder point, suggested quantity, rounding, and budget
> constraints. Keep numerical calculations deterministic. Check examples
> by hand.

### Prompt 26 --- Gemini Integration

> Review backend-only Gemini API configuration, current official model
> ID, timeout, rate limits, structured output, schema validation, and
> fallback. Never expose API keys. LLM output may explain validated
> calculations but must not determine authoritative stock or financial
> values.

### Prompt 27 --- AI Evaluation

> Design chronological historical backtesting, calculate MAE, and
> compare with a simple baseline. Avoid data leakage and document sample
> size and limitations. Do not fabricate results. If historical data is
> insufficient, label recommendations experimental.

**Phase exit:** Calculation tests pass, fallback is verified, and AI
limitations/evaluation are documented honestly.

## Phase 08 --- Quality Assurance

### Prompt 28 --- Test Coverage Audit

> Map tests to requirements. Identify missing unit, integration, API,
> authorization, and end-to-end tests. Prioritize sale atomicity,
> insufficient stock, duplicate receiving, tenant isolation, payment
> calculations, report reconciliation, and forecasting.

### Prompt 29 --- Edge Cases

> Review malformed requests, invalid IDs, duplicate requests,
> concurrency, database outages, expired sessions, Gemini outages/rate
> limits, timezone boundaries, decimal rounding, negative quantities,
> large pagination, and invalid date ranges. Give reproducible scenarios
> and expected outcomes.

### Prompt 30 --- Execute Verification

> Inspect actual scripts, then guide me through type-check, lint, unit
> tests, integration tests, Prisma validation/migration checks, and
> production builds. Record command, environment, exit status, and
> observed output. Never conceal failures or skip tests to get a green
> report.

### Prompt 31 --- Independent Review

> Act as an independent reviewer. Find correctness bugs, unsafe
> assumptions, duplicated business logic, inconsistent API contracts,
> missing validation, performance issues, inaccessible UI, and
> misleading metrics. Rank findings by severity and provide evidence and
> focused fixes for me to implement.

## Phase 09 --- Git, Docs, and Deployment

### Prompt 32 --- Git Hygiene

> Review branch, working tree, diff, commits, ignored files, and secret
> exposure. Recommend meaningful small commits. Do not discard work,
> rewrite history, or force-push without explicit approval.

### Prompt 33 --- Documentation

> Verify README setup steps, prerequisites, env examples, migrations,
> seed data, commands, architecture, Swagger URL, AI
> evaluation/limitations, demo credentials if intentionally configured,
> known issues, and troubleshooting against the actual codebase.

### Prompt 34 --- Deployment Readiness

> Review production build, environment variables, database connectivity,
> migration strategy, CORS, health checks, logging, API base URL,
> secrets, and Gemini configuration. Use current official docs for
> platform constraints. Do not deploy or alter production data/settings
> without approval.

## Phase 10 --- Demonstration and Final Audit

### Prompt 35 --- End-to-End Demo

> Create a manual checklist based on actual functionality: login,
> product creation, purchase receiving, sale, partial payment, due
> verification, dashboard/report reconciliation, AI recommendation, and
> an error scenario. Mark each result from observed evidence.

### Prompt 36 --- Live Code Change Practice

> Help me practise a small change I implement myself, such as
> validation, a filter, an edge case, or a calculation. Explain affected
> files, expected behavior, tests, and regression risks. Ask me to
> explain the change.

### Prompt 37 --- Final Readiness Audit

> Compare every assessment requirement with evidence. Report completed
> and incomplete requirements, actual build/test results, security
> findings, business-logic findings, AI evaluation, known limitations,
> deployment status, and remaining blockers. Use PASS/FAIL/BLOCKED/NOT
> VERIFIED accurately. Never claim error-free or production-ready
> without evidence.

------------------------------------------------------------------------

# 5. Required Phase Report

At the end of every phase, report:

1.  Phase and objective
2.  Actual files inspected
3.  Verified facts versus assumptions
4.  Commands executed and observed outcomes
5.  Findings and risks
6.  Tasks for me to implement
7.  Tests required
8.  Exit-criteria checklist
9.  Status: PASS, FAIL, BLOCKED, or NOT VERIFIED
10. Next phase and its prerequisites

## Stop Conditions

Stop and ask me before proceeding if requirements conflict, a major
decision is unclear, a migration may destroy data, production
configuration will change, secrets are at risk, a destructive command is
proposed, a test failure has an unknown cause, or scope expansion is
significant.

## Definition of Done

-   Separate `frontend/` and `backend/` directories
-   Separate public landing page and authenticated dashboard layouts
-   Real API and persistent database integration
-   Verified authentication and server-side authorization
-   Tested inventory and financial invariants
-   AI inputs, outputs, limitations, and evaluation documented
-   Critical test results observed and failures disclosed
-   Accurate README and environment examples
-   User understands and can explain submitted code
-   Remaining issues clearly disclosed

**A successful build is not proof that the application works correctly.
Evidence and understanding are required.**
