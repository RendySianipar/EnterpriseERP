# EnterpriseERP — Scope & Quality Attributes

Status: Accepted · Date: 2026-11-25

## 1. Goal

A portfolio project built to the standard of a real product: clean architecture, tested, documented with ADRs, and runnable with one command.

## 2. Key constraints

| Topic | Decision | Consequence for design |
|---|---|---|
| Companies | **Multi-company** | Every business table carries `company_id`; EF Core global query filter on the current company; users are assigned to one or more companies; document numbering, chart of accounts and settings are per company |
| Currency | **Single currency: USD** | All amounts in USD. Still store `currency_code` (default `USD`) on monetary documents so multi-currency can be added later without a migration of historic data |
| Users | **~100 users** | One API instance and one PostgreSQL instance are enough. No distributed cache, no horizontal scaling needed. Use indexes and paging on large lists |
| Deployment | **Local Docker (Docker Compose)** | `docker compose up` starts web, API, database and log viewer |
| Money type | `numeric(18,2)` for amounts, `numeric(18,4)` for quantities/unit prices | Never `float`/`double` for money |
| Time | `timestamptz`, stored in UTC | Convert to local time in the UI |

Out of scope (for now): intercompany transactions, multi-currency/exchange rates, consolidation across companies, mobile app, cloud deployment.

## 3. Modules and phases

The six required modules are delivered in phases, so each phase ends with a working end-to-end business flow.

### Phase 0 — Foundation (prerequisite for everything)

- Identity: login, users, roles/permissions, user ↔ company assignment
- Company setup: companies, fiscal years and periods
- Master data: products, units of measure, warehouses, customers, suppliers, chart of accounts, tax codes
- Cross-cutting: audit trail, document numbering per company, soft delete, global error handling, logging

### Phase 1 — Core trading flows (MVP)

**Procure-to-Pay**
- Purchasing: Purchase Requisition → Approval → Price Comparison → Purchase Order → Goods Receipt
- Outstanding PR/PO monitoring; notification when goods are received
- Goods Receipt increases stock automatically and posts the journal automatically

**Order-to-Cash**
- Sales: Quotation → Sales Order → Delivery → Sales Invoice (generate + print PDF)
- Delivery decreases stock; invoice posts revenue and receivables automatically

**Inventory (core)**
- Stock in/out, stock transfers, stock adjustments, real-time stock on hand per warehouse
- Safety stock levels and low-stock alerts

**Finance (core)**
- General Ledger, journal entries (automatic from other modules + manual)
- Accounts Payable and Accounts Receivable, payments
- Reports: Trial Balance, Profit & Loss, Balance Sheet
- Period closing (block posting into closed periods)

### Phase 2 — Extended features

- Inventory: barcode scanning, serial number / lot tracking
- Finance: cash flow management and cash flow statement
- Sales: sales planning and target tracking

### Phase 3 — HR & Payroll

- Employee database (personal data, contact details, national ID number)
- Employee document storage (CV, certificates, contracts)
- Payroll calculation, payslip generation, automatic payroll journal to Finance
- Note: payroll tax and social-security rules are country-specific and must be defined before this phase starts
- Note: employee personal data (national ID etc.) is sensitive — restricted permissions, field-level encryption for ID numbers, access logged in the audit trail

### Phase 4 — Manufacturing

- Bill of Materials (BOM) and raw material requirement calculation
- Production planning and production orders
- Job Orders / work instructions with stage tracking
- Work in Progress (WIP) and finished goods; automatic raw material consumption from BOM

Why this order: Manufacturing depends on Inventory, Purchasing and Finance (costing); Payroll depends on Finance. Phase 1 builds the foundations every later module posts into.

## 4. Module integration (events)

Modules integrate through in-process domain/integration events with an outbox (see ADR-001).

| Event (publisher) | Subscribers and effect |
|---|---|
| `GoodsReceived` (Purchasing) | Inventory: increase stock · Finance: Dr Inventory / Cr GR-IR (Goods Received Not Invoiced) · Notification: inform requester |
| `SupplierInvoicePosted` (Purchasing/Finance AP) | Finance: Dr GR-IR / Cr Accounts Payable |
| `DeliveryPosted` (Sales) | Inventory: decrease stock · Finance: Dr COGS / Cr Inventory |
| `SalesInvoiceIssued` (Sales) | Finance: Dr Accounts Receivable / Cr Revenue (+ tax) |
| `PaymentReceived` / `PaymentMade` (Finance) | Sales/Purchasing: update invoice payment status |
| `StockBelowSafetyLevel` (Inventory) | Notification · Purchasing: suggest Purchase Requisition |
| `PayrollPosted` (HR) | Finance: salary expense / payable journal |
| `ProductionOrderCompleted` (Manufacturing) | Inventory: consume raw materials, add finished goods · Finance: WIP → finished goods journal |

## 5. Quality attributes

| Attribute | Target |
|---|---|
| Performance | List screens < 1 s with paging; reports for one fiscal year < 5 s |
| Consistency | Journals always balance (debit = credit), enforced in the domain; stock never negative unless allowed by setting |
| Security | JWT auth, role-based permissions per action, company isolation enforced by global filter and tested |
| Auditability | Every create/update/delete on business documents logged (who, when, old/new values); posted documents are never edited, only reversed |
| Maintainability | Module boundaries enforced by architecture tests; each module has its own PostgreSQL schema |
| Operability | One-command start with Docker Compose; structured logs in Seq; database migrations applied on startup in development |
