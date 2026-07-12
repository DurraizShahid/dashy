"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { GraphEntityDetailResponse } from "@/lib/hive-mind/types";
import { HiveMindApiError } from "@/lib/hive-mind/errors";
import {
  Brain,
  GitBranch,
  FileText,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GraphEntityDetailPage() {
  const params = useParams<{ id: string }>();
  const { client, selectedTenantId, selectedProject } = useHiveMind();

  const [data, setData] = useState<GraphEntityDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntity = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await client.getGraphEntity(params.id, {
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
      });
      setData(result);
    } catch (e: unknown) {
      if (e instanceof HiveMindApiError && e.code === "SESSION_EXPIRED") {
        window.location.href = "/sign-in";
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load entity");
    } finally {
      setLoading(false);
    }
  }, [client, selectedTenantId, selectedProject, params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntity();
  }, [fetchEntity]);

  if (!selectedTenantId) {
    return (
      <>
        <CRMTopbar title="Entity" subtitle="No organization selected" />
        <div className="px-6 pb-6 flex items-center justify-center py-20">
          <div className="text-center">
            <Brain className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Select an organization to view entity details</p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <CRMTopbar title="Entity" subtitle="Loading..." />
        <div className="px-6 pb-6 flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CRMTopbar title="Entity Error" subtitle="Could not load entity details" />
        <div className="px-6 pb-6">
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!data || !data.entity) {
    return (
      <>
        <CRMTopbar title="Entity Not Found" subtitle="The requested entity could not be found" />
        <div className="px-6 pb-6">
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <Brain className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Entity not found</p>
            <Link
              href="/hive-mind/graph/entities"
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ArrowLeft className="size-3" /> Back to entities
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CRMTopbar title={data.entity.name} subtitle={`Entity · ${data.entity.entityType}`} />

      <div className="px-6 pb-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/hive-mind/graph/entities"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" /> Back to entities
          </Link>
          <button
            onClick={fetchEntity}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
        </div>

        {/* Entity Details */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="size-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">{data.entity.name}</h2>
              <p className="text-xs text-muted-foreground">{data.entity.entityType}</p>
            </div>
          </div>
          {data.entity.metadata && Object.keys(data.entity.metadata).length > 0 && (
            <div className="border-t border-border pt-3 mt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Metadata</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.entity.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-1">
                    <span className="text-xs text-muted-foreground">{key}:</span>
                    <span className="text-xs text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Entities */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
            <GitBranch className="size-4" />
            Related Entities ({data.relatedEntities.length})
          </h3>
          {data.relatedEntities.length > 0 ? (
            <div className="flex flex-col gap-1">
              {data.relatedEntities.map((rel, i) => (
                <Link
                  key={`${rel.id}-${i}`}
                  href={`/hive-mind/graph/entities/${rel.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{rel.name}</span>
                    <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {rel.entityType}
                    </span>
                  </div>
                  <span className="text-[11px] text-primary font-medium">{rel.relationship}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No related entities</p>
          )}
        </div>

        {/* Mentioned In Documents */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
            <FileText className="size-4" />
            Mentioned In Documents ({data.mentionedInDocuments.length})
          </h3>
          {data.mentionedInDocuments.length > 0 ? (
            <div className="flex flex-col gap-1">
              {data.mentionedInDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/hive-mind/graph/documents/${doc.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-foreground truncate">{doc.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not mentioned in any documents</p>
          )}
        </div>

        {/* Mentioned In Chunks */}
        <div className="rounded-[20px] bg-card p-5 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
            <Layers className="size-4" />
            Mentioned In Chunks ({data.mentionedInChunks.length})
          </h3>
          {data.mentionedInChunks.length > 0 ? (
            <div className="flex flex-col gap-1">
              {data.mentionedInChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                >
                  <Layers className="size-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Chunk {chunk.chunkIndex}
                  </span>
                  <Link
                    href={`/hive-mind/graph/documents/${chunk.documentId}`}
                    className="text-xs text-primary hover:underline ml-auto"
                  >
                    View document
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No chunk mentions</p>
          )}
        </div>
      </div>
    </>
  );
}
