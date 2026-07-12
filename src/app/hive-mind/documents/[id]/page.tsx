"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { DocumentDetailResponse } from "@/lib/hive-mind/types";
import {
  Loader2,
  XCircle,
  ArrowLeft,
  FileText,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  indexed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const sensitivityStyles: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function HiveMindDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { client } = useHiveMind();
  const [doc, setDoc] = useState<DocumentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    client
      .getDocument(id)
      .then((data) => {
        if (!cancelled) setDoc(data);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof HiveMindApiError) {
            if (err.status === 404) setError("Document not found");
            else if (err.status === 403) setError("Access denied");
            else setError(`API error ${err.status}: ${err.statusText}`);
          } else if (err instanceof HiveMindNetworkError) {
            setError(err.message);
          } else {
            setError(err instanceof Error ? err.message : "Unknown error");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, id, refreshKey]);

  return (
    <>
      <CRMTopbar
        title={doc ? doc.title : "Document Detail"}
        subtitle={id ? `ID: ${id.slice(0, 8)}...` : "View document details"}
      />

      <div className="px-6 pb-6 max-w-3xl">
        <Link
          href="/hive-mind/documents"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Documents
        </Link>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading document...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[20px] bg-card p-6 shadow-card">
            <div className="flex items-start gap-3">
              <XCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setDoc(null);
                    setRefreshKey((k) => k + 1);
                  }}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
                >
                  <RefreshCw className="size-3.5" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {doc && !loading && (
          <div className="space-y-4">
            {/* Metadata */}
            <div className="rounded-[20px] bg-card p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-6 text-foreground" />
                  <div>
                    <h2 className="font-poppins font-semibold text-foreground">
                      {doc.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      ID: <code className="text-xs">{doc.id}</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      statusStyles[doc.status]
                    )}
                  >
                    {doc.status}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      sensitivityStyles[doc.sensitivityLevel ?? ""]
                    )}
                  >
                    {doc.sensitivityLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-foreground">{doc.source?.name ?? doc.sourceId ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-foreground">{doc.documentType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visibility</p>
                  <p className="text-foreground capitalize">{doc.visibilityScope ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chunks</p>
                  <p className="text-foreground">{doc.chunkCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-foreground">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-foreground">
                    {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
