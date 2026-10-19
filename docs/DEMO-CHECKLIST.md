# SmartStock — Live Demonstration Checklist (10-Minute Walkthrough)

**Assessment:** NT TECH INNOVATION Full Stack Developer Practical Assessment  
**Evaluation Criteria:** Live Demonstration & Technical Review (10 Marks)  
**Target Time:** 8–10 Minutes  

---

## 1. Introduction & Architecture (1.5 Minutes)
- [ ] **Open Browser:** Navigate to `http://localhost:5173`.
- [ ] **Show Landing Page:** Explain the value proposition for Bangladeshi SME grocery and wholesale businesses.
- [ ] **Architecture Highlights:** Mention NestJS 11 + Fastify 5 adapter for high-throughput POS, Prisma 6 with PostgreSQL, and React 19 with Tailwind v4.
- [ ] **Show Health & Swagger:** Show `http://localhost:3000/health` (Fastify uptime probe) and `http://localhost:3000/api/docs` (OpenAPI Swagger documentation).

---

## 2. Authentication & 1-Click Persona Switcher (1.5 Minutes)
- [ ] **Navigate to Login:** Click "Launch Dashboard" or open `/login`.
- [ ] **Show 1-Click Demo Personas:** Demonstrate the three seeded personas:
  - 👑 Siam Ahmed (Owner)
  - 🧑‍💼 Karim Ullah (Staff)
  - 📊 Nasreen Sultana (Accountant)
- [ ] **Log in as Owner:** Click Siam Ahmed (Owner). Point out the active shop pill (`Dhaka Grocery & General Store`) and role badge in the sidebar.

---

## 3. Executive Dashboard & Visual Analytics (1.5 Minutes)
- [ ] **Show Live Financial KPIs:**
  - Inventory Valuation (Cost): e.g. `৳75,845.00`
  - Retail Valuation: e.g. `৳84,290.00`
  - Gross Profit Margin (%)
  - Attention Needed count (low stock alerts)
- [ ] **Demonstrate Recharts Analytics:**
  - Switch between **Sales Trend (৳)** area chart and **Category Stock Valuation** bar chart.
- [ ] **Export to CSV:** Click **"Export CSV"** button and open the downloaded spreadsheet to show accountant-ready figures.

---

## 4. Product Catalog & Manual Stock Adjustment (1.5 Minutes)
- [ ] **Navigate to Inventory (`/app/inventory`):**
  - Search for `"tea"` or filter by category (`Beverages`).
  - Toggle **"Low Stock Only"** filter to highlight critical items.
- [ ] **Perform Stock Adjustment:**
  - Click the adjustment slider icon on `Ispahani Mirzapore Tea`.
  - Select `ADJUSTMENT_IN (+)` -> Quantity: `5` -> Reason: `"Found inventory in warehouse audit"`.
  - Click **"Apply Stock Adjustment"**. Show that the stock count immediately updates.
- [ ] **Inspect Audit Ledger:** Click the history clock icon to view the chronological `StockMovement` ledger proving signed balance verification.

---

## 5. POS Checkout & Thermal Invoicing (2 Minutes)
- [ ] **Navigate to Sales & POS (`/app/sales`):**
  - Search or click to add `Ispahani Mirzapore Tea` and `ACI Pure Salt` into the cart.
  - Adjust quantity using `+` / `-` buttons. Point out the stock limit safeguard (cannot oversell).
  - Select Customer (e.g., `Rahim Store`).
  - Select Payment Method: **`bKash`** or **`CASH`**.
  - Enter Amount Paid and observe live **Change Due** calculation.
- [ ] **Click "Complete Sale":**
  - Demonstrate the atomic checkout and instant thermal receipt popup with invoice number (`INV-XXXX`), BDT totals, customer details, and print trigger.
- [ ] **View Invoices & Void Demonstration:**
  - Switch to **"Invoice History"** tab.
  - Show the newly completed sale.
  - Click **"Void Sale"**, provide reason (`"Customer return"`), and confirm.
  - Show that invoice status becomes `VOIDED` and stock is automatically restored with a `SALE_RETURN` audit entry.

---

## 6. Purchases & Moving-Weighted Average Cost (1 Minute)
- [ ] **Navigate to Purchases (`/app/purchases`):**
  - Show draft purchase orders and Suppliers Directory (e.g., `Meghna Group`, `Square Consumer Products`).
  - Click **"Receive Stock"** on a draft order.
  - Explain the weighted average formula that updates `Product.costPrice` based on batch cost and volume without manual recalculation.

---

## 7. AI Reorder Advisor & Benchmark Walkthrough (1.5 Minutes)
- [ ] **Navigate to AI Reorder Advisor (`/app/ai-advisor`):**
  - Show the calculated metrics: Daily Velocity, Days of Supply, Safety Stock buffer, and Priority badges (`CRITICAL`, `HIGH`).
  - Demonstrate the language toggle: Switch from **English** to **বাংলা (Bangla)** to show natural language explanations tailored for local shopkeepers.
  - Click **"1-Click Create PO"** to show instant conversion of AI advice into a draft purchase order.
- [ ] **Terminal Proof of ML Evaluation:**
  - In terminal, execute:
    ```bash
    npm run eval:ai
    ```
  - Show the chronological sliding-window backtest report proving **MAE: 2.43 units** (19% improvement over baseline) and 97% stockout prevention.

---

## 8. Q&A / Live Code Change Readiness
Be prepared for the examiner's live code change task (e.g., modifying a discount percentage, adding a validation rule in a DTO, or adjusting a formula threshold in `forecasting.service.ts`).
