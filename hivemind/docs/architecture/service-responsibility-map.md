# Service Responsibility Map

## Infrastructure Services

| Service | Role | Owner | Criticality |
|---------|------|-------|-------------|
| Redis-9dW0 | Queue / Cache / PubSub | Hive Mind | Required |
| Postgres | Metadata DB (Keycloak) | Keycloak | Required |
| Postgres-S_0w | Document DB (Paperless) | Paperless | Required |
| MySQL | RAGFlow metadata | RAGFlow | Required |
| MinIO | Object storage (RAGFlow + Hive Mind) | RAGFlow / Hive Mind | Required |
| Elasticsearch | RAGFlow full-text search | RAGFlow | Required |
| neo4j | Knowledge graph storage | Graphiti / Hive Mind | Required |

## Application Services

| Service | Role | Depends On | Public |
|---------|------|-----------|--------|
| RAGFlow | Document ingestion & retrieval | MySQL, Elasticsearch, MinIO, Redis-9dW0 | Yes |
| Paperless-ngx | Document management | Postgres-S_0w, Redis-9dW0 | Yes |
| Keycloak | Auth / SSO | Postgres | Yes |
| Graphiti | Knowledge graph builder | Neo4j, OpenAI | Yes |
| Qdrant | Vector storage | none | Yes |
| ArchiveBox | Web archiving | none | Yes |
| Crawl4AI | Web crawling | none | Yes |
| Docling | Document parsing | none | No (internal) |
| Perplexica | AI search / chat | none | Yes |
| SearXNG | Meta search engine | none | Yes |
| World Monitor | World news monitoring | none | Yes |
| Dashy | Dashboard | none | No (internal) |

## Hive Mind Core Services

| Service | Role | Depends On | Public |
|---------|------|-----------|--------|
| hivemind-api | Core API gateway | Postgres, Redis-9dW0, MinIO, Neo4j, Qdrant, Keycloak, all apps | Yes |
| hivemind-worker | Async task processor | Postgres, Redis-9dW0, MinIO, Neo4j, Qdrant | No (internal) |
