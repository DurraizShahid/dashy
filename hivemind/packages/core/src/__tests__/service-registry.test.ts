import { describe, it, expect } from 'vitest';
import { serviceRegistry, getServiceEntry, getRequiredServices, getOptionalServices, getPublicServices } from '../service-registry';

describe('serviceRegistry', () => {
  it('should contain all expected services', () => {
    const keys = serviceRegistry.map((s) => s.key);
    expect(keys).toContain('postgres_metadata');
    expect(keys).toContain('redis_queue');
    expect(keys).toContain('minio_storage');
    expect(keys).toContain('qdrant');
    expect(keys).toContain('neo4j');
    expect(keys).toContain('graphiti');
    expect(keys).toContain('docling');
    expect(keys).toContain('crawl4ai');
    expect(keys).toContain('archivebox');
    expect(keys).toContain('ragflow');
    expect(keys).toContain('paperless');
    expect(keys).toContain('searxng');
    expect(keys).toContain('perplexica');
    expect(keys).toContain('world_monitor');
  });

  it('should have unique keys', () => {
    const keys = serviceRegistry.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('should have valid healthCheckType for all entries', () => {
    const validTypes = ['tcp', 'http', 'postgres', 'redis', 'qdrant', 'minio', 'neo4j', 'unknown'];
    for (const entry of serviceRegistry) {
      expect(validTypes).toContain(entry.healthCheckType);
    }
  });

  it('should have required services for Phase 2', () => {
    const required = getRequiredServices();
    expect(required.length).toBeGreaterThanOrEqual(6);
    const requiredKeys = required.map((s) => s.key);
    expect(requiredKeys).toContain('postgres_metadata');
    expect(requiredKeys).toContain('redis_queue');
    expect(requiredKeys).toContain('minio_storage');
    expect(requiredKeys).toContain('qdrant');
    expect(requiredKeys).toContain('neo4j');
  });
});

describe('getServiceEntry', () => {
  it('should find service by key', () => {
    const entry = getServiceEntry('qdrant');
    expect(entry).toBeDefined();
    expect(entry!.displayName).toBe('Qdrant');
    expect(entry!.category).toBe('vector');
    expect(entry!.healthCheckType).toBe('qdrant');
  });

  it('should return undefined for unknown key', () => {
    expect(getServiceEntry('nonexistent')).toBeUndefined();
  });
});

describe('getPublicServices', () => {
  it('should return services with publicExposureRecommended', () => {
    const publicServices = getPublicServices();
    const keys = publicServices.map((s) => s.key);
    expect(keys).toContain('paperless');
    expect(keys).toContain('ragflow');
    expect(keys).toContain('archivebox');
  });
});
