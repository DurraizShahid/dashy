"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { AuthGate } from "@/components/auth/auth-gate";
import { createClient } from "@/lib/hive-mind/client";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/hive-mind/types";

const JOB_IDS = [
  "recent-job-1",
  "recent-job-2",
  "recent-job-3",
] as const;

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  running: Play,
  completed: CheckCircle2,
  failed: AlertCircle,
  cancelled: X,
};

const statusStyles: Record<
  string,
  string
> = {
  pending:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  running:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

type JobWithFetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; job: JobStatus };

function JobCard({
  jobId,
  state,
  onRetry,
}: {
  jobId: string;
  state: JobWithFetchState;
  onRetry: (id: string) => void;
}) {
  if (state.status === "loading") {
    return (
      <div className="rounded-xl bg-card p-4 shadow-card flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Loading job...</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl bg-card p-4 shadow-card">
        <div className="flex items-start gap-2">
          <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{state.message}</p>
            <button
              onClick={() => onRetry(jobId)}
              className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary hover:underline"
            >
              <RefreshCw className="size-3" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { job } = state;
  const Icon = statusIcon[job.status] ?? Clock;

  return (
    <Link href={`/hive-mind/jobs/${job.id}`}>
      <div className="rounded-xl bg-card p-4 shadow-card hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
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
                {job.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(job.createdAt).toLocaleString()}
              </p>
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

        {/* Progress bar for running jobs */}
        {job.status === "running" && (
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
      </div>
    </Link>
  );
}

function JobList() {
  const [jobStates, setJobStates] = useState<Record<string, JobWithFetchState>>(
    {}
  );

  function fetchJob(jobId: string) {
    setJobStates((prev) => ({ ...prev, [jobId]: { status: "loading" } }));
    const client = createClient();
    client
      .getJobStatus(jobId)
      .then((job) => {
        setJobStates((prev) => ({
          ...prev,
          [jobId]: { status: "loaded", job },
        }));
      })
      .catch((err) => {
        let message: string;
        if (err instanceof HiveMindApiError) {
          message = `API error ${err.status}: ${err.statusText}`;
        } else if (err instanceof HiveMindNetworkError) {
          message = err.message;
        } else {
          message = err instanceof Error ? err.message : "Unknown error";
        }
        setJobStates((prev) => ({
          ...prev,
          [jobId]: { status: "error", message },
        }));
      });
  }

  useEffect(() => {
    JOB_IDS.forEach((id) => fetchJob(id));
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-poppins font-semibold text-foreground">
          Recent Jobs
        </h3>
        <button
          onClick={() => JOB_IDS.forEach((id) => fetchJob(id))}
          className="flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Refresh all"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {JOB_IDS.map((id) => (
        <JobCard
          key={id}
          jobId={id}
          state={jobStates[id] ?? { status: "loading" }}
          onRetry={fetchJob}
        />
      ))}
    </div>
  );
}

export default function HiveMindJobsPage() {
  return (
    <>
      <CRMTopbar
        title="Jobs"
        subtitle="Monitor ingestion and processing jobs"
      />

      <div className="px-6 pb-6 max-w-2xl">
        <AuthGate
          title="Job Monitoring"
          description="Track the status of content ingestion, processing, and analysis jobs."
        >
          <JobList />
        </AuthGate>
      </div>
    </>
  );
}
