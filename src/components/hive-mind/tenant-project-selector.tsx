"use client";

import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { RefreshCw, Loader2, Building2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function TenantProjectSelector() {
  const {
    tenants,
    selectedTenantId,
    setSelectedTenantId,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    loading,
    error,
    refreshTenants,
    selectedTenant,
  } = useHiveMind();

  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Loading organizations...
      </div>
    );
  }

  if (error && tenants.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive">
        <span>{error}</span>
        <button onClick={refreshTenants} className="underline hover:no-underline">
          retry
        </button>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Building2 className="size-3" />
        No organization memberships
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Tenant selector */}
      <div className="flex items-center gap-1.5">
        <Building2 className="size-3.5 text-muted-foreground shrink-0" />
        <select
          value={selectedTenantId ?? ""}
          onChange={(e) => setSelectedTenantId(e.target.value || null)}
          className={cn(
            "h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
            "text-foreground"
          )}
          aria-label="Select organization"
        >
          {tenants.length > 1 && (
            <option value="">Select organization...</option>
          )}
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project selector */}
      {selectedTenant && (
        <div className="flex items-center gap-1.5">
          <FolderOpen className="size-3.5 text-muted-foreground shrink-0" />
          <select
            value={selectedProjectId ?? ""}
            onChange={(e) => setSelectedProjectId(e.target.value || null)}
            className={cn(
              "h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
              "text-foreground"
            )}
            aria-label="Select project"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Refresh */}
      <button
        onClick={refreshTenants}
        className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Refresh organizations"
        disabled={loading}
      >
        <RefreshCw className={cn("size-3", loading && "animate-spin")} />
      </button>
    </div>
  );
}
