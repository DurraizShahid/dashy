"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { ResearchRun } from "@/lib/hive-mind/types";
import {
  Loader2,
  XCircle,
  RefreshCw,
  Plus,
  BrainCircuit,
  Clock,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResearchStatusBadge } from "@/components/hive-mind/research-status-badge";
import { statusIcon, formatDuration, formatCostUsd } from "@/lib/hive-mind/status-config";

const POLL_INTERVAL = 5000;
const PAGE_SIZE = 20;

export default function ResearchListPage() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant } = useHiveMind();

  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRuns = useCallback(async (opts?: { background?: boolean }) => {
    if (!client || !selectedTenantId) return;
    if (!opts?.background) setLoading(true);
    setError(null);
    try {
      const res = await client.listResearchRuns({
        tenantId: selectedTenantId,
        projectId: selectedProjectId ?? undefined,
        status: statusFilter || undefined,
      });
      setRuns(res.runs ?? []);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load research runs");
      setRuns([]);
    } finally {
      if (!opts?.background) setLoading(false);
    }
  }, [client, selectedTenantId, selectedProjectId, statusFilter]);

  useEffect(() => {
    if (selectedTenantId) fetchRuns();
  }, [fetchRuns, selectedTenantId]);

  useEffect(() => {
    const hasActive = runs.some((r) =>
      ["queued", "planning", "searching", "crawling", "indexing", "summarizing"].includes(r.status)
    );
    if (hasActive && !loading) {
      pollRef.current = setInterval(() => fetchRuns({ background: true }), POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, loading]);

  const filteredRuns = runs.filter((run) =>
    run.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedRuns = filteredRuns.slice(0, currentPage * PAGE_SIZE);
  const hasMore = paginatedRuns.length < filteredRuns.length;

  return (
    <>
      <CRMTopbar
        title="Research Memory"
        subtitle={selectedTenant ? `Research runs in ${selectedTenant.name}` : "Automated research and brief generation"}
      />

      {/* Controls */}
      <div className="flex items-center gap-3 px-6">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by query..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 w-56 rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <button
            onClick={() => fetchRuns()}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Refresh research runs"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 text-foreground"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="queued">Queued</option>
            <option value="planning">Planning</option>
            <option value="searching">Searching</option>
            <option value="crawling">Crawling</option>
            <option value="indexing">Indexing</option>
            <option value="summarizing">Summarizing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Link
          href="/hive-mind/research/new"
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-3.5" />
          New Research
        </Link>
      </div>

      {/* Loading */}
      {loading && runs.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 px-6">
          <Loader2 className="size-4 animate-spin" />
          Loading research runs...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-[20px] bg-card p-4 shadow-card mx-6">
          <div className="flex items-start gap-2">
            <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* No tenant */}
      {!selectedTenantId && !loading && (
        <div className="rounded-[20px] bg-card p-5 shadow-card text-center mx-6">
          <BrainCircuit className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Select an organization to view research runs.
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && selectedTenantId && runs.length === 0 && (
        <div className="rounded-[20px] bg-card p-5 shadow-card text-center mx-6">
          <BrainCircuit className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No research runs yet. Start your first research project.
          </p>
          <Link
            href="/hive-mind/research/new"
            className="inline-flex items-center gap-2 mt-3 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Start Research
          </Link>
        </div>
      )}

      {/* No search results */}
      {!loading && !error && selectedTenantId && runs.length > 0 && filteredRuns.length === 0 && (
        <div className="rounded-[20px] bg-card p-5 shadow-card text-center mx-6">
          <Search className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No research runs match your search.
          </p>
        </div>
      )}

      {/* Run list */}
      {filteredRuns.length > 0 && (
        <div className="flex flex-col gap-2 px-6 pb-6" aria-live="polite" aria-atomic="true">
          {paginatedRuns.map((run) => {
            const Icon = statusIcon[run.status] ?? Clock;
            return (
              <Link
                key={run.id}
                href={`/hive-mind/research/${run.id}`}
                className="rounded-[20px] bg-card p-4 shadow-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        run.status === "completed" && "text-green-600",
                        run.status === "failed" && "text-destructive",
                        (run.status === "indexing" || run.status === "summarizing") && "text-amber-500",
                        run.status === "queued" && "text-blue-500",
                        run.status === "cancelled" && "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {run.query}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {run.sourceMode}
                        </span>
                        {run.sourceCount !== null && run.sourceCount !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            &middot; {run.sourceCount} sources
                          </span>
                        )}
                        {run.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            &middot; {new Date(run.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        {run.createdAt && !run.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            &middot; {new Date(run.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {run.latencyMs != null && (
                          <span className="text-xs text-muted-foreground">
                            &middot; {formatDuration(run.latencyMs)}
                          </span>
                        )}
                        {run.estimatedCostUsd != null && (
                          <span className="text-xs text-muted-foreground">
                            &middot; {formatCostUsd(run.estimatedCostUsd)}
                          </span>
                        )}
                        {run.error && (
                          <span className="text-xs text-destructive truncate max-w-[200px]">
                            {run.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {run.stage && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {run.stage}
                      </span>
                    )}
                    <ResearchStatusBadge status={run.status} />
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}
          {hasMore && (
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Load More ({filteredRuns.length - paginatedRuns.length} remaining)
            </button>
          )}
        </div>
      )}
    </>
  );
}
