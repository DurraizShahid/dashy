import { Client as MinioClient } from 'minio';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkMinioHealth(endpoint: string, accessKey: string, secretKey: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const url = new URL(endpoint);
    const client = new MinioClient({
      endPoint: url.hostname,
      port: url.port ? parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 9000,
      useSSL: url.protocol === 'https:',
      accessKey,
      secretKey,
    });
    await client.listBuckets();
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  }
}
