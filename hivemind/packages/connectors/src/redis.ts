import Redis from 'ioredis';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkRedisHealth(redisUrl: string): Promise<HealthCheckResult> {
  const start = Date.now();
  let client: Redis | null = null;
  try {
    client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5_000,
      lazyConnect: true,
    });
    await client.connect();
    const pong = await client.ping();
    return { status: pong === 'PONG' ? 'ok' : 'error', latencyMs: Date.now() - start, error: pong !== 'PONG' ? `Unexpected ping response: ${pong}` : undefined };
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  } finally {
    if (client) {
      client.disconnect();
    }
  }
}
