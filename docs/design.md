# Design

One page covering how the service is put together, the API contract, and the
notable decisions (and their tradeoffs).

## Layers

A request flows through separated layers, each with one job:

```
HTTP request
   │
   ▼
[ route ]          modules/deployments/deployments.routes.ts — module composition root + paths
   ▼
[ controller ]     deployments.controller.ts — req/res only: parse input, shape the envelope
   ▼
[ service ]        deployments.service.ts — business logic + validation; no HTTP, no storage details
   ▼
[ repository ]     deployments.repository.ts — DeploymentRepository interface (the storage seam)
                   InMemoryDeploymentRepository — a plain array today
```

Each layer is independently testable and replaceable: the service is unit-tested
with no HTTP, and the repository hides where/how deployments are stored.

## Dependency injection (no global state)

`DeploymentRepository` ([deployments.repository.ts](../src/modules/deployments/deployments.repository.ts))
is the dependency-inversion boundary — a tiny interface the service depends on:

```ts
interface DeploymentRepository {
  findAll(query?: DeploymentQuery): Promise<Deployment[]>;
  findById(id: string): Promise<Deployment | null>;
}
```

Each module owns its own wiring. `createDeploymentsRouter(repository =
new InMemoryDeploymentRepository(deploymentsSeed))` builds repository → service →
controllers, defaulting to the in-memory implementation. `createApp()` stays
free of any module's dependencies — it just mounts module routers. Nothing
reaches for a global singleton.

The repository methods are `async` even though the in-memory store is synchronous,
so a real (I/O-bound) database drops in without changing any caller: implement
`DeploymentRepository` against Mongo/Postgres and pass it to the router factory.
That default argument is the single place the concrete store is named.

## Request lifecycle & error handling

Middleware order in [app.ts](../src/app.ts): morgan → JSON body parser → feature
routes → custom 404 → global error handler (always last).

- Async controllers are wrapped in `asyncHandler` so a rejected promise is
  forwarded to the error handler (Express 4 doesn't catch these on its own).
- `AppError`s (`ValidationError` 400, `NotFoundError` 404) carry their own status
  and code; the global handler maps them straight to the response.
- Any other thrown value → unexpected `500`: logged in full server-side, returned
  with a generic message (plus a stack trace outside production).
- Unmatched routes hit `notFound`, producing the same JSON envelope as every
  other error — never Express's default HTML page.

Process-level: [server.ts](../src/server.ts) installs `unhandledRejection` /
`uncaughtException` handlers and graceful shutdown on `SIGINT` / `SIGTERM`.

## Data model

| Field        | Type   | Notes                                            |
| ------------ | ------ | ------------------------------------------------ |
| `id`         | string | Unique identifier (`deploy_001`)                |
| `service`    | string | Service name (`billing-api`)                    |
| `status`     | enum   | `success` \| `failed` \| `in_progress` \| `rolled_back` \| `pending` |
| `duration`   | number | Seconds                                          |
| `timestamp`  | string | ISO-8601 (UTC)                                  |
| `commit_sha` | string | Short commit hash                               |

Field names are snake_case to match the source payload exactly. The seed set
([seed/deployments.seed.ts](../src/seed/deployments.seed.ts)) spans five services,
all statuses, and several weeks.

## API

Base URL (local): `http://localhost:3000`. Every response uses one envelope.

**Success** — `{ success: true, message, data, meta? }`. `meta` appears only on
list endpoints: `{ count, filters: { service, status } }`.

**Error** — `{ success: false, message, error: { code, details?, stack? } }`.
`stack` is included only outside production. Codes: `VALIDATION_ERROR` (400),
`NOT_FOUND` (404), `INTERNAL_ERROR` (500).

### `GET /deployments`

List deployments, optionally filtered.

| Query param | Notes                                                  |
| ----------- | ------------------------------------------------------ |
| `service`   | Exact match. Empty/whitespace → `400`.                |
| `status`    | Must be a valid status, else `400`.                   |

Unknown params are ignored; filters combine with AND. → `200` with
`data: Deployment[]`, `meta: { count, filters }`.

### `GET /deployments/:id`

→ `200` with `data: Deployment`, or `404` (`NOT_FOUND`) if no such id.

### `GET /health`

→ `200` with `data: { status: "ok", uptime }`.

## Decisions & tradeoffs

**In-memory repository behind a small interface.** The brief says the database
choice doesn't matter, the foundation does. The in-memory implementation keeps
setup to `npm install && npm run dev` with zero external services; because the
service depends on the `DeploymentRepository` interface, a real DB is a new class
implementing it. *In prod:* Postgres/Mongo with pooling, migrations, and seeding
as a separate script.

**One repository, not a generic datastore + registry.** With a single entity and
two endpoints, a generic collection-keyed store (plus a registry to resolve it)
would be unused generality. The repository interface itself is the swap seam, and
the module injects it — less indirection, trivially testable, and the abstraction
sits exactly where a second reader (e.g. a metrics module) would reuse it. A
generic datastore earns its place only once several entities share one engine.

**Validation in the service, hand-rolled.** Two query params don't justify a
schema library. Validation lives in the service (not the controller) so it's
covered by fast unit tests. *As input grows:* reach for Zod as validation
middleware.

**Consistent response envelope.** Every response is one of two typed shapes, each
carrying a `message`, built via `ok()` / `fail()`. Predictable for clients; the
error handler is the single place that renders failures. Costs one nesting level
vs. bare resources — worth it for uniformity.

**Status as an `as const` source of truth.** `DEPLOYMENT_STATUSES` drives the type
(`DeploymentStatus`), the runtime validator, and the "must be one of…" error
message from one array, so they can't drift.

**Module-per-feature, modules own their wiring.** Controller/service/repository/
routes colocated per feature; each module's router factory is its composition
root. `createApp()` mounts modules with one `app.use()` line each and never takes
a module's dependencies, so its signature doesn't grow. A route collator is
deferred until there are enough modules to warrant it — see the README.

**Stack traces only outside production.** `error.stack` is returned when
`NODE_ENV !== production` and always logged server-side — fast local debugging
without leaking internals to clients.
