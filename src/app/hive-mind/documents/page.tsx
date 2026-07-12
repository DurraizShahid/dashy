"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { HiveMindDocument } from "@/lib/hive-mind/types";
import {
  Loader2,
  XCircle,
  FolderArchive,
  FileText,
  ArrowRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ingesting: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  processing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  indexed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const sensitivityStyles: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function HiveMindDocumentsPage() {
  const {
    client,
    selectedTenantId,
    selectedProjectId,
    selectedTenant,
  } = useHiveMind();

  const [documents, setDocuments] = useState<HiveMindDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const fetchDocuments = useCallback(
    async (cursor?: string) => {
      if (!client || !selectedTenantId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await client.listDocuments({
          tenantId: selectedTenantId,
          projectId: selectedProjectId ?? undefined,
          status: statusFilter || undefined,
          cursor,
        });
        if (cursor) {
          setDocuments((prev) => [...prev, ...res.documents]);
        } else {
          setDocuments(res.documents);
        }
        setNextCursor(res.nextCursor ?? undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load documents");
        if (!cursor) setDocuments([]);
      } finally {
        setLoading(false);
      }
    },
    [client, selectedTenantId, selectedProjectId, statusFilter]
  );

  useEffect(() => {
    if (selectedTenantId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDocuments();
    }
  }, [fetchDocuments, selectedTenantId]);

  return (
    <>
      <CRMTopbar
        title="Documents"
        subtitle={selectedTenant ? `Documents in ${selectedTenant.name}` : "Browse indexed documents"}
      />

      <div className="px-6 pb-6 max-w-4xl space-y-4">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 text-foreground"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="ingesting">Ingesting</option>
            <option value="processing">Processing</option>
            <option value="indexed">Indexed</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={() => fetchDocuments()}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
        </div>

        {/* Loading */}
        {loading && documents.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading documents...
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

        {/* No tenant selected */}
        {!selectedTenantId && !loading && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <FolderArchive className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an organization to view documents.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && selectedTenantId && documents.length === 0 && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <FileText className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No documents found. Ingest some content to get started.
            </p>
            <Link
              href="/hive-mind/ingest"
              className="inline-flex items-center gap-2 mt-3 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ingest Content
            </Link>
          </div>
        )}

        {/* Document list */}
        {documents.length > 0 && (
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/hive-mind/documents/${doc.id}`}
                className="rounded-xl bg-card p-4 shadow-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {doc.sourceId && (
                          <span className="text-[11px] text-muted-foreground">
                            {doc.sourceId.slice(0, 8)}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          &middot; {doc.documentType}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          &middot; {doc.chunkCount} chunks
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          &middot; {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {doc.sensitivityLevel && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          sensitivityStyles[doc.sensitivityLevel]
                        )}
                      >
                        {doc.sensitivityLevel}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                        statusStyles[doc.status]
                      )}
                    >
                      {doc.status}
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load more */}
        {nextCursor && (
          <div className="text-center">
            <button
              onClick={() => fetchDocuments(nextCursor)}
              disabled={loading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium border border-input text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
