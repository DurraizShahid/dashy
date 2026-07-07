# Deploy Hive Mind API + Worker to Railway

## Prerequisites
- Railway CLI installed and logged in
- Linked to `nervous-system` project (production environment)
- Existing services: `hivemind-api` and `hivemind-worker` already exist from previous deployment

## If services already exist (redeploy)

```bash
# Link to the specific services
railway link --project nervous-system --service hivemind-api
railway up --service hivemind-api

railway link --project nervous-system --service hivemind-worker
railway up --service hivemind-worker
```

## If creating new services

```bash
# Create services from the hivemind root
cd hivemind

# Create API service
railway service create --name hivemind-api
railway link --project nervous-system --service hivemind-api
railway up --service hivemind-api

# Create Worker service
railway service create --name hivemind-worker
railway link --project nervous-system --service hivemind-worker
railway up --service hivemind-worker
```

## Required Environment Variables

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://postgres:...@postgres.railway.internal:5432/railway` | Postgres connection |
| `REDIS_URL` | `redis://default:...@redis-9dw0.railway.internal:6379/2` | Redis DB 2 for Hive Mind |
| `QDRANT_URL` | `http://qdrant.railway.internal:6333` | |
| `MINIO_ENDPOINT` | `http://minio.railway.internal:9000` | |
| `MINIO_ACCESS_KEY` | `ragflow` | |
| `MINIO_SECRET_KEY` | (from RAGFlow/MinIO) | |
| `NEO4J_URI` | `bolt://neo4j.railway.internal:7687` | |
| `NEO4J_USERNAME` | `neo4j` | |
| `NEO4J_PASSWORD` | (from Neo4j) | |
| `KEYCLOAK_URL` | `http://keycloak.railway.internal:8080` | |
| `KEYCLOAK_CLIENT_ID` | `hivemind-api` | |
| `KEYCLOAK_AUDIENCE` | `hivemind-api` | |
| `AUTH_MODE` | `hybrid` | keycloak, api-key, or hybrid |
| `HIVEMIND_API_KEY` | (optional) | API key for service-to-service auth |

## Service URLs (Private Network)

All services should use `*.railway.internal` private URLs:
- `postgres.railway.internal:5432`
- `redis-9dw0.railway.internal:6379`
- `qdrant.railway.internal:6333`
- `minio.railway.internal:9000`
- `neo4j.railway.internal:7687`
- `graphiti.railway.internal:8000`
- `docling.railway.internal:5001`
- `crawl4ai.railway.internal:11235`
- `archivebox.railway.internal:8000`
- `ragflow.railway.internal:80`
- `paperless-ngx.railway.internal:8000`
- `searxng-railway.railway.internal:8080`
- `perplexica.railway.internal:3000`
- `app.railway.internal:80`
- `keycloak.railway.internal:8080`

## Post-Deploy Verification

```bash
# Check health endpoint
curl https://hivemind-api-production-edd9.up.railway.app/health

# Check service info
curl https://hivemind-api-production-edd9.up.railway.app/

# Check version
curl https://hivemind-api-production-edd9.up.railway.app/api/v1/version

# Check service registry
curl https://hivemind-api-production-edd9.up.railway.app/api/v1/service-registry
```
