export type HealthCheckType = 'tcp' | 'http' | 'postgres' | 'redis' | 'qdrant' | 'minio' | 'neo4j' | 'unknown';
export type ServiceCategory = 'database' | 'queue' | 'storage' | 'vector' | 'graph' | 'auth' | 'document' | 'search' | 'web' | 'ai' | 'monitoring' | 'proxy';

export interface ServiceEntry {
  key: string;
  displayName: string;
  category: ServiceCategory;
  purpose: string;
  requiredForPhase2: boolean;
  envVar: string;
  defaultInternalUrl: string;
  publicExposureRecommended: boolean;
  healthCheckType: HealthCheckType;
  notes: string;
}

export const serviceRegistry: ServiceEntry[] = [
  {
    key: 'postgres_metadata',
    displayName: 'Postgres (Metadata)',
    category: 'database',
    purpose: 'Primary metadata database for Hive Mind Core',
    requiredForPhase2: true,
    envVar: 'DATABASE_URL',
    defaultInternalUrl: 'postgresql://postgres:password@postgres.railway.internal:5432/railway',
    publicExposureRecommended: false,
    healthCheckType: 'postgres',
    notes: 'Primary metadata database',
  },
  {
    key: 'redis_queue',
    displayName: 'Redis (Queue/Cache)',
    category: 'queue',
    purpose: 'BullMQ job queue, caching, pub/sub',
    requiredForPhase2: true,
    envVar: 'REDIS_URL',
    defaultInternalUrl: 'redis://default:password@redis-9dw0.railway.internal:6379/2',
    publicExposureRecommended: false,
    healthCheckType: 'redis',
    notes: 'Uses DB index 2. Separate from RAGFlow (0) and Paperless (1)',
  },
  {
    key: 'minio_storage',
    displayName: 'MinIO (Object Storage)',
    category: 'storage',
    purpose: 'S3-compatible object storage for documents, images, artifacts',
    requiredForPhase2: true,
    envVar: 'MINIO_ENDPOINT',
    defaultInternalUrl: 'http://minio.railway.internal:9000',
    publicExposureRecommended: false,
    healthCheckType: 'minio',
    notes: 'Shared with RAGFlow. Bucket is duplicate MinIO, to be consolidated later',
  },
  {
    key: 'qdrant',
    displayName: 'Qdrant',
    category: 'vector',
    purpose: 'Vector database for embedding storage and similarity search',
    requiredForPhase2: true,
    envVar: 'QDRANT_URL',
    defaultInternalUrl: 'http://qdrant.railway.internal:6333',
    publicExposureRecommended: false,
    healthCheckType: 'qdrant',
    notes: '',
  },
  {
    key: 'neo4j',
    displayName: 'Neo4j',
    category: 'graph',
    purpose: 'Graph database for knowledge graph entity and relationship storage',
    requiredForPhase2: true,
    envVar: 'NEO4J_URI',
    defaultInternalUrl: 'bolt://neo4j.railway.internal:7687',
    publicExposureRecommended: false,
    healthCheckType: 'neo4j',
    notes: 'Graphiti also connects internally. TCP proxy exists for external access',
  },
  {
    key: 'graphiti',
    displayName: 'Graphiti',
    category: 'ai',
    purpose: 'Knowledge graph builder — entity extraction and relationship inference',
    requiredForPhase2: false,
    envVar: 'GRAPHITI_URL',
    defaultInternalUrl: 'http://graphiti.railway.internal:8000',
    publicExposureRecommended: true,
    healthCheckType: 'http',
    notes: 'Requires OpenAI API key for LLM calls',
  },
  {
    key: 'docling',
    displayName: 'Docling',
    category: 'document',
    purpose: 'Document parsing and conversion (PDF, DOCX, HTML, images)',
    requiredForPhase2: false,
    envVar: 'DOCLING_URL',
    defaultInternalUrl: 'http://docling.railway.internal:5001',
    publicExposureRecommended: false,
    healthCheckType: 'http',
    notes: 'IBM Docling Serve CPU',
  },
  {
    key: 'crawl4ai',
    displayName: 'Crawl4AI',
    category: 'web',
    purpose: 'Web crawling and content scraping',
    requiredForPhase2: false,
    envVar: 'CRAWL4AI_URL',
    defaultInternalUrl: 'http://crawl4ai.railway.internal:11235',
    publicExposureRecommended: false,
    healthCheckType: 'http',
    notes: '',
  },
  {
    key: 'archivebox',
    displayName: 'ArchiveBox',
    category: 'web',
    purpose: 'Web page archiving and offline browsing',
    requiredForPhase2: false,
    envVar: 'ARCHIVEBOX_URL',
    defaultInternalUrl: 'http://archivebox.railway.internal:8000',
    publicExposureRecommended: true,
    healthCheckType: 'http',
    notes: 'Stores snapshots of ingested web pages',
  },
  {
    key: 'ragflow',
    displayName: 'RAGFlow',
    category: 'ai',
    purpose: 'Document ingestion, deep document understanding, RAG pipeline',
    requiredForPhase2: false,
    envVar: 'RAGFLOW_URL',
    defaultInternalUrl: 'http://ragflow.railway.internal:80',
    publicExposureRecommended: true,
    healthCheckType: 'http',
    notes: 'Full stack: MySQL + Elasticsearch + MinIO + Redis. Do not touch env vars',
  },
  {
    key: 'ragflow_mysql',
    displayName: 'RAGFlow MySQL',
    category: 'database',
    purpose: 'RAGFlow metadata database',
    requiredForPhase2: false,
    envVar: 'none (managed by RAGFlow)',
    defaultInternalUrl: 'mysql.railway.internal:3306',
    publicExposureRecommended: false,
    healthCheckType: 'unknown',
    notes: 'Managed by RAGFlow. Do not modify',
  },
  {
    key: 'ragflow_elasticsearch',
    displayName: 'RAGFlow Elasticsearch',
    category: 'search',
    purpose: 'RAGFlow full-text search engine',
    requiredForPhase2: false,
    envVar: 'none (managed by RAGFlow)',
    defaultInternalUrl: 'http://elasticsearch.railway.internal:9200',
    publicExposureRecommended: false,
    healthCheckType: 'http',
    notes: 'Managed by RAGFlow. Do not modify',
  },
  {
    key: 'paperless',
    displayName: 'Paperless-ngx',
    category: 'document',
    purpose: 'Document management, OCR, tagging, and search',
    requiredForPhase2: false,
    envVar: 'PAPERLESS_URL',
    defaultInternalUrl: 'http://paperless-ngx.railway.internal:8000',
    publicExposureRecommended: true,
    healthCheckType: 'http',
    notes: 'Uses Postgres-S_0w and Redis-9dW0 DB 1. Do not touch env vars',
  },
  {
    key: 'searxng',
    displayName: 'SearXNG',
    category: 'search',
    purpose: 'Privacy-respecting meta search engine aggregator',
    requiredForPhase2: false,
    envVar: 'SEARXNG_URL',
    defaultInternalUrl: 'http://searxng-railway.railway.internal:8080',
    publicExposureRecommended: true,
    healthCheckType: 'http',
    notes: '',
  },
  {
    key: 'perplexica',
    displayName: 'Perplexica',
    category: 'ai',
    purpose: 'AI-powered search and chat interface',
    requiredForPhase2: false,
    envVar: 'PERPLEXICA_URL',
    defaultInternalUrl: 'http://perplexica.railway.internal:3000',
    publicExposureRecommended: true,
    healthCheckType: 'http',
    notes: '',
  },
  {
    key: 'world_monitor',
    displayName: 'World Monitor',
    category: 'monitoring',
    purpose: 'Global news monitoring and alerting',
    requiredForPhase2: false,
    envVar: 'WORLD_MONITOR_URL',
    defaultInternalUrl: 'http://app.railway.internal:80',
    publicExposureRecommended: true,
    healthCheckType: 'http',
    notes: '',
  },
];

export function getServiceEntry(key: string): ServiceEntry | undefined {
  return serviceRegistry.find((s) => s.key === key);
}

export function getRequiredServices(): ServiceEntry[] {
  return serviceRegistry.filter((s) => s.requiredForPhase2);
}

export function getOptionalServices(): ServiceEntry[] {
  return serviceRegistry.filter((s) => !s.requiredForPhase2);
}

export function getPublicServices(): ServiceEntry[] {
  return serviceRegistry.filter((s) => s.publicExposureRecommended);
}
