# Detached Volumes — nervous-system / production

**Date:** 2026-07-08
**Auto-delete policy:** Detached volumes auto-delete ~24 hours after detachment.

## Detached Volumes

| Volume Name | Size | Mount | Guessed Origin | Auto-Delete Date | Recommendation |
|-------------|------|-------|---------------|-----------------|---------------|
| n8n-volume | 150MB | /home/node/.n8n | n8n (workflow automation — previously removed) | Jul 9 2026 | Ignore |
| perplexica-volume | 85MB | /home/vane/data | Perplexica (recreated service) | Jul 9 2026 | Ignore |
| postgres-volume | 227MB | /var/lib/postgresql/data | Old Postgres instance | Jul 9 2026 | Ignore |
| postgres-volume-1nuY | 215MB | /var/lib/postgresql/data | Old Postgres instance | Jul 9 2026 | Ignore |
| postgres-volume-BTS_ | 201MB | /var/lib/postgresql/data | Old Postgres instance | Jul 9 2026 | Ignore |
| redis-volume-Mo2n | 149MB | /data | Old Redis instance (the one Paperless-ngx previously used) | Jul 9 2026 | Ignore |
| redis-volume-jOIM | 149MB | /data | Old Redis instance | Jul 9 2026 | Ignore |
| searxng-railway-volume | 83MB | /etc/searxng | SearXNG (recreated service) | Jul 9 2026 | Ignore |
| minio-volume | 207MB | /data | Old MinIO instance (predecessor to current MinIO) | Jul 9 2026 | Ignore |

## Notes

- All detached volumes appear to be from service reinstalls or migrations
- No volume contains data that is not already replicated in the active service volumes
- The old Redis volumes (redis-volume-Mo2n, redis-volume-jOIM) may contain cached data but no consumer relies on them
- The old postgres volumes may contain database state from before service re-creation, but current Postgres instances have their own fresh volumes
- **No rescue action recommended** for any detached volume
- User has not indicated that old data matters
