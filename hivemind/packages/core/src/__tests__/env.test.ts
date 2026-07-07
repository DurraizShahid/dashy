import { describe, it, expect } from 'vitest';
import { envSchema, validateEnv, redactEnv } from '../env';

describe('envSchema', () => {
  it('should use defaults for optional fields', () => {
    const result = envSchema.parse({});
    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(8080);
    expect(result.LOG_LEVEL).toBe('info');
    expect(result.AUTH_MODE).toBe('hybrid');
    expect(result.MINIO_BUCKET_RAW).toBe('hivemind-raw');
    expect(result.EMBEDDING_DIMENSIONS).toBe(1536);
    expect(result.RUN_MIGRATIONS_ON_STARTUP).toBe(false);
  });

  it('should parse with all required fields provided', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://postgres:pass@localhost:5432/hivemind',
      REDIS_URL: 'redis://default:pass@localhost:6379/2',
      NEO4J_PASSWORD: 'password',
    });
    expect(result.DATABASE_URL).toBe('postgresql://postgres:pass@localhost:5432/hivemind');
    expect(result.REDIS_URL).toBe('redis://default:pass@localhost:6379/2');
    expect(result.NEO4J_PASSWORD).toBe('password');
  });

  it('should use Railway internal defaults for service URLs', () => {
    const result = envSchema.parse({});
    expect(result.QDRANT_URL).toBe('http://qdrant.railway.internal:6333');
    expect(result.MINIO_ENDPOINT).toBe('http://minio.railway.internal:9000');
    expect(result.NEO4J_URI).toBe('bolt://neo4j.railway.internal:7687');
    expect(result.GRAPHITI_URL).toBe('http://graphiti.railway.internal:8000');
    expect(result.RAGFLOW_URL).toBe('http://ragflow.railway.internal:80');
    expect(result.PAPERLESS_URL).toBe('http://paperless-ngx.railway.internal:8000');
    expect(result.KEYCLOAK_URL).toBe('http://keycloak.railway.internal:8080');
  });
});

describe('validateEnv', () => {
  it('should merge overrides with process.env', () => {
    const env = validateEnv({ NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost:5432/test' });
    expect(env.NODE_ENV).toBe('test');
  });
});

describe('redactEnv', () => {
  it('should redact sensitive keys', () => {
    const env = envSchema.parse({
      DATABASE_URL: 'postgresql://secret',
      REDIS_URL: 'redis://secret',
      NEO4J_PASSWORD: 'secret',
      HIVEMIND_API_KEY: 'secret',
      OPENAI_API_KEY: 'secret',
    });
    const redacted = redactEnv(env);
    expect(redacted.DATABASE_URL).toBe('<redacted>');
    expect(redacted.REDIS_URL).toBe('<redacted>');
    expect(redacted.NEO4J_PASSWORD).toBe('<redacted>');
    expect(redacted.PORT).toBe('8080');
    expect(redacted.NODE_ENV).toBe('development');
  });
});
