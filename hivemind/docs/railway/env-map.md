# Environment Variable Map — nervous-system / production

## Known Variable Names by Service

### hivemind-api / hivemind-worker
| Variable | Value Type | Source |
|----------|-----------|--------|
| DATABASE_URL | Postgres URL | Postgres |
| REDIS_URL | Redis URL | Redis-9dW0 (DB 2) |
| QDRANT_URL | HTTP URL | qdrant.railway.internal:6333 |
| MINIO_ENDPOINT | HTTP URL | minio.railway.internal:9000 |
| MINIO_ACCESS_KEY | string | ragflow |
| MINIO_SECRET_KEY | secret | MinIO |
| MINIO_BUCKET_RAW | string | hivemind-raw |
| NEO4J_URI | Bolt URI | neo4j.railway.internal:7687 |
| NEO4J_USERNAME | string | neo4j |
| NEO4J_PASSWORD | secret | Neo4j |
| GRAPHITI_URL | HTTP URL | graphiti.railway.internal:8000 |
| DOCLING_URL | HTTP URL | docling.railway.internal:5001 |
| CRAWL4AI_URL | HTTP URL | crawl4ai.railway.internal:11235 |
| ARCHIVEBOX_URL | HTTP URL | archivebox.railway.internal:8000 |
| RAGFLOW_URL | HTTP URL | ragflow.railway.internal:80 |
| PAPERLESS_URL | HTTP URL | paperless-ngx.railway.internal:8000 |
| PERPLEXICA_URL | HTTP URL | perplexica.railway.internal:3000 |
| SEARXNG_URL | HTTP URL | searxng-railway.railway.internal:8080 |
| WORLD_MONITOR_URL | HTTP URL | app.railway.internal:80 |
| HIVEMIND_API_KEY | secret | API auth |
| AUTH_MODE | enum | api-key |
| EMBEDDING_PROVIDER | string | openai |
| EMBEDDING_MODEL | string | text-embedding-3-small |
| EMBEDDING_DIMENSIONS | number | 1536 |
| OPENAI_API_KEY | secret | OpenAI |
| LOG_LEVEL | string | info |
| NODE_ENV | string | production |
| RUN_MIGRATIONS_ON_STARTUP | bool | true |
| RUN_SEED_ON_STARTUP | bool | true |

### Paperless-ngx
| Variable | Value Type | Notes |
|----------|-----------|-------|
| PAPERLESS_REDIS | Redis URL | Points to Redis-9dW0 DB 1 |
| PAPERLESS_DBHOST | internal host | postgres-s0w.railway.internal |
| PAPERLESS_DBPORT | port | 5432 |
| PAPERLESS_DBNAME | string | railway |
| PAPERLESS_DBUSER | string | postgres |
| PAPERLESS_DBPASS | secret | — |
| PAPERLESS_SECRET_KEY | secret | — |
| PAPERLESS_ADMIN_USER | string | — |
| PAPERLESS_ADMIN_PASSWORD | secret | — |
| PAPERLESS_ADMIN_MAIL | email | — |
| PAPERLESS_URL | HTTPS URL | public |
| PAPERLESS_DATA_DIR | path | /data/data |
| PAPERLESS_MEDIA_ROOT | path | /data/media |
| PAPERLESS_CONSUMPTION_DIR | path | /data/consume |

### RAGFlow Stack
| Variable | Value Type | Service |
|----------|-----------|---------|
| REDIS_HOST | internal host | Redis-9dW0 (DB 0) |
| REDIS_PORT | port | 6379 |
| REDIS_PASSWORD | secret | Redis |
| MYSQL_HOST | internal host | mysql.railway.internal |
| MYSQL_PORT | port | 3306 |
| MYSQL_USER | string | root |
| MYSQL_PASSWORD | secret | MySQL |
| MYSQL_DBNAME | string | railway |
| ES_HOST | internal host | elasticsearch.railway.internal |
| ES_PORT | port | 9200 |
| ELASTIC_PASSWORD | secret | Elasticsearch |
| MINIO_HOST | internal host | minio.railway.internal |
| MINIO_USER | string | ragflow |
| MINIO_PASSWORD | secret | MinIO |
| DOC_ENGINE | string | elasticsearch |

### Graphiti
| Variable | Value Type | Notes |
|----------|-----------|-------|
| NEO4J_URI | Neo4j URI | neo4j://neo4j.railway.internal:7687 |
| NEO4J_USER | string | neo4j |
| NEO4J_PASSWORD | secret | neo4j |
| OPENAI_API_KEY | secret | OpenAI |

### Neo4j
| Variable | Value Type | Notes |
|----------|-----------|-------|
| NEO4J_AUTH | neo4j/password | Combined auth |
| NEO4J_PLUGINS | JSON array | apoc |
| NEO4J_db_logs_query_transaction_enabled | string | VERBOSE |

## Placeholder Variables (not yet known)

The following env names are proposed for the new Hive Mind monorepo. Exact names may vary until the implementation phase.

| Proposed Variable | Purpose | Status |
|------------------|---------|--------|
| DATABASE_URL | Hive Mind metadata Postgres | Defined |
| REDIS_URL | Hive Mind queue/cache | Uses Redis-9dW0 DB 2 |
| QDRANT_URL | Vector DB endpoint | Defined |
| MINIO_ENDPOINT | Object storage endpoint | Defined |
| MINIO_ACCESS_KEY | MinIO access key | Defined |
| MINIO_SECRET_KEY | MinIO secret key | Defined (secret) |
| NEO4J_URI | Graph DB endpoint | Defined |
| NEO4J_USERNAME | Graph DB user | Defined |
| NEO4J_PASSWORD | Graph DB password | Defined (secret) |
| GRAPHITI_URL | Graphiti knowledge graph builder | Defined |
| DOCLING_URL | Document parsing service | Defined |
| CRAWL4AI_URL | Web crawling service | Defined |
| ARCHIVEBOX_URL | Web archiving service | Defined |
| RAGFLOW_URL | RAGFlow document AI | Defined |
| PAPERLESS_URL | Document management | Defined |
| PERPLEXICA_URL | AI search | Defined |
| SEARXNG_URL | Meta search | Defined |
| WORLD_MONITOR_URL | World news monitor | Defined |
| OPENAI_API_KEY | LLM provider key | Defined (secret) |
| ANTHROPIC_API_KEY | Alternate LLM provider | Not yet set |
| OLLAMA_BASE_URL | Local LLM provider | Not yet set |
