# Railway Audit Summary — nervous-system / production

**Date:** 2026-07-08
**Project:** nervous-system
**Environment:** production
**Auditor:** Phase 1 Stabilization

## Services Overview

| Service | Status | Image/Repo | Public URL | Volume |
|---------|--------|-----------|-----------|--------|
| ArchiveBox | Online | archivebox/archivebox | https://archivebox-production-a86f.up.railway.app | archivebox-volume (0.1GB/5GB) |
| Bucket | Online | railwayapp-templates/minio | https://bucket-production-888c.up.railway.app | bucket-volume (0.2GB/5GB) |
| caddy | Online | bon5co/docling-railway-template | https://caddy-production-a2c5.up.railway.app | none |
| Console | Online | railwayapp-templates/minio-console | https://console-production-1c74.up.railway.app | none |
| Crawl4AI | Online | unclecode/crawl4ai:latest | https://crawl4ai-production-3c67.up.railway.app | none |
| dashy | Online | DurraizShahid/dashy | none (internal) | none |
| docling | Online | quay.io/docling-project/docling-serve-cpu:latest | none (internal) | none |
| Elasticsearch | Online | elasticsearch:8.11.3 | none (internal) | none |
| graphiti | Online | zepai/graphiti:latest | https://graphiti-production-bfbe.up.railway.app | none |
| hivemind-api | Online | DurraizShahid/ensemble | https://hivemind-api-production-edd9.up.railway.app | none |
| hivemind-worker | Online | DurraizShahid/ensemble | none (internal) | none |
| Keycloak | Online | leonardochappuis/keycloak-docker | https://keycloak-production-15b2.up.railway.app | none |
| MinIO | Online | quay.io/minio/minio:latest | none (internal) | minio-volume-n5cb (0.2GB/5GB) |
| MySQL | Online | mysql:9.4 | none (internal) | mysql-volume (0.3GB/5GB) |
| neo4j | Online | neo4j:5.26.2 | none (internal) | neo4j-volume (0.1GB/5GB) |
| Paperless-ngx | Online | paperlessngx/paperless-ngx:latest | https://paperless-ngx-production-e7c7.up.railway.app | paperless-ngx-volume (0.1GB/5GB) |
| Perplexica | Online | itzcrazykns1337/vane:latest | https://perplexica-production-caeb.up.railway.app | none |
| Postgres | Online | ghcr.io/railwayapp-templates/postgres-ssl:latest | none (internal) | postgres-volume-7gOV (0.2GB/5GB) |
| Postgres-S_0w | Online | ghcr.io/railwayapp-templates/postgres-ssl:18 | none (internal) | postgres-volume-W4Ci (0.2GB/5GB) |
| qdrant | Online | qdrant/qdrant | https://qdrant-production-72b1.up.railway.app | qdrant-volume (0.1GB/5GB) |
| RAGFlow | Online | infiniflow/ragflow:v0.25.2 | https://ragflow-production-31f0.up.railway.app | none |
| Redis-9dW0 | Online | redis:8.2.1 | none (internal) | redis-volume-MOK_ (0.2GB/5GB) |
| searxng-railway | Online | protemplate/searxng | https://searxng-railway-production-8bee.up.railway.app | none |
| world-monitor | Online | xiaosong233/worldmonitor-railway:latest | https://app-production-97d0.up.railway.app | none |

## Audit Findings (Current State)

### Paperless Redis
- **Status: ALREADY FIXED**
- Paperless-ngx `PAPERLESS_REDIS` points to `redis://default:...@redis-9dw0.railway.internal:6379/1` (DB index 1)
- RAGFlow uses the same Redis-9dW0 at default DB 0 via `REDIS_HOST`/`REDIS_PORT`
- hivemind-api/worker uses DB index 2 via `REDIS_URL`
- No separate crashed Redis service exists; the old Redis service has been removed.
- Detached Redis volumes (redis-volume-Mo2n, redis-volume-jOIM) exist and are set to auto-delete.

### Graphiti → Neo4j
- **Status: ALREADY INTERNAL**
- Graphiti `NEO4J_URI` = `neo4j://neo4j.railway.internal:7687`
- Neo4j Bolt port 7687 confirmed on internal network

### Postgres
- Two Postgres instances:
  - **Postgres** (postgres.railway.internal) — used by Keycloak
  - **Postgres-S_0w** (postgres-s0w.railway.internal) — used by Paperless-ngx
- hivemind-api currently connects to Postgres (Keycloak's DB) — needs its own DB in future

### Object Storage
- Two MinIO instances:
  - **MinIO** (minio.railway.internal) — used by RAGFlow and hivemind-api/worker
  - **Bucket** (bucket.railway.internal) — no consuming services, appears to be duplicate
- hivemind-api uses MINIO_ENDPOINT pointing to minio.railway.internal (not Bucket)

### Redis Logical DB Allocation
| DB Index | Consumer |
|----------|----------|
| 0 (default) | RAGFlow |
| 1 | Paperless-ngx |
| 2 | hivemind-api + hivemind-worker |

### Detached Volumes (auto-delete imminent)
See docs/railway/detached-volumes.md for full list.
