import { z } from 'zod';

const boolString = z
  .string()
  .transform((v) => v === 'true' || v === '1')
  .default('false');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PUBLIC_BASE_URL: z.string().url().optional(),
  HIVEMIND_API_KEY: z.string().optional(),

  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  QDRANT_URL: z.string().url().default('http://qdrant.railway.internal:6333'),

  MINIO_ENDPOINT: z.string().url().default('http://minio.railway.internal:9000'),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET_RAW: z.string().default('hivemind-raw'),

  NEO4J_URI: z.string().default('bolt://neo4j.railway.internal:7687'),
  NEO4J_USERNAME: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().optional(),

  GRAPHITI_URL: z.string().url().default('http://graphiti.railway.internal:8000'),

  DOCLING_URL: z.string().url().default('http://docling.railway.internal:5001'),
  CRAWL4AI_URL: z.string().url().default('http://crawl4ai.railway.internal:11235'),
  ARCHIVEBOX_URL: z.string().url().default('http://archivebox.railway.internal:8000'),

  RAGFLOW_URL: z.string().url().default('http://ragflow.railway.internal:80'),
  PAPERLESS_URL: z.string().url().default('http://paperless-ngx.railway.internal:8000'),
  PERPLEXICA_URL: z.string().url().default('http://perplexica.railway.internal:3000'),
  SEARXNG_URL: z.string().url().default('http://searxng-railway.railway.internal:8080'),
  WORLD_MONITOR_URL: z.string().url().default('http://app.railway.internal:80'),

  KEYCLOAK_URL: z.string().url().default('http://keycloak.railway.internal:8080'),
  KEYCLOAK_ISSUER_URL: z.string().url().optional(),
  KEYCLOAK_CLIENT_ID: z.string().default('hivemind-api'),
  KEYCLOAK_AUDIENCE: z.string().default('hivemind-api'),
  AUTH_MODE: z.enum(['keycloak', 'api-key', 'hybrid']).default('hybrid'),

  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),

  EMBEDDING_PROVIDER: z.enum(['openai', 'ollama', 'azure']).default('openai'),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(1536),

  RUN_MIGRATIONS_ON_STARTUP: boolString,
  RUN_SEED_ON_STARTUP: boolString,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(overrides?: Partial<Env>): Env {
  const source = { ...process.env, ...overrides } as Record<string, unknown>;
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues
      .filter((i) => i.code === 'invalid_type' && i.received === 'undefined')
      .map((i) => i.path.join('.'));
    if (missing.length > 0) {
      throw new Error(`Missing required env: ${missing.join(', ')}`);
    }
    throw new Error(`Env validation: ${result.error.message}`);
  }
  return result.data;
}

const SECRET_KEYS = new Set([
  'MINIO_SECRET_KEY', 'NEO4J_PASSWORD', 'HIVEMIND_API_KEY',
  'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DATABASE_URL', 'REDIS_URL',
]);

export function redactEnv(env: Env): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    out[k] = v !== undefined ? (SECRET_KEYS.has(k) ? '<redacted>' : String(v)) : '(undefined)';
  }
  return out;
}
