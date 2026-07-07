import { Hono } from 'hono';
import { validateEnv, runHealthCheck, aggregateHealth, type HealthCheckResult } from '@hivemind/core';
import {
  checkPostgresHealth,
  checkRedisHealth,
  checkQdrantHealth,
  checkMinioHealth,
  checkNeo4jHealth,
  checkGraphitiHealth,
  checkDoclingHealth,
  checkCrawl4AIHealth,
  checkArchiveBoxHealth,
  checkRAGFlowHealth,
  checkPaperlessHealth,
  checkSearXNGHealth,
  checkPerplexicaHealth,
  checkWorldMonitorHealth,
  checkKeycloakHealth,
} from '@hivemind/connectors';

const healthRouter = new Hono();

healthRouter.get('/', async (c) => {
  let env: ReturnType<typeof validateEnv>;
  try {
    env = validateEnv();
  } catch (err) {
    return c.json({
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      checks: {
        env: { status: 'error' as const, latencyMs: 0, error: err instanceof Error ? err.message : String(err) },
      },
    }, 503);
  }

  const checks: Record<string, HealthCheckResult> = {};

  checks.self = await runHealthCheck('self', async () => ({ status: 'ok' as const, latencyMs: 0 }));

  if (env.DATABASE_URL) {
    const dbUrl: string = env.DATABASE_URL;
    checks.postgres = await runHealthCheck('postgres', () => checkPostgresHealth(dbUrl));
  } else {
    checks.postgres = { status: 'skipped', latencyMs: 0, error: 'DATABASE_URL not set' };
  }

  if (env.REDIS_URL) {
    const redisUrl: string = env.REDIS_URL;
    checks.redis = await runHealthCheck('redis', () => checkRedisHealth(redisUrl));
  } else {
    checks.redis = { status: 'skipped', latencyMs: 0, error: 'REDIS_URL not set' };
  }

  checks.qdrant = await runHealthCheck('qdrant', () => checkQdrantHealth(env.QDRANT_URL));
  checks.minio = await runHealthCheck('minio', () => checkMinioHealth(env.MINIO_ENDPOINT, env.MINIO_ACCESS_KEY ?? '', env.MINIO_SECRET_KEY ?? ''));
  checks.neo4j = await runHealthCheck('neo4j', () => checkNeo4jHealth(env.NEO4J_URI, env.NEO4J_USERNAME, env.NEO4J_PASSWORD ?? ''));
  checks.graphiti = await runHealthCheck('graphiti', () => checkGraphitiHealth(env.GRAPHITI_URL));
  checks.docling = await runHealthCheck('docling', () => checkDoclingHealth(env.DOCLING_URL));
  checks.crawl4ai = await runHealthCheck('crawl4ai', () => checkCrawl4AIHealth(env.CRAWL4AI_URL));
  checks.archivebox = await runHealthCheck('archivebox', () => checkArchiveBoxHealth(env.ARCHIVEBOX_URL));
  checks.ragflow = await runHealthCheck('ragflow', () => checkRAGFlowHealth(env.RAGFLOW_URL));
  checks.paperless = await runHealthCheck('paperless', () => checkPaperlessHealth(env.PAPERLESS_URL));
  checks.searxng = await runHealthCheck('searxng', () => checkSearXNGHealth(env.SEARXNG_URL));
  checks.perplexica = await runHealthCheck('perplexica', () => checkPerplexicaHealth(env.PERPLEXICA_URL));
  checks.world_monitor = await runHealthCheck('world_monitor', () => checkWorldMonitorHealth(env.WORLD_MONITOR_URL));
  checks.keycloak = await runHealthCheck('keycloak', () => checkKeycloakHealth(env.KEYCLOAK_URL));

  const report = aggregateHealth(checks);
  const statusCode = report.status === 'healthy' ? 200 : report.status === 'degraded' ? 200 : 503;

  return c.json(report, statusCode);
});

export { healthRouter };
