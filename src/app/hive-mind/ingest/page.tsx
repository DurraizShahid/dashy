"use client";

import { useState } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import { Globe, Loader2, CheckCircle, XCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

function IngestForm() {
  const { client, selectedTenantId, selectedProjectId, selectedTenant, selectedProject } = useHiveMind();

  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: "success" | "error";
    message: string;
    jobId?: string;
    documentId?: string;
  } | null>(null);

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !selectedTenantId) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await client!.ingestUrl(trimmedUrl, {
        source: source.trim() || undefined,
        tenantId: selectedTenantId,
        projectId: selectedProjectId ?? undefined,
      });
      setResult({
        status: "success",
        message: "Content ingestion started",
        jobId: response.jobId,
        documentId: response.documentId,
      });
      setUrl("");
      setSource("");
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        setResult({
          status: "error",
          message: `API error ${err.status}: ${err.statusText}`,
        });
      } else if (err instanceof HiveMindNetworkError) {
        setResult({ status: "error", message: err.message });
      } else {
        setResult({
          status: "error",
          message: err instanceof Error ? err.message : "Ingestion failed",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  if (!selectedTenantId) {
    return (
      <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
        <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Select an organization to ingest content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scope indicator */}
      <div className="rounded-[20px] bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          Ingesting into{" "}
          <span className="font-medium text-foreground">{selectedTenant?.name}</span>
          {selectedProject && (
            <>
              {" / "}
              <span className="font-medium text-foreground">{selectedProject.name}</span>
            </>
          )}
        </p>
      </div>

      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <h3 className="font-poppins font-semibold text-foreground mb-1">
          Ingest URL
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Submit a URL to be crawled and indexed into the Hive Mind knowledge base.
        </p>

        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <label htmlFor="ingest-url" className="text-xs font-medium text-foreground mb-1 block">
              URL
            </label>
            <input
              id="ingest-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/document"
              required
              className={cn(
                "h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
          </div>

          <div>
            <label htmlFor="ingest-source" className="text-xs font-medium text-foreground mb-1 block">
              Source label (optional)
            </label>
            <input
              id="ingest-source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., documentation, blog, competitor"
              className={cn(
                "h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Ingesting...
              </>
            ) : (
              <>
                <Globe className="size-4" />
                Ingest URL
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div
          className={cn(
            "rounded-[20px] p-4",
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
            <div>
              <p className="text-sm font-medium text-foreground">
                {result.message}
              </p>
              {result.jobId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Job:{" "}
                  <Link
                    href={`/hive-mind/jobs/${result.jobId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {result.jobId.slice(0, 8)}...
                  </Link>
                </p>
              )}
              {result.documentId && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Document:{" "}
                  <Link
                    href={`/hive-mind/documents/${result.documentId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {result.documentId.slice(0, 8)}...
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HiveMindIngestPage() {
  return (
    <>
      <CRMTopbar
        title="Content Ingestion"
        subtitle="Add URLs and documents to the Hive Mind knowledge base"
      />

      <div className="px-6 pb-6 max-w-2xl">
        <IngestForm />
      </div>
    </>
  );
}
