# Production Baseline — nervous-system

## Project
- **Railway Project:** nervous-system
- **Environment:** production
- **Region:** Southeast Asia (asia-southeast1-eqsg3a)
- **Total Services:** 24
- **Total Volumes:** 17 (8 attached, 9 detached/auto-deleting)

## Network Topology
- All services on same Railway private network
- Internal DNS: `*.railway.internal`
- External URLs via `*.up.railway.app`
- TCP proxy for Neo4j: `hayabusa.proxy.rlwy.net:17961` (external)
- TCP proxy for Postgres: `hayabusa.proxy.rlwy.net:52908` (external)

## Redis Topology
- Single Redis instance (Redis-9dW0, redis:8.2.1)
- 3 logical databases: DB 0 (RAGFlow), DB 1 (Paperless), DB 2 (Hive Mind)
- Redis-9dW0 internal host: `redis-9dw0.railway.internal:6379`

## Database Topology
- **Postgres** (postgres.railway.internal:5432) — Keycloak, Hive Mind API/Worker
- **Postgres-S_0w** (postgres-s0w.railway.internal:5432) — Paperless-ngx
- **MySQL** (mysql.railway.internal:3306) — RAGFlow

## Object Storage
- **MinIO** (minio.railway.internal:9000) — RAGFlow + Hive Mind (active)
- **Bucket** (bucket.railway.internal:9000) — orphaned duplicate (no consumers)

## Graph Storage
- **Neo4j** (neo4j.railway.internal:7687) — Graphiti knowledge graph
- Graphiti connects via internal network (already resolved)

## Hive Mind API Configuration
- Auth: Hybrid mode (Keycloak + API key)
- Keycloak realm: `hivemind`
- Default tenant: `internal`
- Default project: `default`
- Embedding: OpenAI text-embedding-3-small (1536d)
