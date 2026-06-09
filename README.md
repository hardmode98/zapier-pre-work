# Deployment Events Service

A small backend service that ingests and serves deployment event data. It exposes
a list endpoint (with filtering) and a single-resource endpoint, seeded with mock
deployment events.

Built with **TypeScript + Express**, organized as a real service would be:
feature modules (controller → service → repository), the repository as a small
injectable interface (so storage can be swapped without touching business logic),
centralized error handling, and a consistent response envelope.

## Quick start (under 2 minutes)

Requires **Node 18+** (developed on Node 22).

```bash
npm install
npm run dev
```

The server starts on `http://localhost:3000` and seeds 36 deployment events in
memory. Override the port with `PORT=4000 npm run dev`.

Try it:

```bash
# List all deployments
curl http://localhost:3000/deployments

# Filter by service and status
curl "http://localhost:3000/deployments?service=billing-api&status=failed"

# Fetch a single deployment
curl http://localhost:3000/deployments/deploy_001

# 404 (unknown id) and custom 404 (unknown route)
curl -i http://localhost:3000/deployments/nope
curl -i http://localhost:3000/totally/unknown

# 400 (invalid status)
curl -i "http://localhost:3000/deployments?status=bogus"

# Health check
curl http://localhost:3000/health
```

## Scripts

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Run in watch mode via `tsx` (no build step)      |
| `npm run build`     | Compile TypeScript to `dist/`                    |
| `npm start`         | Run the compiled server from `dist/`             |
| `npm test`          | Run the test suite once (Vitest)                 |
| `npm run test:watch`| Run tests in watch mode                          |
| `npm run typecheck` | Type-check without emitting                      |

## Configuration

Configuration is read once from `process.env` in [src/config/index.ts](src/config/index.ts),
with safe defaults and light validation. There is intentionally **no `.env` file
or `dotenv` dependency** — the goal is that the project runs on a clean checkout
with zero setup (`npm install && npm run dev`), so the defaults alone are enough.

| Variable   | Default       | Purpose                                              |
| ---------- | ------------- | --------------------------------------------------- |
| `NODE_ENV` | `development` | Toggles prod behavior (e.g. hides error stacks); `test` silences request logging |
| `PORT`     | `3000`        | HTTP port                                           |

Override inline when you need to: `PORT=4000 npm run dev`. The test run sets
`NODE_ENV=test` via [vitest.config.ts](vitest.config.ts).

### In production (Docker)

Environment variables are injected by the runtime rather than committed to the
repo. In a container that means:

- **Static, non-secret values** baked into the image — e.g. `ENV NODE_ENV=production`
  in the `Dockerfile`.
- **Per-deployment values** (`PORT`, etc.) passed at run time — `docker run -e PORT=8080 …`,
  Compose `environment:`, or an orchestrator (Kubernetes env vars / ConfigMap).
- **Secrets** (DB URLs, API keys, once they exist) sourced from a secret store
  (Docker/Kubernetes secrets, a vault) and exposed as env vars — never written to
  a committed `.env`.

If a `.env` workflow were ever wanted for local dev, the change is small: add
`dotenv` and load it at the very top of [src/server.ts](src/server.ts) before
`config` is imported. Production would still take its values from the
orchestrator, not a file.

## API

Two endpoints, plus a health check. Full reference in
[docs/design.md](docs/design.md#api).

- `GET /deployments` — list deployments, filter by `service` and/or `status`
- `GET /deployments/:id` — fetch a single deployment
- `GET /health` — liveness probe

Every response uses a consistent envelope (`{ success, message, data, meta? }` on
success; `{ success, message, error }` on failure).

## Project layout

```
src/
├── server.ts          # entrypoint: build app + listen + process safety nets
├── app.ts             # Express app: middleware, mounts modules, 404, error handler
├── config/            # env config from process.env, with defaults
├── http/              # response envelope interfaces + ok()/fail() builders
├── errors/            # AppError + ValidationError / NotFoundError
├── middleware/        # asyncHandler, global error handler, custom 404
├── types/             # shared domain types (Deployment, status enum, query)
├── modules/
│   └── deployments/   # controller, service, repository (the storage seam), routes
└── seed/              # mock deployment events
tests/                 # Vitest unit + supertest API tests
docs/                  # design.md — architecture, API, decisions
```

### Routing & wiring

Each module owns its own composition root: `createDeploymentsRouter()` builds its
repository → service → controllers and defaults to the in-memory repository
(seeded). `createApp()` knows nothing about any module's dependencies — it just
mounts module routers, so its signature never grows as modules are added:

```ts
app.use('/deployments', createDeploymentsRouter());
// app.use('/incidents', createIncidentsRouter());   // adding a module = one line
```

With two endpoints this direct mounting is the simplest thing that works. Once
there are several modules, the natural next step is to extract a small **route
collator** — an array of `{ basePath, createRouter }` that `app.ts` iterates —
so the app file stays flat. That's intentionally deferred here: it's structure the
current size doesn't need yet.

## Design notes

The interesting choices — the repository as an injectable storage seam, modules
that own their own wiring (so `createApp` stays dependency-free), the
module-per-feature layout, centralized error handling, and the tradeoffs behind
them — are written up in [docs/design.md](docs/design.md).
