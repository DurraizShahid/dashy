# Hive Mind AI Knowledge OS

A production-grade AI Knowledge Operating System deployed on Railway.

## Status

**Phase 2 Complete.** Core API + Worker scaffold deployed. Health checks operational. Stubs in place for ingestion and agent context retrieval. No real data processing yet.

## Architecture

```
apps/
  api/        Hono HTTP API — /health, service registry, auth, stubs
  worker/     BullMQ worker — placeholder processors for 6 queues
  web/        Not yet implemented

packages/
  core/       Env validation (Zod), service registry, logger (Pino), errors, health utilities
  db/         Drizzle ORM schema (18 tables), migration config
  connectors/ Health check clients for 15+ Railway services
  shared/     Types, Zod schemas, constants
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Setup

```bash
pnpm install
cp .env.example .env
# Edit .env with real values
```

## Development

```bash
# Run API in watch mode
pnpm --filter @hivemind/api dev

# Run Worker in watch mode
pnpm --filter @hivemind/worker dev

# Typecheck all packages
pnpm typecheck

# Run tests
pnpm test

# Build all packages
pnpm build
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Postgres connection | Yes |
| `REDIS_URL` | Redis connection | Yes (Worker) |
| `QDRANT_URL` | Vector DB | No (default: internal) |
| `MINIO_ENDPOINT` | Object storage | No (default: internal) |
| `NEO4J_URI` | Graph DB | No (default: internal) |

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Service info |
| GET | `/health` | Service health (all 16 checks) |
| GET | `/api/v1/version` | Version info |
| GET | `/api/v1/service-registry` | Service metadata |
| POST | `/api/v1/agent/context` | Agent context retrieval (stub) |
| POST | `/api/v1/ingest` | URL/file ingestion (stub) |

## Worker Queues

| Queue | Purpose | Status |
|-------|---------|--------|
| `ingest.url` | URL ingestion | Stub |
| `ingest.file` | File ingestion | Stub |
| `parse.document` | Document parsing | Stub |
| `index.vector` | Vector embedding | Stub |
| `index.graph` | Knowledge graph | Stub |
| `summarize.document` | Document summarization | Stub |

## Railway Deployment

See `docs/railway/deploy-api-worker.md`.

## License

Private — internal use.
