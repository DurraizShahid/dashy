"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { HiveMindJob } from "@/lib/hive-mind/types";
import {
  Loader2,
  XCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  running: Play,
  completed: CheckCircle2,
  failed: AlertCircle,
  cancelled: X,
};

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  running: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function HiveMindJobsPage() {
  const {
    client,
    selectedTenantId,
    selectedProjectId,
    selectedTenant,
  } = useHiveMind();

  const [jobs, setJobs] = useState<HiveMindJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [manualId, setManualId] = useState("");

  const fetchJobs = useCallback(
    async (cursor?: string) => {
      if (!client || !selectedTenantId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await client.listJobs({
          tenantId: selectedTenantId,
          projectId: selectedProjectId ?? undefined,
          status: statusFilter || undefined,
          cursor,
        });
        if (cursor) {
          setJobs((prev) => [...prev, ...res.jobs]);
        } else {
          setJobs(res.jobs);
        }
        setNextCursor(res.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
        if (!cursor) setJobs([]);
      } finally {
        setLoading(false);
      }
    },
    [client, selectedTenantId, selectedProjectId, statusFilter]
  );

  useEffect(() => {
    if (selectedTenantId) {
      setJobs([]);
      setNextCursor(undefined);
      fetchJobs();
    }
  }, [selectedTenantId, selectedProjectId, statusFilter]);

  return (
    <>
      <CRMTopbar
        title="Jobs"
        subtitle={selectedTenant ? `Jobs in ${selectedTenant.name}` : "Monitor ingestion and processing jobs"}
      />

      <div className="px-6 pb-6 max-w-4xl space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <button
              onClick={() => fetchJobs()}
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
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Manual lookup (debug/advanced) */}
          <div className="flex items-center gap-2 ml-auto">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Job ID lookup..."
              className="h-8 w-40 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
            {manualId.trim() && (
              <Link
                href={`/hive-mind/jobs/${encodeURIComponent(manualId.trim())}`}
                className="inline-flex items-center h-7 px-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go
              </Link>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && jobs.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading jobs...
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
            <Clock className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an organization to view jobs.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && selectedTenantId && jobs.length === 0 && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <CheckCircle2 className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No jobs found.
            </p>
          </div>
        )}

        {/* Job list */}
        {jobs.length > 0 && (
          <div className="flex flex-col gap-2">
            {jobs.map((job) => {
              const Icon = statusIcon[job.status] ?? Clock;
              return (
                <Link
                  key={job.id}
                  href={`/hive-mind/jobs/${job.id}`}
                  className="rounded-xl bg-card p-4 shadow-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Icon
                        className={cn(
                          "size-5 shrink-0",
                          job.status === "completed" && "text-green-600",
                          job.status === "failed" && "text-destructive",
                          job.status === "running" && "text-amber-500",
                          job.status === "pending" && "text-blue-500",
                          job.status === "cancelled" && "text-muted-foreground"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {job.jobType}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">
                            Stage: {job.stage}
                          </span>
                          {job.documentId && (
                            <span className="text-[11px] text-muted-foreground">
                              &middot; Doc: {job.documentId.slice(0, 8)}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            &middot; {new Date(job.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          statusStyles[job.status]
                        )}
                      >
                        {job.status}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </div>

                  {job.status === "running" && job.progress > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {job.progress}%
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {nextCursor && (
          <div className="text-center">
            <button
              onClick={() => fetchJobs(nextCursor)}
              disabled={loading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium border border-input text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
