"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { ResearchSchedule, ResearchAlert, ResearchRun } from "@/lib/hive-mind/types";
import {
  Loader2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  CalendarClock,
  ToggleLeft,
  ToggleRight,
  Bell,
  Trash2,
  Globe,
  Zap,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 30000;

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  indexing: Play,
  summarizing: Play,
  completed: CheckCircle2,
  failed: AlertCircle,
  cancelled: XCircle,
};

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  indexing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  summarizing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const recurrenceLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  disabled: "Disabled",
};

function formatNextRun(nextRunAt: string | undefined): string {
  if (!nextRunAt) return "Not scheduled";
  const now = Date.now();
  const target = new Date(nextRunAt).getTime();
  const diff = target - now;
  if (diff <= 0) return "Running now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `in ${days}d ${hrs % 24}h`;
}

export default function ResearchScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { client } = useHiveMind();
  const router = useRouter();

  const [schedule, setSchedule] = useState<ResearchSchedule | null>(null);
  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [alerts, setAlerts] = useState<ResearchAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [editingQuery, setEditingQuery] = useState(false);
  const [editQuery, setEditQuery] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      const data = await client.getResearchSchedule(id);
      setSchedule(data);
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        setError(`API error ${err.status}: ${err.statusText}`);
      } else if (err instanceof HiveMindNetworkError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  const fetchRuns = useCallback(async () => {
    if (!client) return;
    try {
      const data = await client.listResearchScheduleRuns(id, { limit: 20 });
      setRuns(data.runs ?? []);
    } catch {
      // best-effort
    }
  }, [client, id]);

  const fetchAlerts = useCallback(async () => {
    if (!client || !schedule) return;
    try {
      const data = await client.listResearchAlerts({
        scheduleId: id,
        tenantId: schedule.tenantId,
      });
      setAlerts(data.alerts ?? []);
    } catch {
      // best-effort
    }
  }, [client, id, schedule]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSchedule();
    fetchRuns();
  }, [fetchSchedule, fetchRuns]);

  useEffect(() => {
    if (schedule) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAlerts();
    }
  }, [schedule, fetchAlerts]);

  useEffect(() => {
    if (schedule?.enabled) {
      pollRef.current = setInterval(() => {
        fetchRuns();
        fetchAlerts();
      }, POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule?.enabled]);

  async function handleToggle() {
    if (!client || !schedule) return;
    setActionLoading("toggle");
    try {
      const updated = await client.updateResearchSchedule(schedule.id, {
        tenantId: schedule.tenantId,
        recurrence: schedule.enabled ? "disabled" : schedule.recurrence === "disabled" ? "daily" : schedule.recurrence,
      } as Partial<import("@/lib/hive-mind/types").CreateResearchScheduleRequest>);
      setSchedule(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle schedule");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRunNow() {
    if (!client || !schedule) return;
    setActionLoading("run");
    try {
      await client.runResearchScheduleNow(schedule.id);
      fetchRuns();
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run schedule");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!client || !schedule) return;
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    setActionLoading("delete");
    try {
      await client.deleteResearchSchedule(schedule.id);
      router.push("/hive-mind/research/schedules");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete schedule");
      setActionLoading(null);
    }
  }

  async function handleAcknowledgeAlert(alertId: string) {
    if (!client) return;
    setAcknowledgingId(alertId);
    try {
      await client.acknowledgeResearchAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to acknowledge alert");
    } finally {
      setAcknowledgingId(null);
    }
  }

  function startEditQuery() {
    if (!schedule) return;
    setEditQuery(schedule.query);
    setEditingQuery(true);
  }

  async function saveQuery() {
    if (!client || !schedule) return;
    setActionLoading("edit");
    try {
      const updated = await client.updateResearchSchedule(schedule.id, {
        query: editQuery.trim(),
        tenantId: schedule.tenantId,
      });
      setSchedule(updated);
      setEditingQuery(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update query");
    } finally {
      setActionLoading(null);
    }
  }

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <>
      <CRMTopbar
        title={schedule ? `Schedule: ${schedule.query.slice(0, 50)}${schedule.query.length > 50 ? "..." : ""}` : "Research Schedule"}
        subtitle="View and manage this research schedule"
      />

      <div className="px-6 pb-6 max-w-4xl space-y-4">
        <Link
          href="/hive-mind/research/schedules"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Schedules
        </Link>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading schedule...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-[20px] bg-card p-6 shadow-card">
            <div className="flex items-start gap-3">
              <XCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => { setError(null); fetchSchedule(); }}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
                >
                  <RefreshCw className="size-3.5" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not found */}
        {!loading && !error && !schedule && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <XCircle className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Schedule not found.</p>
            <Link
              href="/hive-mind/research/schedules"
              className="inline-flex items-center gap-2 mt-3 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to Schedules
            </Link>
          </div>
        )}

        {/* Schedule details */}
        {schedule && !loading && (
          <div className="space-y-4">
            {/* Header */}
            <div className="rounded-[20px] bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CalendarClock
                    className={cn(
                      "size-6 shrink-0",
                      schedule.enabled ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="min-w-0">
                    {editingQuery ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editQuery}
                          onChange={(e) => setEditQuery(e.target.value)}
                          className={cn(
                            "flex-1 h-8 rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          )}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveQuery();
                            if (e.key === "Escape") setEditingQuery(false);
                          }}
                        />
                        <button
                          onClick={saveQuery}
                          disabled={!editQuery.trim() || actionLoading === "edit"}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === "edit" ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                          Save
                        </button>
                        <button
                          onClick={() => setEditingQuery(false)}
                          className="inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h2
                        className="font-poppins font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={startEditQuery}
                        title="Click to edit"
                      >
                        {schedule.query}
                      </h2>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ID: <code className="text-xs">{schedule.id}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {/* Run now */}
                  <button
                    onClick={handleRunNow}
                    disabled={actionLoading === "run" || !schedule.enabled}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "run" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Play className="size-3.5" />
                    )}
                    Run Now
                  </button>

                  {/* Toggle */}
                  <button
                    onClick={handleToggle}
                    disabled={actionLoading === "toggle"}
                    className="flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                    title={schedule.enabled ? "Disable" : "Enable"}
                  >
                    {actionLoading === "toggle" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : schedule.enabled ? (
                      <ToggleRight className="size-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="size-6 text-muted-foreground" />
                    )}
                  </button>

                  {/* Refresh */}
                  <button
                    onClick={() => { fetchSchedule(); fetchRuns(); fetchAlerts(); }}
                    className="flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="size-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading === "delete"}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                    title="Delete schedule"
                  >
                    {actionLoading === "delete" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                    schedule.enabled
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                  )}
                >
                  {schedule.enabled ? "Enabled" : "Disabled"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Recurrence: <span className="font-medium text-foreground">{recurrenceLabels[schedule.recurrence]}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Mode: <span className="font-medium text-foreground">{schedule.sourceMode}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Timezone: <span className="font-medium text-foreground">{schedule.timezone}</span>
                </span>
                {schedule.maxSources && (
                  <span className="text-xs text-muted-foreground">
                    Max sources: <span className="font-medium text-foreground">{schedule.maxSources}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Timing info */}
            <div className="rounded-[20px] bg-card p-6 shadow-card">
              <h3 className="font-poppins font-semibold text-foreground mb-3">
                Schedule Timing
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">
                    {new Date(schedule.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-foreground">
                    {new Date(schedule.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Run</p>
                  <p className="text-sm text-foreground">
                    {schedule.lastRunAt
                      ? new Date(schedule.lastRunAt).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                {schedule.enabled && schedule.nextRunAt && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      Next Run
                    </p>
                    <p className="text-sm text-foreground">
                      {new Date(schedule.nextRunAt).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      ({formatNextRun(schedule.nextRunAt)})
                    </p>
                  </div>
                )}
                {schedule.createdBy && (
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm text-foreground">{schedule.createdBy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="rounded-[20px] bg-card p-6 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Bell className="size-4" />
                  Alerts ({alerts.length})
                  {unacknowledgedCount > 0 && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      {unacknowledgedCount} new
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "rounded-xl p-3",
                        alert.severity === "critical" && "bg-red-50 dark:bg-red-950/20",
                        alert.severity === "warning" && "bg-amber-50 dark:bg-amber-950/20",
                        alert.severity === "info" && "bg-blue-50 dark:bg-blue-950/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{alert.title}</p>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                                severityStyles[alert.severity]
                              )}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {alert.changeType.replace(/_/g, " ")}
                            </span>
                          </div>
                          {alert.summary && (
                            <p className="text-xs text-muted-foreground mt-1">{alert.summary}</p>
                          )}
                          {alert.sourceUrls && alert.sourceUrls.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {alert.sourceUrls.slice(0, 3).map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] bg-muted text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
                                >
                                  <Globe className="size-2.5 shrink-0" />
                                  {(() => { try { return new URL(url).hostname; } catch { return url.slice(0, 30); } })()}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            disabled={acknowledgingId === alert.id}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0 ml-3"
                          >
                            {acknowledgingId === alert.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Check className="size-3" />
                            )}
                            Ack
                          </button>
                        )}
                        {alert.acknowledged && (
                          <span className="text-[11px] text-muted-foreground shrink-0 ml-3">
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Run History */}
            <div className="rounded-[20px] bg-card p-6 shadow-card">
              <h3 className="font-poppins font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="size-4" />
                Run History ({runs.length})
              </h3>
              {runs.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No runs yet. Use &quot;Run Now&quot; to trigger the first run.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {runs.map((run) => {
                    const Icon = statusIcon[run.status] ?? Clock;
                    return (
                      <Link
                        key={run.id}
                        href={`/hive-mind/research/${run.id}`}
                        className="flex items-center justify-between rounded-xl bg-muted/50 p-3 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              run.status === "completed" && "text-green-600",
                              run.status === "failed" && "text-destructive",
                              (run.status === "indexing" || run.status === "summarizing") && "text-amber-500",
                              run.status === "queued" && "text-blue-500",
                              run.status === "cancelled" && "text-muted-foreground"
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-foreground truncate">{run.query}</p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              {run.sourceCount !== null && run.sourceCount !== undefined && (
                                <span>{run.sourceCount} sources</span>
                              )}
                              {run.completedAt && (
                                <span>{new Date(run.completedAt).toLocaleString()}</span>
                              )}
                              {!run.completedAt && run.createdAt && (
                                <span>{new Date(run.createdAt).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                              statusStyles[run.status]
                            )}
                          >
                            {run.status}
                          </span>
                          <ArrowRight className="size-3.5 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
