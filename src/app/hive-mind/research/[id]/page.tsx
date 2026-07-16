"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { AuthGate } from "@/components/auth/auth-gate";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { ResearchRun, ResearchSource, ResearchFinding, ResearchRunOutputSummary } from "@/lib/hive-mind/types";
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
  BrainCircuit,
  Globe,
  FileText,
  AlertTriangle,
  StopCircle,
  RotateCcw,
  DollarSign,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  indexing: Play,
  summarizing: Play,
  completed: CheckCircle2,
  failed: AlertCircle,
  cancelled: X,
};

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  indexing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  summarizing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const POLL_INTERVAL = 3000;

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function parseOutputSummary(run: ResearchRun): ResearchRunOutputSummary | null {
  if (!run.outputSummary) return null;
  try {
    return JSON.parse(run.outputSummary) as ResearchRunOutputSummary;
  } catch {
    return null;
  }
}

export default function ResearchRunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { client } = useHiveMind();

  const [run, setRun] = useState<ResearchRun | null>(null);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [findings, setFindings] = useState<ResearchFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSources = useCallback(async () => {
    if (!client) return;
    setSourcesLoading(true);
    try {
      const data = await client.getResearchRunSources(id);
      setSources(data.sources ?? []);
    } catch {
      // best-effort
    } finally {
      setSourcesLoading(false);
    }
  }, [client, id]);

  const fetchFindings = useCallback(async () => {
    if (!client) return;
    setFindingsLoading(true);
    try {
      const data = await client.getResearchRunFindings(id);
      setFindings(data.findings ?? []);
    } catch {
      // best-effort
    } finally {
      setFindingsLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await client.getResearchRun(id);
        if (!cancelled) {
          setRun(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof HiveMindApiError) {
            setError(`API error ${err.status}: ${err.statusText}`);
          } else if (err instanceof HiveMindNetworkError) {
            setError(err.message);
          } else {
            setError(err instanceof Error ? err.message : "Unknown error");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, id, refreshKey]);

  useEffect(() => {
    if (run && sources.length === 0 && !sourcesLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSources();
    }
    if (run && findings.length === 0 && !findingsLoading) {
      fetchFindings();
    }
  }, [run, sources.length, sourcesLoading, findings.length, findingsLoading, fetchSources, fetchFindings]);

  useEffect(() => {
    if (!run) return;
    const isActive = ["pending", "indexing", "summarizing"].includes(run.status);
    if (isActive) {
      pollRef.current = setInterval(() => {
        setRefreshKey((k) => k + 1);
      }, POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.status]);

  function handleRefresh() {
    if (pollRef.current) clearInterval(pollRef.current);
    setRefreshKey((k) => k + 1);
    fetchSources();
    fetchFindings();
  }

  async function handleCancel() {
    if (!client) return;
    setActionLoading("cancel");
    try {
      await client.cancelResearchRun(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRetry() {
    if (!client) return;
    setActionLoading("retry");
    try {
      const res = await client.retryResearchRun(id);
      setRun(res.run);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry");
    } finally {
      setActionLoading(null);
    }
  }

  const outputSummary = run ? parseOutputSummary(run) : null;
  const isActive = run && ["pending", "indexing", "summarizing"].includes(run.status);
  const Icon = run ? (statusIcon[run.status] ?? Clock) : Clock;

  return (
    <>
      <CRMTopbar
        title={run ? `Research: ${run.query.slice(0, 60)}${run.query.length > 60 ? "..." : ""}` : "Research Run"}
        subtitle="View research run details, sources, and findings"
      />

      <div className="px-6 pb-6 max-w-4xl">
        <AuthGate
          title="Research Run"
          description="View detailed status, sources, findings, and executive summary."
        >
          <Link
            href="/hive-mind/research"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Research
          </Link>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <Loader2 className="size-4 animate-spin" />
              <span>Loading research run...</span>
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

          {run && !loading && (
            <div className="space-y-4">
              {/* Header */}
              <div className="rounded-[20px] bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        "size-6 shrink-0",
                        run.status === "completed" && "text-green-600",
                        run.status === "failed" && "text-destructive",
                        (run.status === "indexing" || run.status === "summarizing") && "text-amber-500 animate-pulse",
                        run.status === "pending" && "text-blue-500",
                        run.status === "cancelled" && "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0">
                      <h2 className="font-poppins font-semibold text-foreground truncate">
                        {run.query}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        ID: <code className="text-xs">{run.id}</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isActive && (
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading === "cancel"}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {actionLoading === "cancel" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <StopCircle className="size-3.5" />
                        )}
                        Cancel
                      </button>
                    )}
                    {(run.status === "failed" || run.status === "cancelled") && (
                      <button
                        onClick={handleRetry}
                        disabled={actionLoading === "retry"}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === "retry" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5" />
                        )}
                        Retry
                      </button>
                    )}
                    <button
                      onClick={handleRefresh}
                      className="flex size-7 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={cn("size-3.5", refreshKey > 0 && "animate-spin")} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                      statusStyles[run.status]
                    )}
                  >
                    {run.status}
                  </span>
                  {run.stage && (
                    <span className="text-xs text-muted-foreground">
                      Stage: <span className="font-medium text-foreground capitalize">{run.stage}</span>
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Mode: <span className="font-medium text-foreground">{run.sourceMode}</span>
                  </span>
                  {run.sourceCount !== null && run.sourceCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      Sources: <span className="font-medium text-foreground">{run.sourceCount}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Warnings */}
              {run.warnings && run.warnings.length > 0 && (
                <div className="rounded-[20px] bg-card p-4 shadow-card">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">
                        Warnings ({run.warnings.length})
                      </p>
                      {run.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{w}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Timing + Cost */}
              <div className="rounded-[20px] bg-card p-6 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground mb-3">
                  Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm text-foreground">
                      {run.createdAt ? new Date(run.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Started</p>
                    <p className="text-sm text-foreground">
                      {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-sm text-foreground">
                      {run.completedAt ? new Date(run.completedAt).toLocaleString() : "—"}
                    </p>
                  </div>
                  {run.latencyMs !== null && run.latencyMs !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="size-3" />
                        Latency
                      </p>
                      <p className="text-sm text-foreground">{formatDuration(run.latencyMs)}</p>
                    </div>
                  )}
                  {run.estimatedCostUsd !== null && run.estimatedCostUsd !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="size-3" />
                        Estimated Cost
                      </p>
                      <p className="text-sm text-foreground">${run.estimatedCostUsd.toFixed(6)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {run.error && (
                <div className="rounded-[20px] bg-card p-6 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground mb-2">
                    Error
                  </h3>
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3">
                    <p className="text-sm text-muted-foreground">{run.error}</p>
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              {outputSummary && (
                <div className="rounded-[20px] bg-card p-6 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="size-4" />
                    Executive Summary
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {outputSummary.executiveSummary}
                  </p>

                  {outputSummary.limitations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Limitations</p>
                      <ul className="space-y-1">
                        {outputSummary.limitations.map((l, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-muted-foreground mt-0.5">&bull;</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {outputSummary.suggestedFollowups.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Follow-ups</p>
                      <ul className="space-y-1">
                        {outputSummary.suggestedFollowups.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-muted-foreground mt-0.5">&rarr;</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {outputSummary.sourceList.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Sources ({outputSummary.sourceList.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {outputSummary.sourceList.map((s, i) => (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors truncate max-w-[250px]"
                          >
                            <Globe className="size-3 shrink-0" />
                            {s.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Key Findings */}
              {outputSummary && outputSummary.keyFindings.length > 0 && (
                <div className="rounded-[20px] bg-card p-6 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground mb-2 flex items-center gap-2">
                    <BrainCircuit className="size-4" />
                    Key Findings
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                        outputSummary.confidence === "high" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                        outputSummary.confidence === "medium" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                        outputSummary.confidence === "low" && "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                      )}
                    >
                      {outputSummary.confidence} confidence
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {outputSummary.keyFindings.map((kf, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="size-5 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {kf}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Findings (detailed) */}
              {findings.length > 0 && (
                <div className="rounded-[20px] bg-card p-6 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="size-4" />
                    Detailed Findings ({findings.length})
                  </h3>
                  {findingsLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                      <Loader2 className="size-3 animate-spin" />
                      Loading findings...
                    </div>
                  )}
                  <div className="space-y-3">
                    {findings.map((finding) => (
                      <div key={finding.id} className="rounded-xl bg-muted/50 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {finding.title}
                          </h4>
                          {finding.confidence && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                                finding.confidence === "high" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                finding.confidence === "medium" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                finding.confidence === "low" && "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                              )}
                            >
                              {finding.confidence}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                          {finding.summary}
                        </p>

                        {/* Citations */}
                        {finding.citations && finding.citations.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[11px] font-medium text-muted-foreground">
                              Citations ({finding.citations.length})
                            </p>
                            {finding.citations.map((c, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[11px]">
                                <span className="text-muted-foreground shrink-0 mt-0.5">[{i + 1}]</span>
                                <div>
                                  <p className="text-muted-foreground">{c.claim}</p>
                                  {c.sourceUrl && (
                                    <a
                                      href={c.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                      <Globe className="size-3" />
                                      {c.sourceUrl.slice(0, 60)}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              <div className="rounded-[20px] bg-card p-6 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="size-4" />
                  Sources
                </h3>
                {sourcesLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="size-3 animate-spin" />
                    Loading sources...
                  </div>
                ) : sources.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-[11px] text-muted-foreground uppercase">
                          <th className="pb-2 pr-3 font-medium">URL</th>
                          <th className="pb-2 pr-3 font-medium">Crawl</th>
                          <th className="pb-2 pr-3 font-medium">Index</th>
                          <th className="pb-2 font-medium">Doc ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sources.map((source) => (
                          <tr key={source.id} className="border-b border-border/50">
                            <td className="py-2 pr-3">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline truncate block max-w-[300px]"
                              >
                                {source.title || source.url}
                              </a>
                            </td>
                            <td className="py-2 pr-3">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                                  source.crawlStatus === "completed" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                  source.crawlStatus === "failed" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                                  source.crawlStatus === "pending" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                  (source.crawlStatus === "crawling" || source.crawlStatus === "processing") && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                )}
                              >
                                {source.crawlStatus ?? "—"}
                              </span>
                            </td>
                            <td className="py-2 pr-3">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                                  source.indexStatus === "completed" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                  source.indexStatus === "failed" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                                  source.indexStatus === "pending" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                  source.indexStatus === "processing" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                )}
                              >
                                {source.indexStatus ?? "—"}
                              </span>
                            </td>
                            <td className="py-2">
                              {source.documentId ? (
                                <Link
                                  href={`/hive-mind/documents/${source.documentId}`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {source.documentId.slice(0, 8)}...
                                </Link>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {isActive ? "Sources are being discovered..." : "No sources for this run."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Not found */}
          {!loading && !error && !run && (
            <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
              <XCircle className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Research run not found.
              </p>
              <Link
                href="/hive-mind/research"
                className="inline-flex items-center gap-2 mt-3 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Back to Research
              </Link>
            </div>
          )}
        </AuthGate>
      </div>
    </>
  );
}
