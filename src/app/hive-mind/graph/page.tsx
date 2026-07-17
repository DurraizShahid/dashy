"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import type { GraphOverviewResponse } from "@/lib/hive-mind/types";
import { HiveMindApiError } from "@/lib/hive-mind/errors";
import {
  ChartNetwork,
  GitBranch,
  FileText,
  Brain,
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
  List,
  AlertCircle,
  BarChart3,
  Tags,
  Activity,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GraphOverviewPage() {
  const {
    client,
    selectedTenantId,
    selectedTenant,
    selectedProject,
  } = useHiveMind();

  const [overview, setOverview] = useState<GraphOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    if (!client || !selectedTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await client.getGraphOverview({
        tenantId: selectedTenantId,
        projectId: selectedProject?.id,
      });
      setOverview(data);
    } catch (e: unknown) {
      if (e instanceof HiveMindApiError && e.code === "SESSION_EXPIRED") {
        window.location.href = "/sign-in";
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load graph overview");
    } finally {
      setLoading(false);
    }
  }, [client, selectedTenantId, selectedProject]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview();
  }, [fetchOverview]);

  return (
    <>
      <CRMTopbar title="Graph Memory" subtitle="Knowledge graph overview" />

      <div className="px-6 pb-6 space-y-4">
        <div className="rounded-[20px] bg-muted/50 p-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <ChartNetwork className="size-3 inline mr-1" />
            Scope:{" "}
            <span className="font-medium text-foreground">
              {selectedTenant ? selectedTenant.name : "No organization selected"}
            </span>
            {selectedProject && (
              <span className="text-muted-foreground">
                {" / "}{selectedProject.name}
              </span>
            )}
          </p>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : !overview ? (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <ChartNetwork className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {selectedTenantId ? "No graph data available" : "Select an organization to view the graph"}
            </p>
          </div>
        ) : (
          <>
            {/* Warnings */}
            {overview.warnings && overview.warnings.length > 0 && (
              <div className="rounded-[20px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Warnings</p>
                    {overview.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <Brain className="size-5 text-primary" />
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{overview.entityCount}</p>
                    <p className="text-xs text-muted-foreground">Entities</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <GitBranch className="size-5 text-primary" />
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{overview.relationshipCount}</p>
                    <p className="text-xs text-muted-foreground">Relationships</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-primary" />
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{overview.documentNodeCount}</p>
                    <p className="text-xs text-muted-foreground">Document Nodes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Graph Health */}
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
                  <ChartNetwork className="size-4" />
                  Graph Health
                </h3>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-block size-2.5 rounded-full",
                    overview.graphHealth === "healthy" ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm capitalize text-foreground">{overview.graphHealth}</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
                  <List className="size-4" />
                  Quick Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/hive-mind/graph/entities"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Browse Entities
                  </Link>
                </div>
              </div>

            </div>

            {/* Graph Intelligence Breakdowns */}
            {overview.extractionMethodStats && overview.extractionMethodStats.length > 0 && (
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
                  <Activity className="size-4" />
                  Extraction Methods
                </h3>
                <div className="flex flex-col gap-2">
                  {overview.extractionMethodStats.map((stat) => (
                    <div key={stat.method} className="flex items-center justify-between">
                      <span className="text-sm text-foreground capitalize">{stat.method.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-muted-foreground">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overview.entityTypeCounts && overview.entityTypeCounts.length > 0 && (
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
                  <Tags className="size-4" />
                  Entity Types
                </h3>
                <div className="flex flex-col gap-2">
                  {overview.entityTypeCounts.map((stat) => (
                    <div key={stat.type} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-foreground">{stat.type}</span>
                      <span className="text-sm font-medium text-muted-foreground">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overview.relationshipTypeCounts && overview.relationshipTypeCounts.length > 0 && (
              <div className="rounded-[20px] bg-card p-5 shadow-card">
                <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
                  <BarChart3 className="size-4" />
                  Relationship Types
                </h3>
                <div className="flex flex-col gap-2">
                  {overview.relationshipTypeCounts.map((stat) => (
                    <div key={stat.type} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{stat.type}</span>
                      <span className="text-sm font-medium text-muted-foreground">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Entities */}
            <div className="rounded-[20px] bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2">
                  <Brain className="size-4" />
                  Top Entities
                </h3>
                <Link
                  href="/hive-mind/graph/entities"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="size-3" />
                </Link>
              </div>
              {overview.topEntities.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {overview.topEntities.map((entity) => (
                    <Link
                      key={entity.id}
                      href={`/hive-mind/graph/entities/${entity.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">{entity.name}</span>
                        <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          {entity.entityType}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entity.mentionCount} mentions
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No entities found</p>
              )}
            </div>

            {/* Recent Documents in Graph */}
            <div className="rounded-[20px] bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-poppins font-semibold text-foreground text-sm flex items-center gap-2">
                  <Clock className="size-4" />
                  Recently Indexed Documents
                </h3>
              </div>
              {(overview.recentGraphIndexedDocuments ?? overview.recentDocuments).length > 0 ? (
                <div className="flex flex-col gap-1">
                  {(overview.recentGraphIndexedDocuments ?? overview.recentDocuments).map((doc) => (
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
                <p className="text-xs text-muted-foreground">
                  {selectedTenantId ? "No documents in graph yet" : "Select an organization to view documents"}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
