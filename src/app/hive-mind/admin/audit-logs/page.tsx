"use client";

import { useState, useEffect, useCallback } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { AuditLogEntry } from "@/lib/hive-mind/types";
import {
  Loader2,
  XCircle,
  ScrollText,
  ArrowRight,
} from "lucide-react";

export default function HiveMindAuditLogsPage() {
  const { client, selectedTenantId, selectedTenant } = useHiveMind();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const fetchLogs = useCallback(
    async (cursor?: string) => {
      if (!client) return;
      setLoading(true);
      setError(null);
      try {
        const res = await client.listAuditLogs({
          tenantId: selectedTenantId ?? undefined,
          cursor,
        });
        if (cursor) {
          setLogs((prev) => [...prev, ...res.auditLogs]);
        } else {
          setLogs(res.auditLogs);
        }
        setNextCursor(res.nextCursor ?? undefined);
      } catch (err) {
        if (err instanceof HiveMindApiError) {
          if (err.status === 403) setError("You do not have permission to view audit logs.");
          else setError(`API error ${err.status}: ${err.statusText}`);
        } else if (err instanceof HiveMindNetworkError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load audit logs");
        }
        if (!cursor) setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [client, selectedTenantId]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  return (
    <>
      <CRMTopbar
        title="Audit Logs"
        subtitle={
          selectedTenant
            ? `Audit trail for ${selectedTenant.name}`
            : "System-wide audit trail"
        }
      />

      <div className="px-6 pb-6 max-w-4xl space-y-4">
        {loading && logs.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading audit logs...
          </div>
        )}

        {error && (
          <div className="rounded-[20px] bg-card p-4 shadow-card">
            <div className="flex items-start gap-2">
              <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <ScrollText className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {selectedTenantId
                ? "No audit log entries yet."
                : "Select an organization to view audit logs."}
            </p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="flex flex-col gap-2">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl bg-card p-4 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                      <span className="text-xs font-medium text-foreground">
                        {entry.action}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {entry.resourceType}
                      </span>
                      <code className="text-[11px] text-muted-foreground">
                        {(entry.resourceId ?? "").slice(0, 8)}
                      </code>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 ml-3">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span>Actor: {entry.actorType}</span>
                  {entry.tenantId && <span>Tenant: {entry.tenantId.slice(0, 8)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {nextCursor && (
          <div className="text-center">
            <button
              onClick={() => fetchLogs(nextCursor)}
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
