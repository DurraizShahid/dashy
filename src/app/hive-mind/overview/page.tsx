"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { HealthCheckResponse, HiveMindDocument, HiveMindJob } from "@/lib/hive-mind/types";
import {
  Building2,
  FolderOpen,
  FileText,
  Activity,
  HeartPulse,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HiveMindOverviewPage() {
  const {
    client,
    tenants,
    projects,
    selectedTenantId,
    selectedTenant,
  } = useHiveMind();

  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [recentDocs, setRecentDocs] = useState<HiveMindDocument[]>([]);
  const [recentJobs, setRecentJobs] = useState<HiveMindJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    try {
      const [h, docs, jobs] = await Promise.all([
        client.getHealth().catch(() => null),
        selectedTenantId
          ? client.listDocuments({ tenantId: selectedTenantId, limit: 5 }).catch(() => null)
          : Promise.resolve(null),
        selectedTenantId
          ? client.listJobs({ tenantId: selectedTenantId, limit: 5 }).catch(() => null)
          : Promise.resolve(null),
      ]);
      if (h) setHealth(h);
      if (docs) setRecentDocs(docs.documents);
      if (jobs) setRecentJobs(jobs.jobs);
    } finally {
      setLoading(false);
    }
  }, [client, selectedTenantId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <>
      <CRMTopbar title="Hive Mind Overview" subtitle="System overview and quick actions" />

      <div className="px-6 pb-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Building2 className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold text-foreground">{tenants.length}</p>
                <p className="text-xs text-muted-foreground">Organizations</p>
              </div>
            </div>
          </div>
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <FolderOpen className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold text-foreground">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
          </div>
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {loading ? "..." : recentDocs.length}
                </p>
                <p className="text-xs text-muted-foreground">Recent Documents</p>
              </div>
            </div>
          </div>
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Activity className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {loading ? "..." : recentJobs.length}
                </p>
                <p className="text-xs text-muted-foreground">Recent Jobs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Health Status */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2">
                <HeartPulse className="size-4" />
                System Health
              </h3>
              <Link
                href="/hive-mind/health"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Details <ArrowRight className="size-3" />
              </Link>
            </div>
            {loading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : health ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {health.status === "healthy" ? (
                    <CheckCircle className="size-4 text-green-600" />
                  ) : health.status === "degraded" ? (
                    <AlertTriangle className="size-4 text-amber-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                  <span className="text-sm capitalize text-foreground">{health.status}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {health.services?.length ?? 0} services
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Unavailable</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
              <Activity className="size-4" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/hive-mind/ingest"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Ingest URL
              </Link>
              <Link
                href="/hive-mind/knowledge"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Search Knowledge
              </Link>
              <Link
                href="/hive-mind/documents"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Browse Documents
              </Link>
              <Link
                href="/hive-mind/jobs"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                View Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2">
              <FileText className="size-4" />
              Recent Documents
            </h3>
            <Link
              href="/hive-mind/documents"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {loading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : recentDocs.length > 0 ? (
            <div className="flex flex-col gap-1">
              {recentDocs.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  href={`/hive-mind/documents/${doc.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-foreground truncate">{doc.title}</span>
                  <span className={cn(
                    "text-[11px] rounded-full px-2 py-0.5 font-medium capitalize",
                    doc.status === "indexed" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    doc.status === "failed" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    doc.status === "processing" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                    doc.status === "pending" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                  )}>
                    {doc.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {selectedTenantId ? "No documents yet" : "Select an organization to view documents"}
            </p>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2">
              <Activity className="size-4" />
              Recent Jobs
            </h3>
            <Link
              href="/hive-mind/jobs"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {loading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : recentJobs.length > 0 ? (
            <div className="flex flex-col gap-1">
              {recentJobs.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={`/hive-mind/jobs/${job.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-foreground truncate">{job.jobType}</span>
                  <span className={cn(
                    "text-[11px] rounded-full px-2 py-0.5 font-medium capitalize",
                    job.status === "completed" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    job.status === "failed" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    job.status === "running" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                    job.status === "pending" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                  )}>
                    {job.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {selectedTenantId ? "No jobs yet" : "Select an organization to view jobs"}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
