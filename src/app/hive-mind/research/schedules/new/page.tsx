"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { ResearchScheduleRecurrence, ResearchSourceMode } from "@/lib/hive-mind/types";
import { recurrenceLabels, RESEARCH_SCHEDULE_RECURRENCES } from "@/lib/hive-mind/status-config";
import { SourceModeSelector } from "@/components/hive-mind/source-mode-selector";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  CalendarClock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIMEZONES = typeof Intl !== "undefined" && Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney"];

export default function NewResearchSchedulePage() {
  const { client, selectedTenantId, selectedProjectId, tenants, projects } = useHiveMind();

  const [query, setQuery] = useState("");
  const [sourceMode, setSourceMode] = useState<ResearchSourceMode>("auto");
  const [maxSources, setMaxSources] = useState(10);
  const [recurrence, setRecurrence] = useState<ResearchScheduleRecurrence>("daily");
  const [runTime, setRunTime] = useState("08:00");
  const [timezone, setTimezone] = useState("UTC");
  const [tenantOverride, setTenantOverride] = useState(selectedTenantId ?? "");
  const [projectOverride, setProjectOverride] = useState(selectedProjectId ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: "success" | "error"; message: string; scheduleId?: string } | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof HiveMindApiError) {
      setResult({ status: "error", message: `API error ${err.status}: ${err.statusText}` });
    } else if (err instanceof HiveMindNetworkError) {
      setResult({ status: "error", message: err.message });
    } else {
      setResult({ status: "error", message: err instanceof Error ? err.message : "Failed to create schedule" });
    }
  }, []);

  useEffect(() => {
    if (result?.status === "success") {
      const timer = setTimeout(() => setResult(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const canSubmit = !!query.trim() && !!tenantOverride && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await client!.createResearchSchedule({
        query: query.trim(),
        sourceMode,
        maxSources,
        recurrence,
        timezone,
        runTime,
        tenantId: tenantOverride,
        projectId: projectOverride || undefined,
      });
      setResult({ status: "success", message: "Schedule created successfully", scheduleId: res.id });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CRMTopbar
        title="New Research Schedule"
        subtitle="Create an automated recurring research run"
      />

      <div>
        <Link
          href="/hive-mind/research/schedules"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Schedules
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Query */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-foreground mb-1">
              Research Query
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              What should this schedule research? Be specific to get better results.
            </p>
            <div>
              <label htmlFor="schedule-query" className="text-xs font-medium text-foreground mb-1 block">
                Query
              </label>
              <textarea
                id="schedule-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What are the latest trends in AI-powered CRM?"
                required
                rows={3}
                className={cn(
                  "w-full rounded-[12px] bg-muted border border-input px-3 py-2 text-sm transition-colors outline-none resize-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              />
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-foreground mb-1">
              Schedule Configuration
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Set how often this research should run.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Recurrence
                </label>
                <div className="flex gap-1 rounded-xl bg-muted p-1">
                  {RESEARCH_SCHEDULE_RECURRENCES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRecurrence(r)}
                      className={cn(
                        "flex-1 inline-flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-medium capitalize transition-colors",
                        recurrence === r
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {recurrenceLabels[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="run-time" className="text-xs font-medium text-foreground mb-1 block">
                  Run Time
                </label>
                <input
                  id="run-time"
                  type="time"
                  value={runTime}
                  onChange={(e) => setRunTime(e.target.value)}
                  className={cn(
                    "h-10 w-40 rounded-[12px] bg-muted border border-input px-3 text-sm transition-colors outline-none",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                  )}
                />
              </div>

              <div>
                <label htmlFor="timezone-select" className="text-xs font-medium text-foreground mb-1 block">
                  Timezone
                </label>
                <select
                  id="timezone-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={cn(
                    "h-10 w-full rounded-[12px] bg-muted border border-input px-3 text-sm outline-none",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                  )}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Source Configuration */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-foreground mb-1">
              Source Configuration
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Choose how sources are collected for this research.
            </p>

            <div className="space-y-3">
              <SourceModeSelector value={sourceMode} onChange={setSourceMode} />

              <div>
                <label htmlFor="max-sources" className="text-xs font-medium text-foreground mb-1 block">
                  Max Sources
                </label>
                <input
                  id="max-sources"
                  type="number"
                  min={1}
                  max={100}
                  value={maxSources}
                  onChange={(e) => setMaxSources(parseInt(e.target.value, 10) || 1)}
                  className={cn(
                    "h-10 w-24 rounded-[12px] bg-muted border border-input px-3 text-sm transition-colors outline-none",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center gap-2 w-full text-left"
            >
              {advancedOpen ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
              <h3 className="font-poppins font-semibold text-foreground">
                Advanced Settings
              </h3>
            </button>

            {advancedOpen && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-4">
                  Select the organization and project context for this schedule.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tenant-select" className="text-xs font-medium text-foreground mb-1 block">
                      Organization
                    </label>
                    <select
                      id="tenant-select"
                      value={tenantOverride}
                      onChange={(e) => setTenantOverride(e.target.value)}
                      className={cn(
                        "h-10 w-full rounded-[12px] bg-muted border border-input px-3 text-sm outline-none",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                      )}
                      required
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="project-select" className="text-xs font-medium text-foreground mb-1 block">
                      Project <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <select
                      id="project-select"
                      value={projectOverride}
                      onChange={(e) => setProjectOverride(e.target.value)}
                      className={cn(
                        "h-10 w-full rounded-[12px] bg-muted border border-input px-3 text-sm outline-none",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                      )}
                    >
                      <option value="">All projects</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-medium transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CalendarClock className="size-4" />
                  Create Schedule
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div
            className={cn(
              "rounded-[20px] p-4 mt-4 bg-card shadow-card",
              result.status === "success"
                ? "bg-green-50 dark:bg-green-950/20"
                : "bg-red-50 dark:bg-red-950/20"
            )}
          >
            <div className="flex items-start gap-3">
              {result.status === "success" ? (
                <CheckCircle className="size-5 shrink-0 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{result.message}</p>
                {result.scheduleId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Schedule:{" "}
                    <Link
                      href={`/hive-mind/research/schedules/${result.scheduleId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {result.scheduleId.slice(0, 8)}...
                    </Link>
                  </p>
                )}
                {result.status === "success" && (
                  <div className="flex items-center gap-3 mt-2">
                    <Link
                      href={`/hive-mind/research/schedules/${result.scheduleId}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View schedule detail
                    </Link>
                    <Link
                      href="/hive-mind/research/schedules"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View all schedules
                    </Link>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
