import { type ComponentType } from "react";
import { Clock, Play, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";

export const RESEARCH_RUN_STATUSES = [
  "queued",
  "planning",
  "searching",
  "crawling",
  "indexing",
  "summarizing",
  "completed",
  "failed",
  "cancelled",
] as const;

export type ResearchRunStatus = (typeof RESEARCH_RUN_STATUSES)[number];

export const statusIcon: Record<string, ComponentType<{ className?: string }>> = {
  queued: Clock,
  planning: Loader2,
  searching: Loader2,
  crawling: Loader2,
  indexing: Play,
  summarizing: Play,
  completed: CheckCircle2,
  failed: AlertCircle,
  cancelled: X,
};

export const statusStyles: Record<string, string> = {
  queued: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  planning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  searching: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  crawling: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  indexing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  summarizing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export const RESEARCH_SCHEDULE_RECURRENCES = ["daily", "weekly", "monthly", "disabled"] as const;

export const recurrenceLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  disabled: "Disabled",
};

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function formatNextRun(nextRunAt: string | undefined): string {
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

export function formatCostUsd(cost: number | undefined | null): string {
  if (cost === null || cost === undefined) return "—";
  if (cost >= 1) return `$${cost.toFixed(2)}`;
  if (cost >= 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(6)}`;
}
