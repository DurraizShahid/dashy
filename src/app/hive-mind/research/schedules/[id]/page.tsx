"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { ResearchSchedule, ResearchAlert, ResearchRun, ResearchSourceMode, ResearchScheduleRecurrence } from "@/lib/hive-mind/types";
import { ResearchStatusBadge } from "@/components/hive-mind/research-status-badge";
import { SourceModeSelector } from "@/components/hive-mind/source-mode-selector";
import { statusIcon, recurrenceLabels, formatNextRun, formatDuration } from "@/lib/hive-mind/status-config";
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
  Pencil,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 30000;

const TIMEZONES = typeof Intl !== "undefined" && Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney"];

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

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
  const [editing, setEditing] = useState(false);
  const [editQuery, setEditQuery] = useState("");
  const [editSourceMode, setEditSourceMode] = useState<ResearchSourceMode>("auto");
  const [editMaxSources, setEditMaxSources] = useState(10);
  const [editTimezone, setEditTimezone] = useState("UTC");
  const [editRecurrence, setEditRecurrence] = useState<ResearchScheduleRecurrence>("daily");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    } catch (err) {
      console.error("Failed to fetch runs", err);
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
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  }, [client, id, schedule]);

  const fetchRunsRef = useRef(fetchRuns);
  useEffect(() => { fetchRunsRef.current = fetchRuns; }, [fetchRuns]);
  const fetchAlertsRef = useRef(fetchAlerts);
  useEffect(() => { fetchAlertsRef.current = fetchAlerts; }, [fetchAlerts]);

  useEffect(() => {
    fetchSchedule();
    fetchRuns();
  }, [fetchSchedule, fetchRuns]);

  useEffect(() => {
    if (schedule) {
      fetchAlerts();
    }
  }, [schedule, fetchAlerts]);

  useEffect(() => {
    if (schedule?.enabled) {
      pollRef.current = setInterval(() => {
        fetchRunsRef.current();
        fetchAlertsRef.current();
      }, POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule?.enabled]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  async function handleToggle() {
    if (!client || !schedule) return;
    setActionLoading("toggle");
    try {
      const updated = await client.updateResearchSchedule(schedule.id, {
        tenantId: schedule.tenantId,
        recurrence: schedule.enabled ? "disabled" : schedule.recurrence === "disabled" ? "daily" : schedule.recurrence,
      });
      setSchedule(updated);
      setSuccessMessage(updated.enabled ? "Schedule enabled" : "Schedule disabled");
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
      setSuccessMessage("Schedule triggered successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run schedule");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!client || !schedule) return;
    setActionLoading("delete");
    setConfirmDelete(false);
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

  function startEditing() {
    if (!schedule) return;
    setEditQuery(schedule.query);
    const validModes: readonly string[] = ["auto", "manual", "hybrid", "mixed"];
    setEditSourceMode(
      validModes.includes(schedule.sourceMode)
        ? schedule.sourceMode as ResearchSourceMode
        : "auto"
    );
    setEditMaxSources(schedule.maxSources ?? 10);
    setEditTimezone(schedule.timezone);
    setEditRecurrence(schedule.recurrence);
    setEditing(true);
  }

  async function saveEdit() {
    if (!client || !schedule) return;
    setActionLoading("edit");
    try {
      const updated = await client.updateResearchSchedule(schedule.id, {
        query: editQuery.trim(),
        sourceMode: editSourceMode,
        maxSources: editMaxSources,
        timezone: editTimezone,
        recurrence: editRecurrence,
        tenantId: schedule.tenantId,
      });
      setSchedule(updated);
      setEditing(false);
      setSuccessMessage("Schedule updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update schedule");
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

      <div>
        <Link
          href="/hive-mind/research/schedules"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Schedules
        </Link>

        {successMessage && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-xs text-green-700 dark:text-green-400 mb-4">
            {successMessage}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading schedule...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[20px] bg-card p-5 shadow-card mb-4">
            <div className="flex items-start gap-3">
              <XCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => { setError(null); fetchSchedule(); }}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
                >
                  <RefreshCw className="size-3.5" />
                  Retry
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="shrink-0 flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !schedule && (
          <div className="rounded-[20px] bg-card p-5 shadow-card text-center">
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

        {confirmDelete && (
          <div className="rounded-[20px] bg-card p-5 shadow-card border border-destructive/30 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Are you sure?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will permanently delete the schedule and all its runs.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading === "delete"}
                    className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "delete" ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {schedule && !loading && (
          <div className="space-y-4">
            <div className="rounded-[20px] bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CalendarClock
                    className={cn(
                      "size-6 shrink-0",
                      schedule.enabled ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="min-w-0">
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editQuery}
                          onChange={(e) => setEditQuery(e.target.value)}
                          className={cn(
                            "flex-1 h-8 rounded-lg border border-input bg-muted px-3 text-sm transition-colors outline-none",
                            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          )}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") setEditing(false);
                          }}
                        />
                      </div>
                    ) : (
                      <h2 className="font-poppins font-semibold text-foreground truncate">
                        {schedule.query}
                      </h2>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ID: <code className="text-xs">{schedule.id}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {!editing && (
                    <button
                      onClick={startEditing}
                      className="flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Edit schedule"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleRunNow}
                    disabled={actionLoading === "run" || !schedule.enabled}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    aria-label="Run now"
                  >
                    {actionLoading === "run" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Play className="size-3.5" />
                    )}
                    Run Now
                  </button>

                  <button
                    onClick={handleToggle}
                    disabled={actionLoading === "toggle"}
                    className="flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                    aria-label={schedule.enabled ? "Disable schedule" : "Enable schedule"}
                  >
                    {actionLoading === "toggle" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : schedule.enabled ? (
                      <ToggleRight className="size-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="size-6 text-muted-foreground" />
                    )}
                  </button>

                  <button
                    onClick={() => { fetchSchedule(); fetchRuns(); fetchAlerts(); }}
                    className="flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Refresh data"
                  >
                    <RefreshCw className="size-3.5" />
                  </button>

                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={actionLoading === "delete"}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                    aria-label="Delete schedule"
                  >
                    {actionLoading === "delete" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>

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

              {editing && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <h4 className="font-poppins font-semibold text-foreground text-sm">
                    Edit Schedule
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Query
                      </label>
                      <input
                        type="text"
                        value={editQuery}
                        onChange={(e) => setEditQuery(e.target.value)}
                        className={cn(
                          "w-full h-10 rounded-xl border border-input bg-muted px-3 text-sm outline-none",
                          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        )}
                      />
                    </div>

                    <SourceModeSelector
                      value={editSourceMode}
                      onChange={setEditSourceMode}
                    />

                    <div>
                      <label htmlFor="edit-max-sources" className="text-xs font-medium text-foreground mb-1 block">
                        Max Sources
                      </label>
                      <input
                        id="edit-max-sources"
                        type="number"
                        min={1}
                        max={100}
                        value={editMaxSources}
                        onChange={(e) => setEditMaxSources(parseInt(e.target.value, 10) || 1)}
                        className={cn(
                          "h-10 w-24 rounded-xl border border-input bg-muted px-3 text-sm outline-none",
                          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Recurrence
                      </label>
                      <div className="flex gap-1 rounded-xl bg-muted p-1">
                        {(["daily", "weekly", "monthly", "disabled"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setEditRecurrence(r)}
                            className={cn(
                              "flex-1 inline-flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-medium capitalize transition-colors",
                              editRecurrence === r
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {r === "disabled" ? "Off" : r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="edit-timezone" className="text-xs font-medium text-foreground mb-1 block">
                        Timezone
                      </label>
                      <select
                        id="edit-timezone"
                        value={editTimezone}
                        onChange={(e) => setEditTimezone(e.target.value)}
                        className={cn(
                          "h-10 w-full rounded-xl border border-input bg-muted px-3 text-sm outline-none",
                          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                        )}
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={!editQuery.trim() || actionLoading === "edit"}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === "edit" ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3" />
                      )}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[20px] bg-card p-5 shadow-card">
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {run.sourceCount !== null && run.sourceCount !== undefined && (
                                <span>{run.sourceCount} sources</span>
                              )}
                              {run.latencyMs != null && (
                                <span>{formatDuration(run.latencyMs)}</span>
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
                          <ResearchStatusBadge status={run.status} />
                          <ArrowRight className="size-3.5 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[20px] bg-card p-5 shadow-card">
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
                    <p className="text-xs text-muted-foreground">
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

            {alerts.length > 0 && (
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Bell className="size-4" />
                  Alerts ({alerts.length})
                  {unacknowledgedCount > 0 && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
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
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                                severityStyles[alert.severity]
                              )}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-xs text-muted-foreground">
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
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0 ml-3"
                            aria-label={`Acknowledge alert ${alert.title}`}
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
                          <span className="text-xs text-muted-foreground shrink-0 ml-3">
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
