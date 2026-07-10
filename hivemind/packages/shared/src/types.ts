export type DocumentType = 'pdf' | 'docx' | 'html' | 'md' | 'txt' | 'image' | 'audio' | 'video' | 'code' | 'email' | 'other';
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error' | 'archived';
export type SourceType = 'web' | 'file' | 'api' | 'email' | 'rss' | 'manual';
export type VisibilityScope = 'private' | 'team' | 'tenant' | 'public';
export type SensitivityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
export type JobType = 'ingest.url' | 'ingest.file' | 'parse.document' | 'index.vector' | 'index.graph' | 'summarize.document';
export type JobStatus = 'queued' | 'active' | 'completed' | 'failed' | 'retrying';
export type PrincipalType = 'user' | 'group' | 'service';
export type AssetType = 'insight' | 'pattern' | 'decision' | 'summary';
export type TenantStatus = 'active' | 'suspended' | 'archived';
export type ProjectStatus = 'active' | 'archived';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
