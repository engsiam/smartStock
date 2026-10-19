# SmartStock — Testing Strategy & Verification Report

**Test Frameworks:** Jest (Backend) + Vitest (Frontend)  
**Total Automated Tests:** 10 Tests across 6 Suites (100% Passing)  

---

## 1. Test Architecture Overview

```
SmartStock Testing Pipeline
├── Backend Tests (Jest)
│   ├── Unit Tests
│   │   ├── forecasting.service.spec.ts  (Deterministic reorder & velocity math)
│   │   └── health.controller.spec.ts    (Fastify health probe)
│   ├── Integration Tests
│   │   ├── sales-atomicity.spec.ts      (Insufficient stock rollback & cost snapshotting)
│   │   └── tenant-isolation.spec.ts     (Cross-tenant IDOR protection)
│   └── Evaluation Benchmark
│       └── evaluate-forecasting.ts      (Chronological sliding-window backtest & MAE)
│
└── Frontend Tests (Vitest + React Testing Library)
    ├── Formatters.test.tsx              (BDT currency formatting, poysha & role badges)
    └── LandingPage.test.tsx             (Landing layout, navigation & call-to-action)
```

---

## 2. Test Execution Commands & Outputs

### Backend Unit & Integration Tests
```bash
cd backend
npm test
```
**Observed Output:**
```text
PASS test/integration/sales-atomicity.spec.ts
PASS test/integration/tenant-isolation.spec.ts
PASS test/unit/forecasting.service.spec.ts
PASS test/unit/health.controller.spec.ts

Test Suites: 4 passed, 4 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        6.171 s
```

### AI Demand Forecasting Chronological Backtesting
```bash
cd backend
npm run eval:ai
```
**Observed Output:**
```text
================================================================
   SMARTSTOCK AI & DEMAND FORECASTING EVALUATION REPORT
   Chronological Backtesting & Accuracy Assessment (No Leakage)
================================================================

Comparative Performance Metrics:
---------------------------------------------------------------------------------------------------------
Model / Strategy                                 | MAE (units) | RMSE  | Stockout Risk | Capital Buffer
---------------------------------------------------------------------------------------------------------
SmartStock Weighted Velocity (Production)        | 2.43        | 2.93   | 1 days (3%)   | 14 days cover
Baseline: 7-Day Simple Moving Average (SMA-7)    | 3.00        | 3.98   | 4 days (13%)  | 12 days cover
Baseline: Naive Persistence (Yesterday Demand)   | 4.47        | 5.60   | 6 days (20%)  | 10 days cover
---------------------------------------------------------------------------------------------------------
EVALUATION RESULT: PASS
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
**Observed Output:**
```text
✓ src/test/Formatters.test.tsx (3 tests) 35ms
✓ src/test/LandingPage.test.tsx (1 test) 132ms

Test Files  2 passed (2)
     Tests  4 passed (4)
  Duration  6.78s
```

---

## 3. Key Invariants Verified

1. **Transactional Stock Integrity:**
   - Attempting to purchase more units than available throws `BadRequestException` and aborts the entire transaction. Zero orphan records are left in the database.
2. **Document Number Uniqueness:**
   - Invoices (`INV-XXXX`) and Purchase Orders (`PO-XXXX`) generate consecutive unique identifiers via atomic counter upserts.
3. **Historical Profit Protection:**
   - Changing a product's price in the future never mutates the `unitCost` on historical `SaleItem` records.
4. **Tenant Isolation:**
   - Manipulated query IDs targeting another tenant's records return `404 Not Found` rather than leaking information.
