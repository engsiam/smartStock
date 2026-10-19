# SmartStock — REST API Specification

**Base URL:** `http://localhost:3000/api`  
**Interactive Swagger UI:** `http://localhost:3000/api/docs`  
**Authentication:** `Authorization: Bearer <access_token>`  
**Tenancy Context:** `x-business-id: <business_id>`  

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user and auto-provision business | No |
| `POST` | `/api/auth/login` | Authenticate with email/password; returns JWT access + refresh tokens | No |
| `POST` | `/api/auth/refresh` | Rotate access token using valid refresh token | No |
| `POST` | `/api/auth/logout` | Revoke active refresh token | Yes |
| `GET` | `/api/auth/me` | Fetch active profile and tenant memberships | Yes |

---

## 2. Product & Inventory Endpoints (`/api/products`, `/api/categories`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/products` | List products (params: `search`, `categoryId`, `lowStockOnly`, `page`, `limit`) | Yes |
| `POST` | `/api/products` | Create new product in catalog | Yes |
| `GET` | `/api/products/:id` | Fetch product details by ID | Yes |
| `PUT` | `/api/products/:id` | Update product catalog attributes | Yes |
| `POST` | `/api/products/:id/adjust-stock` | Execute atomic manual adjustment (`ADJUSTMENT_IN` / `ADJUSTMENT_OUT`) | Yes |
| `GET` | `/api/products/:id/movements` | Fetch product stock movement audit ledger | Yes |
| `GET` | `/api/products/alerts/low-stock` | List items currently below their reorder threshold | Yes |
| `GET` | `/api/categories` | List product categories for tenant | Yes |
| `POST` | `/api/categories` | Create category | Yes |

---

## 3. Sales & POS Endpoints (`/api/sales`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/sales` | Process POS sale, deduct stock, snapshot costs, create payment | Yes |
| `GET` | `/api/sales` | List recent sales invoices (params: `page`, `limit`, `status`) | Yes |
| `GET` | `/api/sales/:id` | Fetch full invoice details with line items | Yes |
| `POST` | `/api/sales/:id/void` | Void sale, reverse revenue, and restore stock with `SALE_RETURN` audit | Yes (`OWNER`) |
| `GET` | `/api/sales/summary/today` | Fetch today's gross sales, discounts, net revenue, and estimated profit | Yes |

---

## 4. Purchases & Suppliers Endpoints (`/api/purchases`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/purchases` | List purchase orders (params: `status`, `page`, `limit`) | Yes |
| `POST` | `/api/purchases` | Create purchase order in `DRAFT` status (no stock deduction) | Yes |
| `GET` | `/api/purchases/:id` | Fetch purchase order details | Yes |
| `POST` | `/api/purchases/:id/receive` | Receive goods: increment stock, update moving-weighted average cost | Yes |
| `POST` | `/api/purchases/:id/cancel` | Cancel draft purchase order | Yes |
| `GET` | `/api/purchases/suppliers` | List suppliers directory | Yes |
| `POST` | `/api/purchases/suppliers` | Add supplier | Yes |

---

## 5. AI Reorder Advisor Endpoints (`/api/ai-advisor`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/ai-advisor/recommendations` | Compute demand velocity, safety stock, and Gemini advice (`?language=en\|bn`) | Yes |
| `GET` | `/api/ai-advisor/insights` | Aggregate stock health KPIs and restock cost estimates | Yes |

---

## 6. Business Tenancy & Analytics Endpoints (`/api/business`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/business/current` | Fetch active business trade profile | Yes |
| `PUT` | `/api/business/current` | Update business name or legal classification | Yes (`OWNER`) |
| `GET` | `/api/business/financial-overview`| Compute valuation, gross profit, margin %, and low-stock count | Yes |
| `GET` | `/api/business/members` | List active team members and roles | Yes |
| `GET` | `/api/business/customers` | List customer accounts | Yes |
| `POST` | `/api/business/customers` | Create wholesale customer account | Yes |

---

## 7. System Health Endpoint (`/health`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` / `/api/health` | Fastify uptime, service status, and API version probe | No |
