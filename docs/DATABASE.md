# SmartStock — Database Schema & Data Modeling Document

**ORM:** Prisma 6.19.0  
**Database:** PostgreSQL 16  
**Schema Location:** `backend/prisma/schema.prisma`  

---

## 1. Schema Conventions & Numeric Precision

| Domain | PostgreSQL Type | Prisma Type | Rationale |
| :--- | :--- | :--- | :--- |
| **Monetary Values** | `DECIMAL(14, 2)` | `Decimal` | Supports up to 999 billion BDT with exact 2-decimal poysha precision. Eliminates floating-point rounding errors. |
| **Quantities** | `DECIMAL(14, 3)` / `INTEGER` | `Decimal` / `Int` | Accommodates fractional quantities (e.g. 1.250 kg rice/flour) and integer items. |
| **Identifiers** | `VARCHAR(30)` | `String @id @default(cuid())` | Collision-resistant sortable CUIDs for distributed security. |
| **Timestamps** | `TIMESTAMPTZ` | `DateTime @default(now())` | Stored in UTC; rendered in `Asia/Dhaka` (UTC+6) in the client. |

---

## 2. Entity-Relationship Overview

```
User (1) <---> (M) BusinessMember (M) <---> (1) Business
                                                  |
         +-----------------+----------------------+-----------------+
         |                 |                      |                 |
         v                 v                      v                 v
     Category           Product                Supplier          Customer
         |                 |                      |                 |
         +--------+--------+                      |                 |
                  |                               v                 v
                  v                           Purchase             Sale
            StockMovement                         |                 |
                                                  v                 v
                                             PurchaseItem        SaleItem
                                                  |                 |
                                                  +--------+--------+
                                                           |
                                                           v
                                                        Payment
```

---

## 3. Core Tables & Responsibilities

### 3.1 `Business` & `BusinessMember`
- Multi-tenancy boundary.
- Stores business trade name, legal type, default currency (`BDT`), and timezone (`Asia/Dhaka`).
- `BusinessMember` defines role per business (`OWNER`, `STAFF`, `ACCOUNTANT`).

### 3.2 `Product` & `Category`
- Scoped to `businessId`.
- Composite unique index: `@@unique([businessId, sku])` prevents duplicate SKU collisions within the same store.
- Tracks `costPrice` (moving-weighted average cost) and `sellingPrice`.
- Tracks `stockQty`, `reorderLevel`, and `leadTimeDays` for AI advisor calculations.

### 3.3 `StockMovement` (Immutable Ledger)
- Records every inventory change event:
  - `OPENING`: Initial stock setup.
  - `SALE`: Stock deduction upon checkout.
  - `SALE_RETURN`: Stock restored when an invoice is voided.
  - `PURCHASE`: Stock received from supplier.
  - `ADJUSTMENT_IN`: Manual audit addition.
  - `ADJUSTMENT_OUT`: Spoilage, breakage, or loss.
- Stores `quantityChange` (positive/negative), `balanceAfter`, `unitCost`, reference type, and operator ID.

### 3.4 `Sale` & `SaleItem`
- Represents retail or wholesale checkout.
- Sequential document numbering: `INV-0001`, `INV-0002` via atomic `Counter` table.
- `SaleItem` records a **historical cost snapshot** (`unitCost = product.costPrice` at sale time). This guarantees that historical gross profit calculations never drift if the product's cost changes in the future!

### 3.5 `Purchase` & `PurchaseItem`
- Purchase order lifecycle: `DRAFT` -> `RECEIVED` (or `CANCELLED`).
- Stock is never altered in `DRAFT`.
- On `receive()`, stock is incremented and moving-weighted average cost is updated in a transaction.

### 3.6 `Payment`
- Polymorphic payment ledger:
  - Direction `IN`: Customer payments for sales.
  - Direction `OUT`: Supplier payouts for purchases.
- Supports payment methods: `CASH`, `BKASH`, `NAGAD`, `CARD`, `BANK_TRANSFER`, `CREDIT`.
