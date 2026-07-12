"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { AuthGate } from "@/components/auth/auth-gate";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import {
  Loader2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/hive-mind/types";

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

export default function HiveMindJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { client } = useHiveMind();
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    client
      .getJobStatus(id)
      .then((data) => { if (!cancelled) setJob(data); })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof HiveMindApiError) {
            setError(`API error ${err.status}: ${err.statusText}`);
          } else if (err instanceof HiveMindNetworkError) {
            setError(err.message);
          } else {
            setError(err instanceof Error ? err.message : "Unknown error");
          }
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [client, id, refreshKey]);

  function handleRefresh() {
    setLoading(true);
    setError(null);
    setJob(null);
    setRefreshKey((k) => k + 1);
  }

  const Icon = job ? (statusIcon[job.status] ?? Clock) : Clock;

  return (
    <>
      <CRMTopbar
        title={id ? `Job ${id.slice(0, 8)}` : "Job Detail"}
        subtitle="View job status and results"
      />

      <div className="px-6 pb-6 max-w-2xl">
        <AuthGate
          title="Job Details"
          description="View detailed status, progress, and results for individual jobs."
        >
          {/* Back link */}
          <Link
            href="/hive-mind/jobs"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Jobs
          </Link>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <Loader2 className="size-4 animate-spin" />
              <span>Loading job details...</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-[20px] bg-card p-6 shadow-card">
              <div className="flex items-start gap-3">
                <XCircle className="size-5 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {job && !loading && (
            <div className="rounded-[20px] bg-card p-6 shadow-card space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "size-6",
                      job.status === "completed" && "text-green-600",
                      job.status === "failed" && "text-destructive",
                      job.status === "running" && "text-amber-500",
                      job.status === "pending" && "text-blue-500",
                      job.status === "cancelled" && "text-muted-foreground"
                    )}
                  />
                  <div>
                    <h2 className="font-poppins font-semibold text-foreground">
                      {job.jobType}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      ID: <code className="text-xs">{job.id}</code>
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                    statusStyles[job.status]
                  )}
                >
                  {job.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">
                    {job.createdAt ? new Date(job.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm text-foreground">
                    {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              {/* Error */}
              {job.error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3">
                  <p className="text-xs font-medium text-destructive mb-1">
                    Error
                  </p>
                  <p className="text-sm text-muted-foreground">{job.error}</p>
                </div>
              )}

              {/* Output */}
              {job.output !== undefined && job.output !== null && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">
                    Output
                  </p>
                  <pre className="text-xs bg-muted rounded-xl p-3 overflow-x-auto text-muted-foreground">
                    {JSON.stringify(job.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </AuthGate>
      </div>
    </>
  );
}
