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
} from "lucide-react";
import { cn } from "@/lib/utils";

function AgentQueryForm() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant } = useHiveMind();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AgentContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
