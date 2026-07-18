"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { ResearchSourceMode } from "@/lib/hive-mind/types";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  BrainCircuit,
  Plus,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceModeSelector } from "@/components/hive-mind/source-mode-selector";

const MAX_URLS = 20;

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function NewResearchPage() {
  const { client, selectedTenantId, selectedProjectId, tenants, projects } = useHiveMind();

  const [query, setQuery] = useState("");
  const [sourceMode, setSourceMode] = useState<ResearchSourceMode>("auto");
  const [maxSources, setMaxSources] = useState(10);
  const [manualUrls, setManualUrls] = useState<string[]>([""]);
  const [urlErrors, setUrlErrors] = useState<boolean[]>([false]);
  const [tenantOverride, setTenantOverride] = useState(selectedTenantId ?? "");
  const [projectOverride, setProjectOverride] = useState(selectedProjectId ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: "success" | "error"; message: string; runId?: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (result?.status !== "success") return;
    const timer = setTimeout(() => setResult(null), 10000);
    return () => clearTimeout(timer);
  }, [result]);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof HiveMindApiError) {
      setResult({ status: "error", message: `API error ${err.status}: ${err.statusText}` });
    } else if (err instanceof HiveMindNetworkError) {
      setResult({ status: "error", message: err.message });
    } else {
      setResult({ status: "error", message: err instanceof Error ? err.message : "Failed to create research run" });
    }
  }, []);

  function addUrlField() {
    if (manualUrls.length >= MAX_URLS) return;
    setManualUrls((prev) => [...prev, ""]);
    setUrlErrors((prev) => [...prev, false]);
  }

  function removeUrlField(index: number) {
    if (manualUrls.length <= 1) return;
    setManualUrls((prev) => prev.filter((_, i) => i !== index));
    setUrlErrors((prev) => prev.filter((_, i) => i !== index));
  }

  function updateUrl(index: number, value: string) {
    setManualUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function handleUrlBlur(index: number) {
    setUrlErrors((prev) => prev.map((e, i) => (i === index ? !isValidUrl(manualUrls[index]) : e)));
  }

  const nonEmptyUrls = manualUrls.filter((u) => u.trim().length > 0);
  const filledUrlCount = nonEmptyUrls.length;
  const hasInvalidUrls = sourceMode !== "auto" && manualUrls.some((u) => u.trim() && !isValidUrl(u));
  const hasManualUrls = sourceMode === "auto" || filledUrlCount > 0;
  const canSubmit = !!query.trim() && !!tenantOverride && !loading && hasManualUrls && !hasInvalidUrls;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const newErrors = manualUrls.map((u) => (u.trim() ? !isValidUrl(u) : false));
    setUrlErrors(newErrors);
    if (newErrors.some(Boolean)) return;

    setLoading(true);
    setResult(null);
    try {
      const filteredUrls = manualUrls.map((u) => u.trim()).filter(Boolean);
      const res = await client!.createResearchRun({
        query: query.trim(),
        sourceMode,
        tenantId: tenantOverride,
        projectId: projectOverride || undefined,
        maxSources,
        urls: filteredUrls.length > 0 ? filteredUrls : undefined,
      });
      setResult({ status: "success", message: "Research run created", runId: res.id });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CRMTopbar
        title="New Research"
        subtitle="Create an automated research run"
      />

      <div className="space-y-4">
        <Link
          href="/hive-mind/research"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Research
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Query */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-foreground mb-1">
              Research Query
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              What do you want to research? Be specific to get better results.
            </p>
            <div>
              <label htmlFor="research-query" className="text-xs font-medium text-foreground mb-1 block">
                Query
              </label>
              <textarea
                id="research-query"
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

          {/* Source Mode */}
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

            {/* Manual URLs */}
            {(sourceMode === "manual" || sourceMode === "hybrid") && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Manual URLs
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {filledUrlCount} of {MAX_URLS} sources added
                    </span>
                    <button
                      type="button"
                      onClick={addUrlField}
                      disabled={manualUrls.length >= MAX_URLS}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Plus className="size-3" />
                      Add URL
                    </button>
                  </div>
                </div>
                {manualUrls.map((url, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateUrl(i, e.target.value)}
                        onBlur={() => handleUrlBlur(i)}
                        placeholder="https://example.com/article"
                        className={cn(
                          "flex-1 h-10 rounded-[12px] bg-muted border border-input px-3 text-sm transition-colors outline-none",
                          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                          urlErrors[i] && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50"
                        )}
                      />
                      {manualUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrlField(i)}
                          aria-label="Remove URL"
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    {urlErrors[i] && (
                      <p className="text-xs text-destructive mt-1">
                        Please enter a valid URL
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Settings (Scope) */}
          <div className="rounded-[20px] bg-card p-5 shadow-card">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-poppins font-semibold text-foreground">
                Advanced Settings
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  showAdvanced && "rotate-180"
                )}
              />
            </button>
            {showAdvanced && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-4">
                  Select the organization and project context for this research.
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
                  <BrainCircuit className="size-4" />
                  Start Research
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div
            className={cn(
              "rounded-[20px] p-4 bg-card shadow-card border",
              result.status === "success"
                ? "border-green-500/20"
                : "border-red-500/20"
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
                {result.runId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Run:{" "}
                    <Link
                      href={`/hive-mind/research/${result.runId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {result.runId.slice(0, 8)}...
                    </Link>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                aria-label="Dismiss"
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
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
