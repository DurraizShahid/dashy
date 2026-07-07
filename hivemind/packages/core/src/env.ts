import { z } from 'zod';

const boolString = z
  .string()
  .transform((v) => v === 'true' || v === '1')
  .default('false');

export const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().default(8080),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql'),

  // Redis
  REDIS_URL: z.string().url().startsWith('redis'),

  // Vector DB
  QDRANT_URL: z.string().url().default('http://qdrant.railway.internal:6333'),

  // Object Storage
  MINIO_ENDPOINT: z.string().url().default('http://minio.railway.internal:9000'),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET_RAW: z.string().default('hivemind-raw'),

  // Graph DB
  NEO4J_URI: z.string().default('bolt://neo4j.railway.internal:7687'),
  NEO4J_USERNAME: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().min(1),

  // Knowledge Graph Builder
  GRAPHITI_URL: z.string().url().default('http://graphiti.railway.internal:8000'),

  // Document Services
  DOCLING_URL: z.string().url().default('http://docling.railway.internal:5001'),
  CRAWL4AI_URL: z.string().url().default('http://crawl4ai.railway.internal:11235'),
  ARCHIVEBOX_URL: z.string().url().default('http://archivebox.railway.internal:8000'),

  // App Services
  RAGFLOW_URL: z.string().url().default('http://ragflow.railway.internal:80'),
  PAPERLESS_URL: z.string().url().default('http://paperless-ngx.railway.internal:8000'),
  PERPLEXICA_URL: z.string().url().default('http://perplexica.railway.internal:3000'),
  SEARXNG_URL: z.string().url().default('http://searxng-railway.railway.internal:8080'),
  WORLD_MONITOR_URL: z.string().url().default('http://app.railway.internal:80'),

  // Auth
  KEYCLOAK_URL: z.string().url().default('http://keycloak.railway.internal:8080'),
  KEYCLOAK_ISSUER_URL: z.string().url().optional(),
  KEYCLOAK_CLIENT_ID: z.string().default('hivemind-api'),
  KEYCLOAK_AUDIENCE: z.string().default('hivemind-api'),

  // API key auth fallback
  HIVEMIND_API_KEY: z.string().optional(),

  // Auth mode
  AUTH_MODE: z.enum(['keycloak', 'api-key', 'hybrid']).default('hybrid'),

  // LLM
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),

  // Embedding
  EMBEDDING_PROVIDER: z.enum(['openai', 'ollama', 'azure']).default('openai'),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(1536),

  // Startup behavior
  RUN_MIGRATIONS_ON_STARTUP: boolString,
  RUN_SEED_ON_STARTUP: boolString,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(overrides?: Partial<Env>): Env {
  const source = { ...process.env, ...overrides };
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const missing = result.error.issues
      .filter((i) => i.code === 'invalid_type' && i.received === 'undefined')
      .map((i) => i.path.join('.'));
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  return result.data;
}

export function redactSensitiveEnv(env: Env): Record<string, string> {
  const secretKeys = new Set([
    'MINIO_SECRET_KEY', 'NEO4J_PASSWORD', 'HIVEMIND_API_KEY',
    'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DATABASE_URL', 'REDIS_URL',
  ]);
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = secretKeys.has(key) ? '<redacted>' : String(value);
  }
  return result;
}
