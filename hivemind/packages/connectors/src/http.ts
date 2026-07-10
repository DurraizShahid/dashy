import type { HealthCheckResult } from '@hivemind/core';

const DEFAULT_TIMEOUT_MS = 5_000;

export async function checkHttpHealth(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { method: 'GET', signal: controller.signal });
      const ok = response.status >= 200 && response.status < 500;
      return { status: ok ? 'ok' : 'error', latencyMs: Date.now() - start, error: ok ? undefined : `HTTP ${response.status}` };
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('abort')) {
      return { status: 'error', latencyMs: Date.now() - start, error: 'timeout' };
    }
    return { status: 'error', latencyMs: Date.now() - start, error: message };
  }
}
