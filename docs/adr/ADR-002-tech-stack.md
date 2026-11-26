# ADR-002: Tech Stack

Status: Accepted · Date: 2026-11-25 · Related: ADR-001 (Modular Monolith + REST), scope.md

## Context

ADR-001 chose a modular monolith exposed through a REST API, with in-process events and an outbox between modules. The scope note sets these constraints: multi-company, single currency (USD), about 100 users, deployed locally with Docker Compose, and built as a portfolio project to the standard of a real product. The stack should be mainstream, free to run locally, and fit Vertical Slice organization inside each module.

## Decision

### Backend

| Area | Choice |
|---|---|
| Runtime | .NET 10 (LTS), C# |
| API | ASP.NET Core Minimal APIs, one endpoint per feature slice; OpenAPI document generated |
| Request pipeline | Mediator with pipeline behaviors (validation, transaction, logging). Use a small in-house mediator or Wolverine; check MediatR's current license before adopting it |
| Validation | FluentValidation |
| Database | **PostgreSQL** (official Docker image) |
| ORM (writes) | EF Core with Npgsql provider; one `DbContext` per module; one PostgreSQL schema per module (`sales`, `inventory`, `finance`, ...) |
| Queries (reports, lists) | Dapper on read-only SQL / views |
| Multi-company | `company_id` on business tables + EF Core global query filter from the current user's selected company |
| Auth | ASP.NET Core Identity + JWT bearer tokens; permission-based authorization policies |
| Events | In-process event dispatcher + outbox table, processed by a hosted background service |
| Background jobs | .NET hosted services (outbox, notifications); add Hangfire if scheduled jobs grow |
| PDF (invoices, payslips) | QuestPDF (check license terms for the use case) |
| Logging | Serilog → Seq (local), OpenTelemetry-ready |

### Frontend

| Area | Choice |
|---|---|
| Build | Vite + React + TypeScript |
| UI components | Ant Design (or MUI) — strong tables and forms |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Data grid | Ant Design Table / TanStack Table; AG Grid Community if advanced grids are needed |
| API client | Generated from the backend OpenAPI document (Orval or NSwag) |
| Routing | React Router |

### Testing & quality

| Area | Choice |
|---|---|
| Unit / integration | xUnit, Testcontainers (real PostgreSQL in tests) |
| Architecture rules | NetArchTest — modules may only reference other modules' `Contracts` |
| Frontend | Vitest + React Testing Library; Playwright for a few end-to-end flows |

### Infrastructure & delivery

| Area | Choice |
|---|---|
| Local runtime | Docker Compose: `web` (nginx serving React build), `api`, `postgres`, `seq`, `mailpit` (captures notification emails) |
| CI | GitHub Actions: build, test, architecture tests, Docker image build |
| Migrations | EF Core migrations per module; applied on startup in Development only |

## Consequences

Positive
- Everything runs locally for free with one command, which suits a portfolio project.
- Mainstream choices that are easy to explain in interviews and well documented.
- PostgreSQL schemas map one-to-one to module boundaries.
- A generated API client keeps frontend and backend contracts in sync.

Negative / risks
- PostgreSQL is less familiar than SQL Server (from past experience): naming conventions (snake_case), `timestamptz`, and Npgsql specifics need learning.
- Some libraries have changed licensing (MediatR, AutoMapper, QuestPDF tiers); verify before adoption and keep them behind our own abstractions.
- A single PostgreSQL instance is a single point of failure, which is acceptable for local deployment and ~100 users.

## Alternatives considered

- SQL Server: familiar, but needs a licensed edition beyond Developer/Express for real product use; PostgreSQL is free with no limits.
- Controllers instead of Minimal APIs: fine, but more ceremony per slice.
- Next.js: SSR/SEO not needed for an internal ERP; a Vite SPA is simpler.
- Message broker (RabbitMQ) now: not needed inside one process; the outbox keeps that option open.
