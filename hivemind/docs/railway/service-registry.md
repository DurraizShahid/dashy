# Railway Service Registry — nervous-system / production

## Internal Host Reference

| Service Key | Internal Host | Internal Port | Public URL |
|------------|--------------|--------------|------------|
| postgres | postgres.railway.internal | 5432 | — |
| postgres-s0w | postgres-s0w.railway.internal | 5432 | — |
| redis-9dw0 | redis-9dw0.railway.internal | 6379 | — |
| minio | minio.railway.internal | 9000 | — |
| bucket | bucket.railway.internal | 9000 | https://bucket-production-888c.up.railway.app |
| mysql | mysql.railway.internal | 3306 | — |
| elasticsearch | elasticsearch.railway.internal | 9200 | — |
| neo4j | neo4j.railway.internal | 7687 (Bolt) | — |
| graphiti | graphiti.railway.internal | 8000 | https://graphiti-production-bfbe.up.railway.app |
| ragflow | ragflow.railway.internal | 80 | https://ragflow-production-31f0.up.railway.app |
| archivebox | archivebox.railway.internal | 8000 | https://archivebox-production-a86f.up.railway.app |
| crawl4ai | crawl4ai.railway.internal | 11235 | https://crawl4ai-production-3c67.up.railway.app |
| docling | docling.railway.internal | 5001 | — |
| paperless-ngx | paperless-ngx.railway.internal | 8000 | https://paperless-ngx-production-e7c7.up.railway.app |
| keycloak | keycloak.railway.internal | 8080 | https://keycloak-production-15b2.up.railway.app |
| perplexica | perplexica.railway.internal | 3000 | https://perplexica-production-caeb.up.railway.app |
| searxng | searxng-railway.railway.internal | 8080 | https://searxng-railway-production-8bee.up.railway.app |
| world-monitor | app.railway.internal | 80 | https://app-production-97d0.up.railway.app |
| qdrant | qdrant.railway.internal | 6333 | https://qdrant-production-72b1.up.railway.app |
| hivemind-api | hivemind-api.railway.internal | 8080 | https://hivemind-api-production-edd9.up.railway.app |
| hivemind-worker | hivemind-worker.railway.internal | — | — |
| dashy | dashy.railway.internal | 80 | — |
| caddy | caddy.railway.internal | 80 | https://caddy-production-a2c5.up.railway.app |
| console | console.railway.internal | 9001 | https://console-production-1c74.up.railway.app |

## Service Groups

### RAGFlow Stack
- RAGFlow (app)
- MySQL (metadata)
- Elasticsearch (full-text search)
- MinIO (object storage)
- Redis-9dW0 (cache/queue, DB 0)

### Paperless Stack
- Paperless-ngx (app)
- Postgres-S_0w (database)
- Redis-9dW0 (queue, DB 1)

### Keycloak Stack
- Keycloak (auth)
- Postgres (database)

### Hive Mind Stack
- hivemind-api (gateway)
- hivemind-worker (worker)
- Postgres (metadata — shared with Keycloak currently)
- Redis-9dW0 (queue, DB 2)
- MinIO (object storage — shared with RAGFlow)
- Neo4j (graph storage)
- Qdrant (vector storage)
- Graphiti (knowledge graph builder)
