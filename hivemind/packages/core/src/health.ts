export type HealthStatus = 'ok' | 'error' | 'skipped';

export interface HealthCheckResult {
  status: HealthStatus;
  latencyMs: number;
  error?: string;
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Record<string, HealthCheckResult>;
}

export type HealthCheckFn = () => Promise<HealthCheckResult>;

const DEFAULT_TIMEOUT_MS = 5_000;

export function withTimeout<T>(promise: Promise<T>, ms = DEFAULT_TIMEOUT_MS, label = 'check'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export async function runHealthCheck(label: string, fn: HealthCheckFn, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const result = await withTimeout(fn(), timeoutMs, label);
    return { status: result.status, latencyMs: Date.now() - start, error: result.error };
  } catch (err) {
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function aggregateHealth(checks: Record<string, HealthCheckResult>): HealthReport {
  const entries = Object.entries(checks);
  const allOk = entries.every(([, r]) => r.status === 'ok');
  const anyError = entries.some(([, r]) => r.status === 'error');

  return {
    status: allOk ? 'healthy' : anyError ? 'unhealthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  };
}

export function okResult(): HealthCheckResult {
  return { status: 'ok', latencyMs: 0 };
}

export function skipResult(reason?: string): HealthCheckResult {
  return { status: 'skipped', latencyMs: 0, error: reason };
}

export function errorResult(err: unknown): HealthCheckResult {
  return {
    status: 'error',
    latencyMs: 0,
    error: err instanceof Error ? err.message : String(err),
  };
}
