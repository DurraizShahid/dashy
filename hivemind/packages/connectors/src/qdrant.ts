import { QdrantClient } from '@qdrant/js-client-rest';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkQdrantHealth(qdrantUrl: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const client = new QdrantClient({ url: qdrantUrl, timeout: 5_000 });
    const result = await client.getCollections();
    const ok = Array.isArray(result.collections);
    return { status: ok ? 'ok' : 'error', latencyMs: Date.now() - start, error: ok ? undefined : 'Invalid collections response' };
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  }
}
