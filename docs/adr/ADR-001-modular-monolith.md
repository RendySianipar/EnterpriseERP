# ADR-001: Modular Monolith with REST and In-Process Events

Status: Accepted · Date: 2026-11-26 (rewritten; first drafted October 2026) · Related: ADR-002 (Tech Stack), scope.md

## Context

EnterpriseERP is an ERP with six business modules: Inventory, Finance & Accounting, Sales, Purchasing, HR & Payroll, and Manufacturing. The modules are tightly linked. A single business event touches several of them: a goods receipt raises stock and posts a journal entry, and a sales invoice creates receivables and revenue.

Constraints:
- Built and maintained by one developer (one team).
- About 100 users, deployed locally with Docker Compose.
- Accounting data must be strongly consistent: journals always balance, and stock levels are exact.
- Portfolio project built to the standard of a real product, so boundaries must be clean and explainable.

## Decision

1. **Decomposition: Modular Monolith.** One deployable ASP.NET Core application, split into business modules (Identity, MasterData, Inventory, Purchasing, Sales, Finance; later HR and Manufacturing).
2. **Module boundaries are strict:**
   - Each module has its own project, plus a `.Contracts` project that is its only public surface.
   - A module may reference another module's `.Contracts` only, never its internals.
   - Boundaries are enforced by architecture tests (NetArchTest) in CI.
3. **Data: one PostgreSQL database, one schema per module** (`sales`, `inventory`, `finance`, ...). A module never queries another module's tables.
4. **Deployment topology: 3-tier.** React SPA → .NET API → PostgreSQL.
5. **Synchronous communication: REST** between the frontend and the API (`/api/{module}/...`). Inside the API, a module that needs an immediate answer calls another module through its `.Contracts` interface (in-process call, no HTTP).
6. **Asynchronous communication: in-process events with an outbox.** Modules react to each other's events (e.g. `GoodsReceived`, `SalesInvoiceIssued`). Events are saved to an outbox table in the same transaction as the business change, then dispatched by a background worker.
7. **Inside each module: Vertical Slice** organization, with a rich domain layer (DDD aggregates) only where rules are complex, mainly Finance and Inventory.

## Consequences

Positive
- One deployment, one database transaction where needed, and simple local debugging.
- No distributed transactions, network failures or service discovery between modules.
- Clean boundaries keep the codebase understandable as it grows to six or more modules.
- Any module can later be extracted into a separate service: `.Contracts` calls become HTTP/gRPC, and outbox events go to a message broker (RabbitMQ/Kafka).

Negative / risks
- Boundaries erode if not enforced; architecture tests are mandatory, not optional.
- All modules scale together; acceptable at ~100 users.
- Event-driven flows are harder to trace than direct calls; mitigated with structured logging and correlation IDs.
- Events between modules are eventually consistent: e.g. stock updates a moment after the goods receipt is saved.

## Alternatives considered

- **Traditional (unstructured) monolith:** fastest start, but modules become entangled ("big ball of mud"), which is hard to maintain and to explain in a portfolio.
- **Microservices:** they solve the problem of many teams needing to deploy independently, which a single developer doesn't have. They would add distributed transactions (sagas), separate databases, a message broker, and heavy infrastructure. Rejected for now; the modular monolith keeps this option open.
- **Database per module now:** strongest isolation, but cross-module reporting and consistency become much harder. A schema per module gives clear ownership with one database.

## When to revisit

Revisit this decision if one of these appears:
- several teams need to deploy independently;
- one module needs to scale or stay available very differently from the rest (e.g. a public POS or e-commerce channel);
- a module needs different compliance or isolation requirements.
