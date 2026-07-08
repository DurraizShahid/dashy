"use client";

import { useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import { Search, BookOpen, Loader2, ExternalLink, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeSearchResult } from "@/lib/hive-mind/types";

function KnowledgeSearch() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant } = useHiveMind();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [total, setTotal] = useState(0);
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
      const response = await client!.searchKnowledge(q);
      setResults(response.results);
      setTotal(response.total);
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
              {" / "}{selectedProjectId.slice(0, 8)}
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

      {/* Results */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="size-4 animate-spin" />
          <span>Searching...</span>
        </div>
      )}

      {error && (
        <div className="rounded-[20px] bg-card p-4 shadow-card">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && searched && results.length === 0 && (
        <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
          <BookOpen className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No results found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
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
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {result.source}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Relevance: {Math.round(result.relevance * 100)}%
                      </span>
                    </div>
                  </div>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && !searched && (
        <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
          <BookOpen className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Enter a query to search the Hive Mind knowledge base.
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
