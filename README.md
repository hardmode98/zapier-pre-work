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

## Docs

API reference, architecture, the request/error model, configuration (and the
Docker/production approach), and the design decisions and tradeoffs all live in
[docs/design.md](docs/design.md).
