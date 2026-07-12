"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { GraphDocumentDetailResponse } from "@/lib/hive-mind/types";
import {
  FileText,
  Brain,
  Layers,
  GitBranch,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GraphDocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const { client, selectedTenantId } = useHiveMind();

  const [data, setData] = useState<GraphDocumentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await client.getDocumentGraph(params.id, {
        tenantId: selectedTenantId,
      });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load document graph");
    } finally {
      setLoading(false);
    }
  }, [client, selectedTenantId, params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocument();
  }, [fetchDocument]);

  if (loading) {
    return (
      <>
        <CRMTopbar title="Document Graph" subtitle="Loading..." />
        <div className="px-6 pb-6 flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CRMTopbar title="Document Graph Error" subtitle="Could not load document graph" />
        <div className="px-6 pb-6">
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!data || !data.document) {
    return (
      <>
        <CRMTopbar title="Document Not Found" subtitle="The requested document could not be found" />
        <div className="px-6 pb-6">
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <FileText className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Document not found</p>
            <Link
              href="/hive-mind/documents"
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ArrowLeft className="size-3" /> Back to documents
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CRMTopbar title={data.document.title} subtitle="Document Graph View" />

      <div className="px-6 pb-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/hive-mind/documents"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" /> Back to documents
          </Link>
          <button
            onClick={fetchDocument}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
        </div>

        {/* Entities in this document */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
            <Brain className="size-4" />
            Entities ({data.entities.length})
          </h3>
          {data.entities.length > 0 ? (
            <div className="flex flex-col gap-1">
              {data.entities.map((entity) => (
                <Link
                  key={entity.id}
                  href={`/hive-mind/graph/entities/${entity.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <Brain className="size-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{entity.name}</span>
                  <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {entity.entityType}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No entities extracted from this document</p>
          )}
        </div>

        {/* Chunks */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
            <Layers className="size-4" />
            Chunks ({data.chunks.length})
          </h3>
          {data.chunks.length > 0 ? (
            <div className="flex flex-col gap-1">
              {data.chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                >
                  <Layers className="size-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">Chunk {chunk.chunkIndex}</span>
                  <span className="text-[11px] text-muted-foreground">({chunk.id})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No chunks available</p>
          )}
        </div>

        {/* Relationships */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
            <GitBranch className="size-4" />
            Relationships ({data.relationships.length})
          </h3>
          {data.relationships.length > 0 ? (
            <div className="flex flex-col gap-1">
              {data.relationships.map((rel, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <Link
                    href={`/hive-mind/graph/entities/${rel.fromId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {rel.fromType}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    —[{rel.relationship}]—
                  </span>
                  <Link
                    href={`/hive-mind/graph/entities/${rel.toId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {rel.toType}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No relationships</p>
          )}
        </div>
      </div>
    </>
  );
}
