"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type {
  MergeSuggestionItem,
  ReindexResponse,
  MergeEntitiesPreviewResponse,
  MergeHistoryEntry,
  BackfillItem,
  GraphOverviewResponse,
} from "@/lib/hive-mind/types";
import { HiveMindApiError } from "@/lib/hive-mind/errors";
import {
  GitBranch,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  Brain,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  ExternalLink,
  Trash2,
  Clock,
  DollarSign,
  BarChart3,
  History,
  Search,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GraphQualityPage() {
  const { client, selectedTenantId, selectedTenant, selectedProject } = useHiveMind();

  // Merge suggestions
  const [suggestions, setSuggestions] = useState<MergeSuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Merge preview
  const [previewData, setPreviewData] = useState<MergeEntitiesPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Merge history
  const [mergeHistory, setMergeHistory] = useState<MergeHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Overview stats
  const [overview, setOverview] = useState<GraphOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Rebuild controls
  const [showRebuild, setShowRebuild] = useState(false);
  const [rebuildDocId, setRebuildDocId] = useState("");
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const [rebuildResult, setRebuildResult] = useState<ReindexResponse | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [clearFirst, setClearFirst] = useState(false);

  // Backfill controls
  const [showBackfill, setShowBackfill] = useState(false);
  const [backfillScope, setBackfillScope] = useState<"document" | "project" | "tenant" | "failed">("tenant");
  const [backfillDocId, setBackfillDocId] = useState("");
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState<{
    queuedCount: number;
    skippedCount: number;
    failedCount: number;
    items: BackfillItem[];
    dryRun: boolean;
  } | null>(null);
  const [backfillDryRun, setBackfillDryRun] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await client.getMergeSuggestions({
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
      });
      setSuggestions(result.suggestions);
    } catch (e: unknown) {
      if (e instanceof HiveMindApiError && e.code === "SESSION_EXPIRED") {
        window.location.replace("/sign-in");
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load merge suggestions");
    } finally {
      setLoading(false);
    }
  }, [client, selectedTenantId, selectedProject]);

  const fetchOverview = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    setOverviewLoading(true);
    try {
      const data = await client.getGraphOverview({
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
      });
      setOverview(data);
    } catch {
      // Non-blocking
    } finally {
      setOverviewLoading(false);
    }
  }, [client, selectedTenantId, selectedProject]);

  const fetchMergeHistory = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    setHistoryLoading(true);
    try {
      const result = await client.getMergeHistory({
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
      });
      setMergeHistory(result.entries);
    } catch {
      // Non-blocking
    } finally {
      setHistoryLoading(false);
    }
  }, [client, selectedTenantId, selectedProject]);

  useEffect(() => {
    fetchSuggestions();
    fetchOverview();
    fetchMergeHistory();
  }, [fetchSuggestions, fetchOverview, fetchMergeHistory]);

  const handleMerge = async (keepId: string, mergeId: string) => {
    if (!client || !selectedTenantId) return;
    setMerging(mergeId);
    setMessage(null);
    try {
      await client.mergeEntities({
        tenantId: selectedTenantId,
        keepId,
        mergeId,
      });
      setMessage({ type: "success", text: "Entities merged successfully" });
      setSuggestions((prev) => prev.filter((s) => s.entity.id !== mergeId && s.duplicate.id !== mergeId));
      fetchMergeHistory();
    } catch (e: unknown) {
      if (e instanceof HiveMindApiError && e.code === "SESSION_EXPIRED") {
        window.location.replace("/sign-in");
        return;
      }
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Merge failed" });
    } finally {
      setMerging(null);
    }
  };

  const handleIgnore = async (entityId: string, duplicateId: string) => {
    if (!client || !selectedTenantId) return;
    setMessage(null);
    try {
      await client.ignoreMergeSuggestion({
        tenantId: selectedTenantId,
        entityId,
        duplicateId,
      });
      setMessage({ type: "success", text: "Suggestion ignored" });
      setSuggestions((prev) =>
        prev.filter(
          (s) => !(s.entity.id === entityId && s.duplicate.id === duplicateId),
        ),
      );
    } catch (e: unknown) {
      if (e instanceof HiveMindApiError && e.code === "SESSION_EXPIRED") {
        window.location.replace("/sign-in");
        return;
      }
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to ignore suggestion" });
    }
  };

  const handlePreview = async (keepId: string, mergeId: string) => {
    if (!client || !selectedTenantId) return;
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const result = await client.getMergePreview({
        tenantId: selectedTenantId,
        keepId,
        mergeId,
      });
      setPreviewData(result);
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Preview failed" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRevertMerge = async (entityId: string) => {
    if (!client || !selectedTenantId) return;
    setMessage(null);
    try {
      const result = await client.revertMerge({
        tenantId: selectedTenantId,
        entityId,
      });
      setMessage({ type: result.reverted ? "success" : "error", text: result.message });
      if (result.reverted) {
        fetchMergeHistory();
        fetchSuggestions();
      }
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Revert failed" });
    }
  };

  const handleRebuildDocument = async () => {
    if (!client || !selectedTenantId || !rebuildDocId.trim()) return;
    setRebuildLoading(true);
    setRebuildResult(null);
    try {
      const result = await client.reindexDocument({
        tenantId: selectedTenantId,
        documentId: rebuildDocId.trim(),
        dryRun,
        clearFirst,
      });
      setRebuildResult(result);
    } catch (e: unknown) {
      setRebuildResult({
        enqueued: false,
        dryRun,
        details: e instanceof Error ? e.message : "Rebuild request failed",
      } as ReindexResponse);
    } finally {
      setRebuildLoading(false);
    }
  };

  const handleRebuildTenant = async () => {
    if (!client || !selectedTenantId) return;
    setRebuildLoading(true);
    setRebuildResult(null);
    try {
      const result = await client.reindexTenant({
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
        dryRun,
        clearFirst,
      });
      setRebuildResult(result);
    } catch (e: unknown) {
      setRebuildResult({
        enqueued: false,
        dryRun,
        details: e instanceof Error ? e.message : "Rebuild request failed",
      } as ReindexResponse);
    } finally {
      setRebuildLoading(false);
    }
  };

  const handleBackfill = async () => {
    if (!client || !selectedTenantId) return;
    setBackfillLoading(true);
    setBackfillResult(null);
    try {
      const result = await client.backfillGraph({
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
        documentId: backfillDocId.trim() || undefined,
        scope: backfillScope,
        dryRun: backfillDryRun,
      });
      setBackfillResult(result);
    } catch (e: unknown) {
      setBackfillResult({
        queuedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        items: [],
        dryRun: backfillDryRun,
      });
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Backfill failed" });
    } finally {
      setBackfillLoading(false);
    }
  };

  if (!selectedTenantId) {
    return (
      <>
        <CRMTopbar title="Graph Quality" subtitle="No organization selected" />
        <div className="px-6 pb-6 flex items-center justify-center py-20">
          <div className="text-center">
            <GitBranch className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Select an organization to view graph quality</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CRMTopbar title="Graph Quality" subtitle="Entity deduplication and merge management" />

      <div className="px-6 pb-6 space-y-4">
        {/* Scope bar */}
        <div className="rounded-[20px] bg-muted/50 p-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Scope: {selectedTenant?.name} {selectedProject ? `/ ${selectedProject.name}` : ""}
          </p>
          <button
            onClick={() => { fetchSuggestions(); fetchOverview(); fetchMergeHistory(); }}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={cn(
              "rounded-[20px] p-4 flex items-center gap-2 text-sm",
              message.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
            )}
          >
            {message.type === "success" ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
            {message.text}
          </div>
        )}

        {/* Overview Stats: LLM vs Deterministic counts */}
        {!overviewLoading && overview && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-[20px] bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="size-4 text-primary" />
                <span className="text-xs text-muted-foreground">Entities</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{overview.entityCount}</p>
            </div>
            <div className="rounded-[20px] bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="size-4 text-primary" />
                <span className="text-xs text-muted-foreground">Relationships</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{overview.relationshipCount}</p>
            </div>
            <div className="rounded-[20px] bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="size-4 text-primary" />
                <span className="text-xs text-muted-foreground">Document Nodes</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{overview.documentNodeCount}</p>
            </div>
          </div>
        )}

        {/* Extraction method stats */}
        {overview?.extractionMethodStats && overview.extractionMethodStats.length > 0 && (
          <div className="rounded-[20px] bg-card p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
              <Activity className="size-4" />
              Extraction Methods
            </h3>
            <div className="flex flex-wrap gap-3">
              {overview.extractionMethodStats.map((stat) => (
                <div key={stat.method} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                  <span className="text-xs capitalize text-foreground">{stat.method.replace(/_/g, " ")}</span>
                  <span className="text-xs font-medium text-muted-foreground">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-[20px] bg-card p-8 shadow-card text-center">
            <GitBranch className="size-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Merge Suggestions</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              All entities appear to be distinct. Merge suggestions appear when multiple entities
              share the same canonical name, overlapping aliases, or share evidence chunks across documents.
            </p>
          </div>
        ) : (
          <>
            {/* Suggestions summary */}
            <div className="rounded-[20px] bg-card p-4 shadow-card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-500" />
                <span className="text-sm text-foreground">
                  {suggestions.length} merge suggestion{suggestions.length !== 1 ? "s" : ""} found
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Review and merge duplicates below</span>
            </div>

            {/* Merge suggestions */}
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={`${suggestion.entity.id}-${suggestion.duplicate.id}`}
                  className="rounded-[20px] bg-card p-5 shadow-card"
                >
                  {/* Comparison header */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Entity A (keep) */}
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Keep</span>
                        <span className="text-[10px] text-muted-foreground">
                          {(suggestion.score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <Link
                        href={`/hive-mind/graph/entities/${suggestion.entity.id}`}
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary hover:underline mb-2"
                      >
                        <Brain className="size-4" />
                        {suggestion.entity.name}
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Link>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          {suggestion.entity.entityType}
                        </span>
                        {suggestion.entity.confidence !== undefined && suggestion.entity.confidence !== null && (
                          <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                            {(suggestion.entity.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                        <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          {suggestion.entity.mentionCount} mention{suggestion.entity.mentionCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {suggestion.entity.aliases && suggestion.entity.aliases.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.entity.aliases.map((alias) => (
                            <span key={alias} className="text-[10px] rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700">
                              {alias}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Entity B (duplicate) */}
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Duplicate</span>
                        <span className="text-[10px] text-muted-foreground">
                          {suggestion.reasons.join(", ")}
                        </span>
                      </div>
                      <Link
                        href={`/hive-mind/graph/entities/${suggestion.duplicate.id}`}
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary hover:underline mb-2"
                      >
                        <Brain className="size-4" />
                        {suggestion.duplicate.name}
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Link>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          {suggestion.duplicate.entityType}
                        </span>
                        {suggestion.duplicate.confidence !== undefined && suggestion.duplicate.confidence !== null && (
                          <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                            {(suggestion.duplicate.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                        <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          {suggestion.duplicate.mentionCount} mention{suggestion.duplicate.mentionCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {suggestion.duplicate.aliases && suggestion.duplicate.aliases.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.duplicate.aliases.map((alias) => (
                            <span key={alias} className="text-[10px] rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700">
                              {alias}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shared documents */}
                  {suggestion.sharedDocuments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                        <FileText className="size-3" />
                        Shared evidence ({suggestion.sharedDocuments.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestion.sharedDocuments.map((doc) => (
                          <Link
                            key={doc.id}
                            href={`/hive-mind/graph/documents/${doc.id}`}
                            className="text-[11px] rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                          >
                            {doc.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                    <button
                      onClick={() => handleMerge(suggestion.entity.id, suggestion.duplicate.id)}
                      disabled={merging === suggestion.duplicate.id}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      {merging === suggestion.duplicate.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3" />
                      )}
                      Merge into Keep
                    </button>
                    <button
                      onClick={() => handleIgnore(suggestion.entity.id, suggestion.duplicate.id)}
                      disabled={merging !== null}
                      className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      <X className="size-3" />
                      Ignore
                    </button>
                    <button
                      onClick={() => handlePreview(suggestion.entity.id, suggestion.duplicate.id)}
                      disabled={previewLoading}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-500/20 transition-colors disabled:opacity-50 ml-auto"
                    >
                      <Search className="size-3" />
                      Preview
                    </button>
                  </div>

                  {/* Preview result */}
                  {previewData && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="rounded-lg bg-muted p-3 text-xs space-y-1">
                        <p className="text-foreground font-medium">Merge Preview</p>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <span>Incoming rels: {previewData.incomingRelsCount}</span>
                          <span>Outgoing rels: {previewData.outgoingRelsCount}</span>
                          <span>Doc mentions: {previewData.docMentionsCount}</span>
                          <span>Chunk mentions: {previewData.chunkMentionsCount}</span>
                          <span className={cn(previewData.crossProject ? "text-red-500" : "text-emerald-500")}>
                            Cross-project: {previewData.crossProject ? "Yes" : "No"}
                          </span>
                          <span>New aliases: {previewData.mergedAliases.length}</span>
                        </div>
                        {previewData.warning && (
                          <p className="text-amber-600 mt-1">{previewData.warning}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Merge History */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-foreground w-full"
          >
            <History className="size-4" />
            Merge History
            <span className="text-xs text-muted-foreground ml-auto">
              {mergeHistory.length} merge{mergeHistory.length !== 1 ? "s" : ""}
            </span>
          </button>

          {showHistory && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {historyLoading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground mx-auto" />
              ) : mergeHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No merge history</p>
              ) : (
                mergeHistory.map((entry) => (
                  <div key={entry.entityId} className="rounded-lg bg-muted p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Link href={`/hive-mind/graph/entities/${entry.entityId}`} className="text-foreground hover:underline font-medium">
                        {entry.entityName}
                      </Link>
                      <ArrowLeft className="size-3 text-muted-foreground" />
                      <Link href={`/hive-mind/graph/entities/${entry.mergedIntoId}`} className="text-primary hover:underline">
                        {entry.mergedIntoName}
                      </Link>
                      <span className="text-muted-foreground">— {entry.mergedAt ? new Date(entry.mergedAt).toLocaleDateString() : "unknown date"}</span>
                    </div>
                    <button
                      onClick={() => handleRevertMerge(entry.entityId)}
                      className="text-[10px] text-amber-600 hover:text-amber-700 hover:underline"
                    >
                      Revert
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Graph Rebuild Controls */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <button
            onClick={() => setShowRebuild(!showRebuild)}
            className="flex items-center gap-2 text-sm font-medium text-foreground w-full"
          >
            {showRebuild ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            Graph Rebuild Controls
            <span className="text-[11px] rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 ml-auto">
              Admin
            </span>
          </button>

          {showRebuild && (
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  These operations trigger graph reindexing and may temporarily impact query performance.
                  Use dry-run mode first to preview the impact.
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="rounded"
                  />
                  Dry run
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearFirst}
                    onChange={(e) => setClearFirst(e.target.checked)}
                    className="rounded"
                  />
                  Clear existing graph first
                </label>
              </div>

              {/* Reindex document */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={rebuildDocId}
                  onChange={(e) => setRebuildDocId(e.target.value)}
                  placeholder="Document ID"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleRebuildDocument}
                  disabled={rebuildLoading || !rebuildDocId.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {rebuildLoading ? <Loader2 className="size-3 animate-spin" /> : <Activity className="size-3" />}
                  Reindex Document
                </button>
              </div>

              {/* Reindex tenant */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-1">
                  Reindex {selectedProject ? "project" : "tenant"} graph
                </span>
                <button
                  onClick={handleRebuildTenant}
                  disabled={rebuildLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {rebuildLoading ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                  Reindex {selectedProject ? "Project" : "Tenant"}
                </button>
              </div>

              {/* Rebuild result */}
              {rebuildResult && (
                <div
                  className={cn(
                    "rounded-lg p-3 text-xs",
                    rebuildResult.enqueued
                      ? "bg-emerald-500/10 text-emerald-600"
                      : rebuildResult.dryRun
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-red-500/10 text-red-600",
                  )}
                >
                  <p>{rebuildResult.details}</p>
                  {rebuildResult.jobId && (
                    <Link
                      href={`/hive-mind/jobs/${rebuildResult.jobId}`}
                      className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View job <ExternalLink className="size-3" />
                    </Link>
                  )}
                  {rebuildResult.affectedDocuments !== undefined && (
                    <p className="mt-1 text-muted-foreground">
                      {rebuildResult.affectedDocuments} document{rebuildResult.affectedDocuments !== 1 ? "s" : ""} affected
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Backfill Controls */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <button
            onClick={() => setShowBackfill(!showBackfill)}
            className="flex items-center gap-2 text-sm font-medium text-foreground w-full"
          >
            {showBackfill ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            Graph Backfill
            <span className="text-[11px] rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 ml-auto">
              Admin
            </span>
          </button>

          {showBackfill && (
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Enqueue graph indexing for documents. Use dry-run mode to preview the impact.
                </p>
              </div>

              {/* Scope selector */}
              <div className="flex flex-wrap gap-2">
                {(["tenant", "project", "document", "failed"] as const).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setBackfillScope(scope)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      backfillScope === scope
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {scope.charAt(0).toUpperCase() + scope.slice(1)}
                    {scope === "failed" && " Jobs"}
                  </button>
                ))}
              </div>

              {backfillScope === "document" && (
                <input
                  type="text"
                  value={backfillDocId}
                  onChange={(e) => setBackfillDocId(e.target.value)}
                  placeholder="Document ID"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backfillDryRun}
                    onChange={(e) => setBackfillDryRun(e.target.checked)}
                    className="rounded"
                  />
                  Dry run
                </label>
                <button
                  onClick={handleBackfill}
                  disabled={backfillLoading || (backfillScope === "document" && !backfillDocId.trim())}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 ml-auto"
                >
                  {backfillLoading ? <Loader2 className="size-3 animate-spin" /> : <Activity className="size-3" />}
                  {backfillDryRun ? "Preview" : "Run Backfill"}
                </button>
              </div>

              {/* Backfill result */}
              {backfillResult && (
                <div className="rounded-lg bg-muted p-3 space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600 font-medium">Queued: {backfillResult.queuedCount}</span>
                    <span className="text-muted-foreground">Skipped: {backfillResult.skippedCount}</span>
                    {backfillResult.failedCount > 0 && (
                      <span className="text-red-500">Failed: {backfillResult.failedCount}</span>
                    )}
                    {backfillResult.dryRun && (
                      <span className="text-blue-500">(dry run)</span>
                    )}
                  </div>
                  {backfillResult.items.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {backfillResult.items.slice(0, 50).map((item) => (
                        <div
                          key={item.documentId}
                          className={cn(
                            "flex items-center justify-between rounded px-2 py-1 text-[10px]",
                            item.status === "queued" ? "bg-emerald-500/10" :
                            item.status === "skipped" ? "bg-muted" : "bg-red-500/10",
                          )}
                        >
                          <span className="text-muted-foreground truncate max-w-[200px]">{item.documentId}</span>
                          <span className={cn(
                            "font-medium",
                            item.status === "queued" ? "text-emerald-600" :
                            item.status === "skipped" ? "text-muted-foreground" : "text-red-500",
                          )}>
                            {item.status}{item.reason ? `: ${item.reason}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
