export const HIVEMIND_VERSION = '0.1.0';
export const API_PREFIX = '/api/v1';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const QUEUE_NAMES = {
  INGEST_URL: 'ingest.url',
  INGEST_FILE: 'ingest.file',
  PARSE_DOCUMENT: 'parse.document',
  INDEX_VECTOR: 'index.vector',
  INDEX_GRAPH: 'index.graph',
  SUMMARIZE_DOCUMENT: 'summarize.document',
} as const;

export const HEALTH_TIMEOUT_MS = 5_000;

export const SOURCE_TYPES = ['web', 'file', 'api', 'email', 'rss', 'manual'] as const;
export const VISIBILITY_SCOPES = ['private', 'team', 'tenant', 'public'] as const;
