"use client";

import { useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { AgentContextResponse, KnowledgeSearchCitation } from "@/lib/hive-mind/types";
import {
  Bot,
  Loader2,
  Send,
  XCircle,
  Brain,
  FileText,
  GitBranch,
  AlertCircle,
  Network,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Toggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors outline-none",
          enabled ? "bg-primary" : "bg-input"
        )}
      >
        <span className={cn(
          "pointer-events-none inline-block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform",
          enabled ? "translate-x-4" : "translate-x-0"
        )} />
      </button>
      <span className="text-xs text-muted-foreground">{label}</span>
    </label>
  );
}

function AgentQueryForm() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant } = useHiveMind();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AgentContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeGraph, setIncludeGraph] = useState(false);
  const [showGraphDetails, setShowGraphDetails] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || !selectedTenantId) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await client!.queryAgentContext({
        query: q,
        tenantId: selectedTenantId,
        ...(selectedProjectId ? { projectId: selectedProjectId } : {}),
        includeGraph: includeGraph || undefined,
        graphDepth: 1,
        maxGraphEntities: 50,
        maxGraphRelationships: 50,
      });
      setResponse(result);
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        setError(`API error ${err.status}: ${err.statusText}`);
      } else if (err instanceof HiveMindNetworkError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Agent query failed");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!selectedTenantId) {
    return (
      <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
        <Brain className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Select an organization to query agents.
        </p>
      </div>
    );
  }

  const hasGraphData = response?.graphEntities && response.graphEntities.length > 0;

  return (
    <div className="space-y-4">
      {/* Scope indicator */}
      <div className="rounded-[20px] bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          <Brain className="size-3 inline mr-1" />
          Agent scope:{" "}
          <span className="font-medium text-foreground">{selectedTenant?.name}</span>
          {selectedProjectId && (
            <span className="text-muted-foreground"> / Project</span>
          )}
        </p>
      </div>

      {/* Query form */}
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <h3 className="font-poppins font-semibold text-foreground mb-1">
          Query Agent
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Ask a question or request context from a Hive Mind agent.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="agent-query" className="text-xs font-medium text-foreground mb-1 block">
              Mission / Query
            </label>
            <textarea
              id="agent-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What information do you need?"
              rows={3}
              required
              className={cn(
                "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none resize-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <Toggle
              label="Include graph memory"
              enabled={includeGraph}
              onChange={setIncludeGraph}
            />
            <div className="flex items-center gap-2">
              {includeGraph && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Network className="size-3" />
                  Enriches results with entities & relationships
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Querying agent...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send Query
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[20px] bg-destructive/10 p-4 border border-destructive/20">
          <div className="flex items-start gap-2">
            <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Retrieving agent context...</span>
        </div>
      )}

      {/* Graph unavailable warning */}
      {response && includeGraph && !hasGraphData && response.graphLatencyMs !== undefined && (
        <div className="rounded-[20px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Graph memory unavailable</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Vector search results are shown; graph enrichment was skipped (Neo4j may be unreachable or not configured).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No context found */}
      {!loading && response && response.relevantChunks.length === 0 && (
        <div className="rounded-[20px] bg-card p-6 shadow-card text-center space-y-2">
          <Brain className="size-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            No context found
          </p>
          <p className="text-xs text-muted-foreground">
            {response.retrievalSummary}
          </p>
          {response.warnings.length > 0 && (
            <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-left space-y-1">
              {response.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/60 justify-center">
            <span>{response.totalLatencyMs}ms total</span>
          </div>
        </div>
      )}

      {/* Response with results */}
      {response && response.relevantChunks.length > 0 && (
        <div className="rounded-[20px] bg-card p-6 shadow-card space-y-4">
          {/* Header: Mission and summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-primary" />
              <h3 className="font-poppins font-semibold text-foreground text-sm">
                Retrieval Context
              </h3>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
                {response.relevantChunks.length} chunk{response.relevantChunks.length !== 1 ? "s" : ""}
              </span>
              {hasGraphData && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  <Network className="size-2.5 mr-1" />
                  {response.graphEntities!.length} entit{response.graphEntities!.length !== 1 ? "ies" : "y"}
                </span>
              )}
            </div>
            <div className="rounded-xl bg-muted/50 p-3 space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Mission
              </p>
              <p className="text-sm text-foreground">{response.mission}</p>
            </div>
            <p className="text-sm text-muted-foreground bg-primary/5 rounded-xl px-3 py-2">
              {response.retrievalSummary}
            </p>
          </div>

          {/* Warnings */}
          {response.warnings.length > 0 && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 space-y-1">
              {response.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}

          {/* Graph Context Section */}
          {hasGraphData && (
            <div className="rounded-xl border border-violet-200 dark:border-violet-800 overflow-hidden">
              <button
                onClick={() => setShowGraphDetails(!showGraphDetails)}
                className="w-full flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Network className="size-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-xs font-medium text-violet-800 dark:text-violet-300">
                    Graph Context
                  </span>
                  <span className="text-[11px] text-violet-600 dark:text-violet-400">
                    ({response.graphEntities!.length} entities, {response.graphRelationships?.length ?? 0} relationships, {response.relatedDocuments?.length ?? 0} related docs)
                  </span>
                </div>
                {showGraphDetails ? <EyeOff className="size-3 text-violet-500" /> : <Eye className="size-3 text-violet-500" />}
              </button>

              {showGraphDetails && (
                <div className="p-3 space-y-3">
                  {/* Graph Entities */}
                  {response.graphEntities && response.graphEntities.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Brain className="size-3" /> Entities
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {response.graphEntities.map((entity) => (
                          <span
                            key={entity.id}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground"
                          >
                            {entity.name}
                            <span className="text-[10px] text-muted-foreground">({entity.entityType})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Graph Relationships */}
                  {response.graphRelationships && response.graphRelationships.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <GitBranch className="size-3" /> Relationships
                      </p>
                      <div className="flex flex-col gap-1">
                        {response.graphRelationships.map((rel, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="text-foreground font-medium">{rel.sourceEntityName}</span>
                            <span>—[{rel.relationshipType}]→</span>
                            <span className="text-foreground font-medium">{rel.targetEntityName}</span>
                            {rel.confidence !== undefined && (
                              <span className="text-[10px] text-muted-foreground">({Math.round(rel.confidence * 100)}%)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Documents */}
                  {response.relatedDocuments && response.relatedDocuments.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <FileText className="size-3" /> Related Documents
                      </p>
                      <div className="flex flex-col gap-1">
                        {response.relatedDocuments.map((doc) => (
                          <div key={doc.documentId} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="size-3 shrink-0" />
                            <span className="truncate">{doc.title}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">({doc.relevance})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Relevant Chunks */}
          {response.relevantChunks.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="size-3" />
                Relevant Chunks
              </p>
              {response.relevantChunks.map((chunk) => (
                <div key={chunk.chunkId} className="rounded-xl border border-input p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate">
                      {chunk.documentTitle}
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium shrink-0 ml-2",
                      chunk.score >= 0.8
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : chunk.score >= 0.6
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {Math.round(chunk.score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {chunk.snippet}
                  </p>
                  {chunk.citation && (
                    <div className="text-[11px] text-muted-foreground/60 border-t border-input/50 pt-1.5 mt-1.5">
                      <span className="font-medium">Source:</span>{" "}
                      {chunk.citation.documentTitle}
                      {chunk.citation.sourceUrl && (
                        <a
                          href={chunk.citation.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 underline hover:text-foreground"
                        >
                          open
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Source Documents */}
          {response.relevantDocuments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Source Documents ({response.relevantDocuments.length})
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {response.relevantDocuments.map((doc) => (
                  <li key={doc.documentId} className="flex items-center gap-1">
                    <FileText className="size-3 shrink-0 text-muted-foreground/50" />
                    <span className="truncate">{doc.title}</span>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0">
                      ({Math.round(doc.topScore * 100)}%)
                    </span>
                    {doc.sourceUrl && (
                      <a
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        <span className="underline text-[11px]">open</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Citations */}
          {response.citations.length > 0 && (
            <details>
              <summary className="text-[11px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors">
                View all citations ({response.citations.length})
              </summary>
              <div className="mt-2 space-y-1">
                {response.citations.map((citation: KnowledgeSearchCitation, i: number) => (
                  <p key={i} className="text-[11px] text-muted-foreground/60 truncate">
                    [{i + 1}] {citation.documentTitle}
                    {citation.sourceUrl && (
                      <a
                        href={citation.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 underline hover:text-foreground"
                      >
                        source
                      </a>
                    )}
                  </p>
                ))}
              </div>
            </details>
          )}

          {/* Latency footer */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/60 pt-1">
            <span>{response.totalLatencyMs}ms total</span>
            <span>{response.embeddingLatencyMs}ms embedding</span>
            <span>{response.searchLatencyMs}ms search</span>
            {response.graphLatencyMs !== undefined && (
              <span>{response.graphLatencyMs}ms graph</span>
            )}
            <span>{response.citations.length} citation{response.citations.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HiveMindAgentsPage() {
  return (
    <>
      <CRMTopbar
        title="Agent Context"
        subtitle="Query Hive Mind agents for contextual information"
      />

      <div className="px-6 pb-6 max-w-2xl">
        <AgentQueryForm />
      </div>
    </>
  );
}
