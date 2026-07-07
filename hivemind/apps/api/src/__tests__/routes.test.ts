import { describe, it, expect } from 'vitest';
import { createApp } from '../server';

describe('API routes', () => {
  const { app } = createApp();

  it('GET / should return service info', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.service).toBe('Hive Mind API');
    expect(body.version).toBeDefined();
    expect(body.status).toBe('running');
  });

  it('GET /api/v1/version should return version', async () => {
    const res = await app.request('/api/v1/version');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.version).toBe('0.1.0');
  });

  it('GET /api/v1/service-registry should return service list', async () => {
    const res = await app.request('/api/v1/service-registry');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.services).toBeInstanceOf(Array);
    expect(body.services.length).toBeGreaterThan(0);
    expect(body.services[0]).toHaveProperty('key');
    expect(body.services[0]).toHaveProperty('displayName');
    expect(body.services[0]).toHaveProperty('category');
    expect(body.services[0]).not.toHaveProperty('envVar');
  });

  it('GET /health should return health report', async () => {
    const res = await app.request('/health');
    const body: any = await res.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('checks');
    expect(body.checks).toHaveProperty('self');
    expect(body.checks).toHaveProperty('qdrant');
    expect(body.checks).toHaveProperty('minio');
    expect(body.checks).toHaveProperty('neo4j');
    // In test environment without real services, status is unhealthy (503)
    expect([200, 503]).toContain(res.status);
  });

  it('POST /api/v1/agent/context should return 501 for valid body', async () => {
    const res = await app.request('/api/v1/agent/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test query' }),
    });
    expect(res.status).toBe(501);
    const body: any = await res.json();
    expect(body.accepted).toBe(false);
  });

  it('POST /api/v1/agent/context should return 400 for empty body', async () => {
    const res = await app.request('/api/v1/agent/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/ingest should return 501 for valid URL', async () => {
    const res = await app.request('/api/v1/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });
    expect(res.status).toBe(501);
    const body: any = await res.json();
    expect(body.accepted).toBe(false);
  });

  it('GET /nonexistent should return 404', async () => {
    const res = await app.request('/nonexistent');
    expect(res.status).toBe(404);
  });
});
