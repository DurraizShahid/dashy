"use client";

import { useState } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { AuthGate } from "@/components/auth/auth-gate";
import { useHiveMindClient } from "@/lib/hive-mind/provider";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import {
  Loader2,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  ListTodo,
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

function JobLookup() {
  const { client } = useHiveMindClient();
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const id = jobId.trim();
    if (!id || !client) return;

    setLoading(true);
    setError(null);
    setJob(null);

    try {
      const result = await client.getJobStatus(id);
      setJob(result);
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        setError(`API error ${err.status}: ${err.statusText}`);
      } else if (err instanceof HiveMindNetworkError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Lookup failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const Icon = job ? (statusIcon[job.status] ?? Clock) : Clock;

  return (
    <div className="space-y-4">
      {/* Missing endpoint notice */}
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <div className="flex items-start gap-3">
          <ListTodo className="size-5 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-poppins font-semibold text-foreground text-sm">
              Job List Endpoint Needed
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              The Hive Mind backend does not yet provide a{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                GET /api/v1/jobs
              </code>{" "}
              endpoint to list all jobs. You can look up individual jobs by ID
              below.
            </p>
          </div>
        </div>
      </div>

      {/* Lookup form */}
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <h3 className="font-poppins font-semibold text-foreground mb-3">
          Look Up Job
        </h3>
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Enter job ID..."
            className={cn(
              "flex-1 h-10 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          />
          <button
            type="submit"
            disabled={loading || !jobId.trim()}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-colors shrink-0",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Look Up
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[20px] bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Job result */}
      {job && (
        <div>
          <Link href={`/hive-mind/jobs/${job.id}`}>
            <div className="rounded-[20px] bg-card p-6 shadow-card hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
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
                    <p className="text-sm font-medium text-foreground">
                      {job.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: <code className="text-xs">{job.id}</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      statusStyles[job.status]
                    )}
                  >
                    {job.status}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Progress */}
              {job.status === "running" && (
                <div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.progress}%
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">
                    {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm text-foreground">
                    {new Date(job.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {job.error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3 mt-3">
                  <p className="text-xs text-muted-foreground">{job.error}</p>
                </div>
              )}
            </div>
          </Link>
        </div>
      )}
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
          <JobLookup />
        </AuthGate>
      </div>
    </>
  );
}
