import { describe, it, expect } from 'vitest';
import { runHealthCheck, aggregateHealth, withTimeout } from '../health';

describe('runHealthCheck', () => {
  it('should return ok for successful check', async () => {
    const result = await runHealthCheck('test', async () => ({ status: 'ok' as const, latencyMs: 0 }));
    expect(result.status).toBe('ok');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should return error for failing check', async () => {
    const result = await runHealthCheck('test', async () => { throw new Error('fail'); });
    expect(result.status).toBe('error');
    expect(result.error).toBe('fail');
  });

  it('should handle timeout', async () => {
    const result = await runHealthCheck('slow', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { status: 'ok' as const, latencyMs: 0 };
    }, 50);
    expect(result.status).toBe('error');
    expect(result.error).toContain('timed out');
  });
});

describe('aggregateHealth', () => {
  it('should return healthy when all ok', () => {
    const report = aggregateHealth({
      a: { status: 'ok', latencyMs: 1 },
      b: { status: 'ok', latencyMs: 2 },
    });
    expect(report.status).toBe('healthy');
  });

  it('should return unhealthy when any error', () => {
    const report = aggregateHealth({
      a: { status: 'ok', latencyMs: 1 },
      b: { status: 'error', latencyMs: 2, error: 'fail' },
    });
    expect(report.status).toBe('unhealthy');
  });

  it('should include timestamp', () => {
    const report = aggregateHealth({ a: { status: 'ok', latencyMs: 0 } });
    expect(report.timestamp).toBeDefined();
    expect(() => new Date(report.timestamp)).not.toThrow();
  });
});

describe('withTimeout', () => {
  it('should resolve fast promise', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 100);
    expect(result).toBe('ok');
  });

  it('should reject on timeout', async () => {
    await expect(withTimeout(new Promise((r) => setTimeout(r, 200)), 50)).rejects.toThrow('timed out');
  });
});
