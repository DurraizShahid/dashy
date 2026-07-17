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
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  ArrowRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  indexing: Play,
  summarizing: Play,
  completed: CheckCircle2,
  failed: AlertCircle,
  cancelled: X,
};

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  indexing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  summarizing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const POLL_INTERVAL = 5000;

export default function ResearchListPage() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant } = useHiveMind();

  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load research runs");
      setRuns([]);
    } finally {
      if (!opts?.background) setLoading(false);
    }
  }, [client, selectedTenantId, selectedProjectId, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedTenantId) fetchRuns();
  }, [fetchRuns, selectedTenantId]);

  useEffect(() => {
    const hasActive = runs.some((r) =>
      ["pending", "indexing", "summarizing"].includes(r.status)
    );
    if (hasActive && !loading) {
      pollRef.current = setInterval(() => fetchRuns({ background: true }), POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, loading]);

  return (
    <>
      <CRMTopbar
        title="Research Memory"
        subtitle={selectedTenant ? `Research runs in ${selectedTenant.name}` : "Automated research and brief generation"}
      />

      <div className="px-6 pb-6 max-w-4xl space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <button
              onClick={() => fetchRuns()}
              disabled={loading}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("size-3", loading && "animate-spin")} />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 text-foreground"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading research runs...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-[20px] bg-card p-4 shadow-card">
            <div className="flex items-start gap-2">
              <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* No tenant */}
        {!selectedTenantId && !loading && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <BrainCircuit className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an organization to view research runs.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && selectedTenantId && runs.length === 0 && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
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

        {/* Run list */}
        {runs.length > 0 && (
          <div className="flex flex-col gap-2">
            {runs.map((run) => {
              const Icon = statusIcon[run.status] ?? Clock;
              return (
                <Link
                  key={run.id}
                  href={`/hive-mind/research/${run.id}`}
                  className="rounded-xl bg-card p-4 shadow-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Icon
                        className={cn(
                          "size-5 shrink-0",
                          run.status === "completed" && "text-green-600",
                          run.status === "failed" && "text-destructive",
                          (run.status === "indexing" || run.status === "summarizing") && "text-amber-500",
                          run.status === "pending" && "text-blue-500",
                          run.status === "cancelled" && "text-muted-foreground"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {run.query}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-muted-foreground">
                            {run.sourceMode}
                          </span>
                          {run.sourceCount !== null && run.sourceCount !== undefined && (
                            <span className="text-[11px] text-muted-foreground">
                              &middot; {run.sourceCount} sources
                            </span>
                          )}
                          {run.completedAt && (
                            <span className="text-[11px] text-muted-foreground">
                              &middot; {new Date(run.completedAt).toLocaleDateString()}
                            </span>
                          )}
                          {run.createdAt && !run.completedAt && (
                            <span className="text-[11px] text-muted-foreground">
                              &middot; {new Date(run.createdAt).toLocaleDateString()}
                            </span>
                          )}
                          {run.error && (
                            <span className="text-[11px] text-destructive truncate max-w-[200px]">
                              {run.error}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {run.stage && (
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {run.stage}
                        </span>
                      )}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          statusStyles[run.status]
                        )}
                      >
                        {run.status}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
