# Health Check Plan — Hive Mind Core API

## Endpoint: GET /health

### Response Format
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "ISO-8601",
  "checks": {
    "<service-key>": {
      "status": "ok" | "error",
      "latency_ms": 123,
      "error": "optional error message"
    }
  }
}
```

## Health Checks

### 1. Postgres Connectivity (postgres_metadata)
- **Strategy:** `pg.Pool.query('SELECT 1')`
- **Expect:** Returns `[{ "1": 1 }]`
- **Failure:** Database unreachable or authentication failure
- **Status:** REQUIRED — if fails, overall status = unhealthy

### 2. Redis Ping (redis_queue)
- **Strategy:** `redisClient.ping()`
- **Expect:** Returns `'PONG'`
- **Failure:** Redis unreachable
- **Status:** REQUIRED — if fails, overall status = unhealthy

### 3. Qdrant Collection List (qdrant)
- **Strategy:** `GET /collections` on Qdrant HTTP API
- **Expect:** Returns collection list (may be empty)
- **Failure:** Qdrant unreachable
- **Status:** REQUIRED — if fails, overall status = unhealthy

### 4. MinIO Bucket List (minio_storage)
- **Strategy:** `listBuckets()` via MinIO client SDK
- **Expect:** Returns bucket list containing at least `hivemind-raw`
- **Failure:** MinIO unreachable or access denied
- **Status:** REQUIRED — if fails, overall status = unhealthy

### 5. Neo4j Ping (neo4j)
- **Strategy:** `neo4j.session.run('RETURN 1')`
- **Expect:** Returns record with `1`
- **Failure:** Neo4j unreachable or authentication failure
- **Status:** REQUIRED — if fails, overall status = unhealthy

### 6. Keycloak HTTP Health (keycloak)
- **Strategy:** `GET /health` on Keycloak health endpoint
- **Expect:** HTTP 200
- **Failure:** Keycloak unreachable
- **Status:** REQUIRED — if fails, overall status = degraded (auth unavailable)

### 7. Docling HTTP Health (docling)
- **Strategy:** `GET /health` on Docling
- **Expect:** HTTP 200
- **Failure:** Docling unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 8. Crawl4AI HTTP Health (crawl4ai)
- **Strategy:** `GET /health` on Crawl4AI
- **Expect:** HTTP 200
- **Failure:** Crawl4AI unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 9. RAGFlow HTTP Health (ragflow)
- **Strategy:** `GET /` or health endpoint
- **Expect:** HTTP 200
- **Failure:** RAGFlow unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 10. Paperless HTTP Health (paperless)
- **Strategy:** `GET /api/` on Paperless-ngx
- **Expect:** HTTP 200
- **Failure:** Paperless unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 11. ArchiveBox HTTP Health (archivebox)
- **Strategy:** `GET /health` or root endpoint
- **Expect:** HTTP 200
- **Failure:** ArchiveBox unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 12. SearXNG HTTP Health (searxng)
- **Strategy:** `GET /health` or root endpoint
- **Expect:** HTTP 200
- **Failure:** SearXNG unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 13. Perplexica HTTP Health (perplexica)
- **Strategy:** `GET /api/health` or root endpoint
- **Expect:** HTTP 200
- **Failure:** Perplexica unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 14. World Monitor HTTP Health (world_monitor)
- **Strategy:** `GET /health` or root endpoint
- **Expect:** HTTP 200
- **Failure:** World Monitor unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

### 15. Graphiti HTTP Health (graphiti)
- **Strategy:** `GET /health` on Graphiti
- **Expect:** HTTP 200
- **Failure:** Graphiti unreachable
- **Status:** OPTIONAL — if fails, overall status = degraded

## Status Computation

| Required Checks | Optional Checks | Overall Status |
|----------------|----------------|---------------|
| All pass | Any state | healthy |
| All pass | 1+ fail | degraded |
| 1+ fail | Any state | unhealthy |
