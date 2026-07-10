import { pgTable, uuid, text, integer, jsonb, timestamp, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';

export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'suspended', 'archived']);
export const projectStatusEnum = pgEnum('project_status', ['active', 'archived']);
export const documentTypeEnum = pgEnum('document_type', ['pdf', 'docx', 'html', 'md', 'txt', 'image', 'audio', 'video', 'code', 'email', 'other']);
export const documentStatusEnum = pgEnum('document_status', ['pending', 'processing', 'ready', 'error', 'archived']);
export const sourceTypeEnum = pgEnum('source_type', ['web', 'file', 'api', 'email', 'rss', 'manual']);
export const visibilityScopeEnum = pgEnum('visibility_scope', ['private', 'team', 'tenant', 'public']);
export const sensitivityLevelEnum = pgEnum('sensitivity_level', ['low', 'medium', 'high', 'critical']);
export const approvalStatusEnum = pgEnum('approval_status', ['draft', 'pending_review', 'approved', 'rejected', 'archived']);
export const jobTypeEnum = pgEnum('job_type', ['ingest.url', 'ingest.file', 'parse.document', 'index.vector', 'index.graph', 'summarize.document']);
export const jobStatusEnum = pgEnum('job_status', ['queued', 'active', 'completed', 'failed', 'retrying']);
export const principalTypeEnum = pgEnum('principal_type', ['user', 'group', 'service']);
export const assetTypeEnum = pgEnum('asset_type', ['insight', 'pattern', 'decision', 'summary']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: tenantStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  status: projectStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tenantProjectSlugIdx: uniqueIndex('idx_projects_tenant_slug').on(table.tenantId, table.slug),
  tenantIdIdx: index('idx_projects_tenant_id').on(table.tenantId),
}));

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  sourceType: sourceTypeEnum('source_type').notNull(),
  name: text('name').notNull(),
  uri: text('uri'),
  externalId: text('external_id'),
  trustScore: integer('trust_score'),
  freshnessPolicy: text('freshness_policy'),
  visibilityScope: visibilityScopeEnum('visibility_scope').notNull().default('private'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index('idx_sources_tenant_id').on(table.tenantId),
  projectIdIdx: index('idx_sources_project_id').on(table.projectId),
}));

export const rawObjects = pgTable('raw_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'set null' }),
  objectStore: text('object_store').notNull().default('minio'),
  bucket: text('bucket').notNull(),
  objectKey: text('object_key').notNull(),
  contentType: text('content_type'),
  sizeBytes: integer('size_bytes'),
  checksum: text('checksum'),
  originalFilename: text('original_filename'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index('idx_raw_objects_tenant_id').on(table.tenantId),
  objectStoreBucketKeyIdx: index('idx_raw_objects_store_bucket_key').on(table.objectStore, table.bucket, table.objectKey),
}));

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'set null' }),
  rawObjectId: uuid('raw_object_id').references(() => rawObjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  documentType: documentTypeEnum('document_type').notNull(),
  status: documentStatusEnum('status').notNull().default('pending'),
  visibilityScope: visibilityScopeEnum('visibility_scope').notNull().default('private'),
  sensitivityLevel: sensitivityLevelEnum('sensitivity_level').notNull().default('low'),
  language: text('language'),
  summary: text('summary'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index('idx_documents_tenant_id').on(table.tenantId),
  projectIdIdx: index('idx_documents_project_id').on(table.projectId),
  documentIdIdx: index('idx_documents_source_id').on(table.sourceId),
  statusIdx: index('idx_documents_status').on(table.status),
}));

export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  tokenCount: integer('token_count'),
  embeddingProvider: text('embedding_provider'),
  embeddingModel: text('embedding_model'),
  qdrantCollection: text('qdrant_collection'),
  qdrantPointId: text('qdrant_point_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index('idx_chunks_tenant_id').on(table.tenantId),
  documentIdIdx: index('idx_chunks_document_id').on(table.documentId),
}));

export const knowledgeAssets = pgTable('knowledge_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'set null' }),
  assetType: assetTypeEnum('asset_type').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  content: jsonb('content').$type<Record<string, unknown>>().default({}),
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('draft'),
  visibilityScope: visibilityScopeEnum('visibility_scope').notNull().default('private'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index('idx_knowledge_assets_tenant_id').on(table.tenantId),
  projectIdIdx: index('idx_knowledge_assets_project_id').on(table.projectId),
}));

export const playbooks = pgTable('playbooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  purpose: text('purpose').notNull(),
  triggerConditions: jsonb('trigger_conditions').$type<Record<string, unknown>[]>().default([]),
  steps: jsonb('steps').$type<Record<string, unknown>[]>().default([]),
  doNotDo: jsonb('do_not_do').$type<Record<string, unknown>[]>().default([]),
  requiredContext: jsonb('required_context').$type<Record<string, unknown>[]>().default([]),
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index('idx_playbooks_tenant_id').on(table.tenantId),
  projectIdIdx: index('idx_playbooks_project_id').on(table.projectId),
}));

export const agentSkills = pgTable('agent_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  triggerPhrases: jsonb('trigger_phrases').$type<string[]>().default([]),
  requiredInputs: jsonb('required_inputs').$type<Record<string, unknown>[]>().default([]),
  allowedTools: jsonb('allowed_tools').$type<string[]>().default([]),
  process: jsonb('process').$type<Record<string, unknown>[]>().default([]),
  outputFormat: text('output_format'),
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index('idx_agent_skills_tenant_id').on(table.tenantId),
  projectIdIdx: index('idx_agent_skills_project_id').on(table.projectId),
}));

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  templateType: text('template_type').notNull(),
  body: text('body').notNull(),
  variables: jsonb('variables').$type<Record<string, unknown>[]>().default([]),
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index('idx_templates_tenant_id').on(table.tenantId),
  projectIdIdx: index('idx_templates_project_id').on(table.projectId),
}));

export const graphLinks = pgTable('graph_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  fromType: text('from_type').notNull(),
  fromId: text('from_id').notNull(),
  relationship: text('relationship').notNull(),
  toType: text('to_type').notNull(),
  toId: text('to_id').notNull(),
  confidence: integer('confidence'),
  sourceDocumentId: uuid('source_document_id').references(() => documents.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index('idx_graph_links_tenant_id').on(table.tenantId),
  fromIdx: index('idx_graph_links_from').on(table.fromType, table.fromId),
  toIdx: index('idx_graph_links_to').on(table.toType, table.toId),
}));

export const ingestionJobs = pgTable('ingestion_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  jobType: jobTypeEnum('job_type').notNull(),
  status: jobStatusEnum('status').notNull().default('queued'),
  input: jsonb('input').$type<Record<string, unknown>>().default({}),
  output: jsonb('output').$type<Record<string, unknown>>(),
  error: text('error'),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  tenantIdIdx: index('idx_ingestion_jobs_tenant_id').on(table.tenantId),
  statusIdx: index('idx_ingestion_jobs_status').on(table.status),
  jobTypeIdx: index('idx_ingestion_jobs_job_type').on(table.jobType),
}));

export const retrievalLogs = pgTable('retrieval_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  userId: text('user_id'),
  agentId: text('agent_id'),
  query: text('query').notNull(),
  retrievedDocumentIds: jsonb('retrieved_document_ids').$type<string[]>().default([]),
  retrievedChunkIds: jsonb('retrieved_chunk_ids').$type<string[]>().default([]),
  responseSummary: text('response_summary'),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index('idx_retrieval_logs_tenant_id').on(table.tenantId),
}));

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id').notNull(),
  principalType: principalTypeEnum('principal_type').notNull(),
  principalId: text('principal_id').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  resourceIdx: index('idx_permissions_resource').on(table.resourceType, table.resourceId),
  principalIdx: index('idx_permissions_principal').on(table.principalType, table.principalId),
  tenantIdIdx: index('idx_permissions_tenant_id').on(table.tenantId),
}));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
  actorType: text('actor_type').notNull(),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index('idx_audit_logs_tenant_id').on(table.tenantId),
  actionIdx: index('idx_audit_logs_action').on(table.action),
  createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
}));
