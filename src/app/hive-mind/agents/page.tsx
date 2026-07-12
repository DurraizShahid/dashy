"use client";

import { useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { AgentContextResponse } from "@/lib/hive-mind/types";
import {
  Bot,
  Loader2,
  Send,
  XCircle,
  Brain,
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
              Query
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
                Querying...
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
        <div className="rounded-[20px] bg-card p-4 shadow-card">
          <div className="flex items-start gap-2">
            <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="rounded-[20px] bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <h3 className="font-poppins font-semibold text-foreground text-sm">
              Retrieval Context
            </h3>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
              {response.relevantChunks.length} chunk{response.relevantChunks.length !== 1 ? "s" : ""}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {response.retrievalSummary}
          </p>

          {response.warnings.length > 0 && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3">
              {response.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}

          {response.relevantChunks.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                Relevant Chunks
              </p>
              {response.relevantChunks.map((chunk) => (
                <div key={chunk.chunkId} className="rounded-xl border border-input p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate">
                      {chunk.documentTitle}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                      {Math.round(chunk.score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {chunk.snippet}
                  </p>
                  {chunk.citation && (
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      {chunk.citation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {response.relevantDocuments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Source Documents
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {response.relevantDocuments.map((doc) => (
                  <li key={doc.documentId} className="truncate">
                    {doc.title}
                    {doc.sourceUrl && (
                      <span className="text-muted-foreground/50 ml-1">
                        ({doc.sourceUrl})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 text-[11px] text-muted-foreground/60">
            <span>{response.totalLatencyMs}ms</span>
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
