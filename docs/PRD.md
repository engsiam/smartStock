# SmartStock — Product Requirements Document (PRD)

**Document Version:** 1.0  
**Target Market:** Small and Medium Retail & Wholesale Businesses in Bangladesh  
**Status:** Approved & Implemented  

---

## 1. Product Vision & Goals

SmartStock provides a localized, cloud-native inventory and point-of-sale management platform designed for shop owners and wholesalers in Bangladesh. It bridges the gap between traditional manual bookkeeping and complex enterprise ERPs by offering an intuitive, high-speed interface with built-in demand intelligence.

### Key Success Metrics
- **Checkout Velocity:** Complete a retail POS sale and generate a thermal invoice in under 5 seconds.
- **Stock Accuracy:** Maintain 100% transactional reconciliation across product stock levels and signed stock movements.
- **Stockout Prevention:** Proactively flag SKUs falling below lead-time demand buffers.
- **Localized Experience:** BDT currency formatting (৳), poysha precision, and dual Bangla (বাংলা) & English guidance.

---

## 2. User Personas & Roles

### 1. Siam Ahmed (Store Owner) — `OWNER`
- **Needs:** Complete visibility over store profitability, inventory valuation, working capital allocation, and team oversight.
- **Permissions:** All CRUD operations, business profile settings, team management, purchase order approval, and sale void authorization.

### 2. Karim Ullah (Store Cashier / Clerk) — `STAFF`
- **Needs:** Rapid product search by barcode/name, live shopping cart calculation, multi-channel payment acceptance (Cash, bKash, Nagad), and thermal receipt printing.
- **Permissions:** POS sales processing, stock availability lookup, stock receipt from approved purchase orders. No access to financial margins or business settings.

### 3. Nasreen Sultana (Accountant / Auditor) — `ACCOUNTANT`
- **Needs:** Accurate cost of goods sold (COGS) tracking based on historical purchase costs, stock movement audit trail verification, and financial CSV exports.
- **Permissions:** Read-only access to all financial reports, stock ledger, sales invoices, and customer credit books.

---

## 3. Functional Requirements

### 3.1 Authentication & Multi-Tenancy
- Users authenticate via work email and Argon2id-hashed password.
- Successful login issues a signed JWT access token (`15m` TTL) and refresh token (`7d` TTL).
- Every business tenant is strictly isolated via `businessId`. Cross-business record access must return `404 Not Found`.

### 3.2 Inventory Management
- Product catalog supports Name, SKU (unique per tenant), Barcode, Unit, Cost Price, Selling Price, Initial Stock, Reorder Level, and Supplier Lead Time (Days).
- Manual adjustments support `ADJUSTMENT_IN` (found stock, sample) and `ADJUSTMENT_OUT` (damage, spoilage, shrinkage) with mandatory reason logging.
- An immutable `StockMovement` ledger records every quantity change, before/after balances, unit cost snapshots, and operator IDs.

### 3.3 Point of Sale (POS) & Sales
- Real-time catalog search by barcode or keyword.
- Interactive cart with quantity adjustment and stockout prevention (cannot exceed available inventory).
- Multi-channel payment options: `CASH`, `BKASH`, `NAGAD`, `CARD`, `BANK_TRANSFER`, `CREDIT`.
- Atomic transaction: generates document sequence (`INV-XXXX`), deducts stock, records payment, snapshots `unitCost` on each line item, and renders a printable thermal receipt.
- Void Sale: Reverses sale status to `VOIDED`, updates revenue, and restores stock with a `SALE_RETURN` audit movement.

### 3.4 Purchases & Suppliers
- Supplier directory with contact details, address, and opening balance.
- Purchase orders created in `DRAFT` status without changing inventory.
- "Receive Goods" atomic workflow increments product stock, recalculates the moving weighted-average cost price, and records an outflow payment.

### 3.5 AI Reorder Advisor
- Calculates daily sales velocity, lead-time demand, and safety stock.
- Generates natural language restock explanations in Bangla (বাংলা) or English via Google Gemini 2.5 Flash.
- Fallback mode: instantaneous deterministic rule-based advice when offline or without an API key.
- 1-Click PO generation converts an advisory directly into a draft purchase order.

### 3.6 Financial Reporting & Analytics
- Executive dashboard displaying Total Revenue, COGS, Gross Profit, Gross Margin (%), Total Stock Units, and Inventory Valuation (Cost & Retail).
- Interactive Recharts visual analytics (7-day revenue trend and category valuation).
- 1-Click CSV export for accounting reconciliation.
