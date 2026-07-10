import postgres from 'postgres';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkPostgresHealth(databaseUrl: string): Promise<HealthCheckResult> {
  const start = Date.now();
  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = postgres(databaseUrl, { max: 1, ssl: 'require', timeout: 5_000 });
    const result = await sql`SELECT 1 AS ok`;
    await sql.end();
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  } finally {
    if (sql) await sql.end().catch(() => {});
  }
}
