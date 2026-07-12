"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { GraphEntitiesResponse } from "@/lib/hive-mind/types";
import {
  Brain,
  Search,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GraphEntitiesPage() {
  const {
    client,
    selectedTenantId,
    selectedTenant,
    selectedProject,
  } = useHiveMind();

  const [data, setData] = useState<GraphEntitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const fetchEntities = useCallback(async (dir?: "prev") => {
    if (!client || !selectedTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const prevCursor = dir === "prev" ? history[history.length - 2] ?? null : null;
      if (dir === "prev") {
        setHistory((h) => h.slice(0, -1));
      }
      const result = await client.listGraphEntities({
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
        search: search || undefined,
        type: typeFilter || undefined,
        limit: 20,
        cursor: prevCursor ?? cursor ?? undefined,
      });
      setData(result);
      if (dir !== "prev" && result.nextCursor) {
        setHistory((h) => [...h, cursor ?? ""]);
        setCursor(result.nextCursor);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load entities");
    } finally {
      setLoading(false);
    }
  }, [client, selectedTenantId, selectedProject, search, typeFilter, cursor, history]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntities();
  }, [fetchEntities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCursor(null);
    setHistory([]);
    fetchEntities();
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setCursor(null);
    setHistory([]);
  };

  const hasPrevPage = history.length > 0;
  const hasNextPage = !!data?.nextCursor;

  return (
    <>
      <CRMTopbar title="Graph Entities" subtitle="Browse knowledge graph entities" />
      <div className="px-6 pb-6 space-y-4">
        <div className="rounded-[20px] bg-muted/50 p-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <Brain className="size-3 inline mr-1" />
            Scope:{" "}
            <span className="font-medium text-foreground">
              {selectedTenant ? selectedTenant.name : "No organization selected"}
            </span>
            {selectedProject && (
              <span className="text-muted-foreground">{" / "}{selectedProject.name}</span>
            )}
          </p>
          <button
            onClick={() => { setCursor(null); setHistory([]); fetchEntities(); }}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
        </div>

        {/* Search & Filter */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <input
            type="text"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            placeholder="Filter by type..."
            className="w-40 h-10 px-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
          {(search || typeFilter) && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        {error && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data && data.entities.length > 0 ? (
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <div className="flex flex-col gap-1">
              {data.entities.map((entity) => (
                <Link
                  key={entity.id}
                  href={`/hive-mind/graph/entities/${entity.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{entity.name}</span>
                    <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {entity.entityType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{entity.mentionCount} mentions</span>
                    <span>{entity.documentCount} docs</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {data.entities.length} entities
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchEntities("prev")}
                  disabled={!hasPrevPage || loading}
                  className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="size-3" /> Previous
                </button>
                <button
                  onClick={() => fetchEntities()}
                  disabled={!hasNextPage || loading}
                  className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="size-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <Brain className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {selectedTenantId ? "No entities found" : "Select an organization to view entities"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
