import neo4j from 'neo4j-driver';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkNeo4jHealth(uri: string, username: string, password: string): Promise<HealthCheckResult> {
  const start = Date.now();
  let driver: ReturnType<typeof neo4j.driver> | null = null;
  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), { connectionTimeout: 5_000, maxConnectionPoolSize: 1 });
    const session = driver.session();
    try {
      const result = await session.run('RETURN 1 AS ok');
      const ok = result.records.length > 0 && result.records[0].get('ok') === 1;
      return { status: ok ? 'ok' : 'error', latencyMs: Date.now() - start, error: ok ? undefined : 'Unexpected Neo4j response' };
    } finally {
      await session.close();
    }
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  } finally {
    if (driver) await driver.close();
  }
}
