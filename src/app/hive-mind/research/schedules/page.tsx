"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { ResearchSchedule, ResearchAlert } from "@/lib/hive-mind/types";
import {
  Loader2,
  XCircle,
  RefreshCw,
  Plus,
  CalendarClock,
  Clock,
  Play,
  ArrowRight,
  Bell,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 30000;

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

export default function ResearchScheduleListPage() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant } = useHiveMind();

  const [schedules, setSchedules] = useState<ResearchSchedule[]>([]);
  const [alerts, setAlerts] = useState<ResearchAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setTick] = useState(0);

  const fetchSchedules = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.listResearchSchedules({
        tenantId: selectedTenantId,
        projectId: selectedProjectId ?? undefined,
      });
      setSchedules(res.schedules ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [client, selectedTenantId, selectedProjectId]);

  const fetchAlerts = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    try {
      const res = await client.listResearchAlerts({
        tenantId: selectedTenantId,
        projectId: selectedProjectId ?? undefined,
        acknowledged: false,
      });
      setAlerts(res.alerts ?? []);
    } catch {
      // best-effort
    }
  }, [client, selectedTenantId, selectedProjectId]);

  useEffect(() => {
    if (selectedTenantId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSchedules();
      fetchAlerts();
    }
  }, [fetchSchedules, fetchAlerts, selectedTenantId]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      setTick((t) => t + 1);
      fetchSchedules();
      fetchAlerts();
    }, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSchedules, fetchAlerts]);

  async function handleToggle(schedule: ResearchSchedule) {
    if (!client) return;
    setTogglingId(schedule.id);
    try {
      await client.updateResearchSchedule(schedule.id, {
        tenantId: schedule.tenantId,
        recurrence: schedule.enabled ? "disabled" : schedule.recurrence === "disabled" ? "daily" : schedule.recurrence,
      } as Partial<import("@/lib/hive-mind/types").CreateResearchScheduleRequest>);
      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? { ...s, enabled: !s.enabled } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle schedule");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleRunNow(schedule: ResearchSchedule) {
    if (!client) return;
    setRunningId(schedule.id);
    try {
      await client.runResearchScheduleNow(schedule.id);
      fetchSchedules();
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run schedule");
    } finally {
      setRunningId(null);
    }
  }

  const unacknowledgedAlertCount = alerts.length;

  return (
    <>
      <CRMTopbar
        title="Research Schedules"
        subtitle={selectedTenant ? `Scheduled research in ${selectedTenant.name}` : "Automated recurring research runs"}
      />

      <div className="px-6 pb-6 max-w-4xl space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchSchedules(); fetchAlerts(); }}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
          {unacknowledgedAlertCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <Bell className="size-3.5" />
              {unacknowledgedAlertCount} unacknowledged alert{unacknowledgedAlertCount !== 1 ? "s" : ""}
            </div>
          )}
          <Link
            href="/hive-mind/research/schedules/new"
            className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" />
            New Schedule
          </Link>
        </div>

        {/* Loading */}
        {loading && schedules.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading schedules...
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
            <CalendarClock className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an organization to view research schedules.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && selectedTenantId && schedules.length === 0 && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <CalendarClock className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No research schedules yet. Create one to automate recurring research.
            </p>
            <Link
              href="/hive-mind/research/schedules/new"
              className="inline-flex items-center gap-2 mt-3 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-3.5" />
              Create Schedule
            </Link>
          </div>
        )}

        {/* Schedule list */}
        {schedules.length > 0 && (
          <div className="flex flex-col gap-2">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-xl bg-card p-4 shadow-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/hive-mind/research/schedules/${schedule.id}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <CalendarClock
                      className={cn(
                        "size-5 shrink-0",
                        schedule.enabled ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {schedule.query}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-muted-foreground">
                          {recurrenceLabels[schedule.recurrence] ?? schedule.recurrence}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          &middot; {schedule.sourceMode}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          &middot; {schedule.timezone}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                            schedule.enabled
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          )}
                        >
                          {schedule.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Next run countdown */}
                    {schedule.enabled && schedule.nextRunAt && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        {formatNextRun(schedule.nextRunAt)}
                      </div>
                    )}

                    {/* Run now */}
                    <button
                      onClick={() => handleRunNow(schedule)}
                      disabled={runningId === schedule.id || !schedule.enabled}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg transition-colors",
                        "text-muted-foreground hover:text-foreground hover:bg-muted",
                        "disabled:opacity-50 disabled:pointer-events-none"
                      )}
                      title="Run now"
                    >
                      {runningId === schedule.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Play className="size-3.5" />
                      )}
                    </button>

                    {/* Toggle enable/disable */}
                    <button
                      onClick={() => handleToggle(schedule)}
                      disabled={togglingId === schedule.id}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg transition-colors",
                        "disabled:opacity-50 disabled:pointer-events-none"
                      )}
                      title={schedule.enabled ? "Disable" : "Enable"}
                    >
                      {togglingId === schedule.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : schedule.enabled ? (
                        <ToggleRight className="size-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="size-5 text-muted-foreground" />
                      )}
                    </button>

                    {/* Link to detail */}
                    <Link
                      href={`/hive-mind/research/schedules/${schedule.id}`}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>

                {/* Last run info */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {schedule.lastRunAt && (
                    <span>
                      Last run: {new Date(schedule.lastRunAt).toLocaleDateString()}{" "}
                      {new Date(schedule.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {schedule.nextRunAt && schedule.enabled && (
                    <span>
                      Next run: {new Date(schedule.nextRunAt).toLocaleDateString()}{" "}
                      {new Date(schedule.nextRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {schedule.maxSources && (
                    <span>Max sources: {schedule.maxSources}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unacknowledged alerts */}
        {!loading && alerts.length > 0 && (
          <div className="rounded-[20px] bg-card p-6 shadow-card">
            <h3 className="font-poppins font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell className="size-4" />
              Recent Alerts ({alerts.length})
            </h3>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
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
                      <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                      {alert.summary && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{alert.summary}</p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize shrink-0 ml-2",
                        alert.severity === "critical" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                        alert.severity === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                        alert.severity === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      )}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
