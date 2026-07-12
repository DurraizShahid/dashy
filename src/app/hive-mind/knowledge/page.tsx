"use client";

import { useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import { Search, BookOpen, Loader2, ExternalLink, Brain, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeSearchResult, KnowledgeSearchCitation } from "@/lib/hive-mind/types";

function KnowledgeSearch() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant } = useHiveMind();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [citations, setCitations] = useState<KnowledgeSearchCitation[]>([]);
  const [totalLatencyMs, setTotalLatencyMs] = useState(0);
  const [embeddingLatencyMs, setEmbeddingLatencyMs] = useState(0);
  const [searchLatencyMs, setSearchLatencyMs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await client!.searchKnowledge(q, {
        tenantId: selectedTenantId ?? undefined,
        projectId: selectedProjectId ?? undefined,
      });
      setResults(response.results);
      setTotal(response.total);
      setWarnings(response.warnings);
      setCitations(response.citations);
      setTotalLatencyMs(response.totalLatencyMs);
      setEmbeddingLatencyMs(response.embeddingLatencyMs);
      setSearchLatencyMs(response.searchLatencyMs);
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        setError(`API error ${err.status}: ${err.statusText}`);
      } else if (err instanceof HiveMindNetworkError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Search failed");
      }
      setResults([]);
      setTotal(0);
      setWarnings([]);
      setCitations([]);
      setTotalLatencyMs(0);
      setEmbeddingLatencyMs(0);
      setSearchLatencyMs(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Scope indicator */}
      <div className="rounded-[20px] bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          <Brain className="size-3 inline mr-1" />
          Searching scope:{" "}
          <span className="font-medium text-foreground">
            {selectedTenant ? selectedTenant.name : "No organization selected"}
          </span>
          {selectedProjectId && selectedTenant && (
            <span className="text-muted-foreground">
              {" / "}Project ({selectedProjectId.slice(0, 8)})
            </span>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedTenantId
                ? "Search the knowledge base..."
                : "Select an organization to search"
            }
            disabled={!selectedTenantId}
            className={cn(
              "h-10 w-full rounded-xl border border-input bg-transparent pl-10 pr-4 text-sm transition-colors outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              !selectedTenantId && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="size-4 animate-spin" />
          <span>Searching knowledge base...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-[20px] bg-destructive/10 p-4 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state (no results) */}
      {!loading && !error && searched && results.length === 0 && (
        <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
          <BookOpen className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">
            No results found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            No indexed content matched &ldquo;{query}&rdquo;
          </p>
          {warnings.length > 0 && (
            <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-left space-y-1">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>

          {warnings.length > 0 && (
            <div className="mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 space-y-1">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {results.map((result) => (
              <div
                key={result.id}
                className="rounded-xl bg-card p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {result.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
                      {result.snippet}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <FileText className="size-3 text-muted-foreground/60" />
                      <span className="text-[11px] text-muted-foreground truncate">
                        {result.documentId.slice(0, 8)}
                      </span>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        result.score >= 0.8
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : result.score >= 0.6
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {Math.round(result.score * 100)}% match
                      </span>
                    </div>
                  </div>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      title="Open source"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Latency and citations footer */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/60">
            <span>{totalLatencyMs}ms total</span>
            <span>{embeddingLatencyMs}ms embedding</span>
            <span>{searchLatencyMs}ms search</span>
            <span>{citations.length} citation{citations.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Citations detail */}
          {citations.length > 0 && (
            <details className="mt-2">
              <summary className="text-[11px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors">
                View citation details ({citations.length})
              </summary>
              <div className="mt-2 space-y-1">
                {citations.map((citation, i) => (
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
        </div>
      )}

      {/* Initial empty state */}
      {!loading && !error && !searched && (
        <div className="rounded-[20px] bg-card p-8 shadow-card text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Search Knowledge Base
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Enter a query to search across all indexed documents in your organization.
            Results include relevance scores, source attribution, and citations.
          </p>
        </div>
      )}
    </div>
  );
}

export default function HiveMindKnowledgePage() {
  return (
    <>
      <CRMTopbar
        title="Knowledge Base"
        subtitle="Search and explore indexed knowledge across the Hive Mind"
      />

      <div className="px-6 pb-6 max-w-3xl">
        <KnowledgeSearch />
      </div>
    </>
  );
}
