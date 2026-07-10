# Volume Map — nervous-system / production

## Attached Volumes (In Use)

| Volume Name | Service | Mount | Size | Data |
|-------------|---------|-------|------|------|
| archivebox-volume | ArchiveBox | /data | 0.1/4.9 GB | Archived web pages |
| bucket-volume | Bucket | /data | 0.2/4.9 GB | MinIO storage (orphaned) |
| minio-volume-n5cb | MinIO | /data | 0.2/4.9 GB | MinIO storage (RAGFlow) |
| mysql-volume | MySQL | /var/lib/mysql | 0.3/4.9 GB | RAGFlow metadata |
| neo4j-volume | neo4j | /data | 0.1/4.9 GB | Knowledge graph |
| paperless-ngx-volume | Paperless-ngx | /data | 0.1/4.9 GB | Documents |
| postgres-volume-7gOV | Postgres | /var/lib/postgresql/data | 0.2/4.9 GB | Keycloak DB |
| postgres-volume-W4Ci | Postgres-S_0w | /var/lib/postgresql/data | 0.2/4.9 GB | Paperless DB |
| qdrant-volume | qdrant | /qdrant/storage | 0.1/4.9 GB | Vector embeddings |
| redis-volume-MOK_ | Redis-9dW0 | /data | 0.2/4.9 GB | Redis data |

## Detached Volumes (Auto-Deleting)

See docs/railway/detached-volumes.md for details.

| Volume Name | Mount | Size | Auto-Delete | Recommendation |
|-------------|-------|------|-------------|---------------|
| n8n-volume | /home/node/.n8n | 0.15/5 GB | Jul 9 2026 | Ignore (n8n removed) |
| perplexica-volume | /home/vane/data | 0.09/5 GB | Jul 9 2026 | Ignore (Perplexica recreated) |
| postgres-volume | /var/lib/postgresql/data | 0.2/5 GB | Jul 9 2026 | Ignore (old Postgres) |
| postgres-volume-1nuY | /var/lib/postgresql/data | 0.2/5 GB | Jul 9 2026 | Ignore (old Postgres) |
| postgres-volume-BTS_ | /var/lib/postgresql/data | 0.2/5 GB | Jul 9 2026 | Ignore (old Postgres) |
| redis-volume-Mo2n | /data | 0.15/5 GB | Jul 9 2026 | Ignore (old Redis) |
| redis-volume-jOIM | /data | 0.15/5 GB | Jul 9 2026 | Ignore (old Redis) |
| searxng-railway-volume | /etc/searxng | 0.08/5 GB | Jul 9 2026 | Ignore (SearXNG recreated) |
| minio-volume | /data | 0.2/5 GB | Jul 9 2026 | Ignore (old MinIO) |
