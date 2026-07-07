export interface ServiceEntry {
  key: string;
  name: string;
  purpose: string;
  internalHost: string;
  internalPort: number;
  publicUrlEnvVar?: string;
  required: boolean;
  healthCheckStrategy: 'tcp' | 'http' | 'redis-ping' | 'postgres-ping' | 'qdrant-collections' | 'minio-buckets' | 'neo4j-ping';
  futureConnectorPackage: string;
}

export const serviceRegistry: Record<string, ServiceEntry> = {
  postgres_metadata: {
    key: 'postgres_metadata',
    name: 'Postgres (Metadata)',
    purpose: 'Primary metadata database for Hive Mind Core',
    internalHost: 'postgres.railway.internal',
    internalPort: 5432,
    publicUrlEnvVar: undefined,
    required: true,
    healthCheckStrategy: 'postgres-ping',
    futureConnectorPackage: '@hivemind/db',
  },
  redis_queue: {
    key: 'redis_queue',
    name: 'Redis (Queue/Cache)',
    purpose: 'Task queue, caching, and pub/sub',
    internalHost: 'redis-9dw0.railway.internal',
    internalPort: 6379,
    publicUrlEnvVar: undefined,
    required: true,
    healthCheckStrategy: 'redis-ping',
    futureConnectorPackage: '@hivemind/core',
  },
  minio_storage: {
    key: 'minio_storage',
    name: 'MinIO (Object Storage)',
    purpose: 'S3-compatible object storage for documents, images, artifacts',
    internalHost: 'minio.railway.internal',
    internalPort: 9000,
    publicUrlEnvVar: undefined,
    required: true,
    healthCheckStrategy: 'minio-buckets',
    futureConnectorPackage: '@hivemind/connectors',
  },
  qdrant: {
    key: 'qdrant',
    name: 'Qdrant',
    purpose: 'Vector database for embeddings',
    internalHost: 'qdrant.railway.internal',
    internalPort: 6333,
    publicUrlEnvVar: 'RAILWAY_SERVICE_QDRANT_URL',
    required: true,
    healthCheckStrategy: 'qdrant-collections',
    futureConnectorPackage: '@hivemind/connectors',
  },
  neo4j: {
    key: 'neo4j',
    name: 'Neo4j',
    purpose: 'Graph database for knowledge graph',
    internalHost: 'neo4j.railway.internal',
    internalPort: 7687,
    publicUrlEnvVar: undefined,
    required: true,
    healthCheckStrategy: 'neo4j-ping',
    futureConnectorPackage: '@hivemind/connectors',
  },
  graphiti: {
    key: 'graphiti',
    name: 'Graphiti',
    purpose: 'Knowledge graph builder (entity extraction & relationships)',
    internalHost: 'graphiti.railway.internal',
    internalPort: 8000,
    publicUrlEnvVar: 'RAILWAY_SERVICE_GRAPHITI_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  paperless: {
    key: 'paperless',
    name: 'Paperless-ngx',
    purpose: 'Document management & OCR',
    internalHost: 'paperless-ngx.railway.internal',
    internalPort: 8000,
    publicUrlEnvVar: 'RAILWAY_SERVICE_PAPERLESS_NGX_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  ragflow: {
    key: 'ragflow',
    name: 'RAGFlow',
    purpose: 'Document ingestion, deep document understanding, RAG pipeline',
    internalHost: 'ragflow.railway.internal',
    internalPort: 80,
    publicUrlEnvVar: 'RAILWAY_SERVICE_RAGFLOW_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  ragflow_mysql: {
    key: 'ragflow_mysql',
    name: 'RAGFlow MySQL',
    purpose: 'RAGFlow metadata storage',
    internalHost: 'mysql.railway.internal',
    internalPort: 3306,
    publicUrlEnvVar: undefined,
    required: false,
    healthCheckStrategy: 'tcp',
    futureConnectorPackage: '@hivemind/connectors',
  },
  ragflow_elasticsearch: {
    key: 'ragflow_elasticsearch',
    name: 'RAGFlow Elasticsearch',
    purpose: 'RAGFlow full-text search engine',
    internalHost: 'elasticsearch.railway.internal',
    internalPort: 9200,
    publicUrlEnvVar: undefined,
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  docling: {
    key: 'docling',
    name: 'Docling',
    purpose: 'Document parsing & conversion (PDF, DOCX, etc.)',
    internalHost: 'docling.railway.internal',
    internalPort: 5001,
    publicUrlEnvVar: undefined,
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  crawl4ai: {
    key: 'crawl4ai',
    name: 'Crawl4AI',
    purpose: 'Web crawling & scraping',
    internalHost: 'crawl4ai.railway.internal',
    internalPort: 11235,
    publicUrlEnvVar: 'RAILWAY_SERVICE_CRAWL4AI_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  archivebox: {
    key: 'archivebox',
    name: 'ArchiveBox',
    purpose: 'Web page archiving',
    internalHost: 'archivebox.railway.internal',
    internalPort: 8000,
    publicUrlEnvVar: 'RAILWAY_SERVICE_ARCHIVEBOX_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  searxng: {
    key: 'searxng',
    name: 'SearXNG',
    purpose: 'Privacy-respecting meta search engine',
    internalHost: 'searxng-railway.railway.internal',
    internalPort: 8080,
    publicUrlEnvVar: 'RAILWAY_SERVICE_SEARXNG_RAILWAY_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  perplexica: {
    key: 'perplexica',
    name: 'Perplexica',
    purpose: 'AI-powered search & chat interface',
    internalHost: 'perplexica.railway.internal',
    internalPort: 3000,
    publicUrlEnvVar: 'RAILWAY_SERVICE_PERPLEXICA_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  world_monitor: {
    key: 'world_monitor',
    name: 'World Monitor',
    purpose: 'Global news monitoring & alerting',
    internalHost: 'app.railway.internal',
    internalPort: 80,
    publicUrlEnvVar: 'RAILWAY_SERVICE_WORLD_MONITOR_URL',
    required: false,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
  keycloak: {
    key: 'keycloak',
    name: 'Keycloak',
    purpose: 'Authentication, SSO, user management',
    internalHost: 'keycloak.railway.internal',
    internalPort: 8080,
    publicUrlEnvVar: 'RAILWAY_SERVICE_KEYCLOAK_URL',
    required: true,
    healthCheckStrategy: 'http',
    futureConnectorPackage: '@hivemind/connectors',
  },
};

export function getService(key: string): ServiceEntry | undefined {
  return serviceRegistry[key];
}

export function listRequiredServices(): ServiceEntry[] {
  return Object.values(serviceRegistry).filter((s) => s.required);
}

export function listOptionalServices(): ServiceEntry[] {
  return Object.values(serviceRegistry).filter((s) => !s.required);
}

export function getHealthCheckEndpoints(): Array<{ key: string; strategy: ServiceEntry['healthCheckStrategy']; host: string; port: number }> {
  return Object.values(serviceRegistry).map((s) => ({
    key: s.key,
    strategy: s.healthCheckStrategy,
    host: s.internalHost,
    port: s.internalPort,
  }));
}
