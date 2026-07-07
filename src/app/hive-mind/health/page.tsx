"use client";

import { useEffect, useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { HealthStatus } from "@/components/hive-mind/health-status";
import { createClient } from "@/lib/hive-mind/client";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import { Loader2, XCircle, RefreshCw } from "lucide-react";
import type { VersionInfo } from "@/lib/hive-mind/types";

export default function HiveMindHealthPage() {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [loadingVersion, setLoadingVersion] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const client = createClient();
    let cancelled = false;

    client
      .getVersion()
      .then((data) => { if (!cancelled) setVersion(data); })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof HiveMindApiError) {
            setVersionError(`API error ${err.status}: ${err.statusText}`);
          } else if (err instanceof HiveMindNetworkError) {
            setVersionError(err.message);
          } else {
            setVersionError(err instanceof Error ? err.message : "Unknown error");
          }
        }
      })
      .finally(() => { if (!cancelled) setLoadingVersion(false); });

    return () => { cancelled = true; };
  }, [refreshKey]);

  function handleRefresh() {
    setLoadingVersion(true);
    setVersionError(null);
    setVersion(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <>
      <CRMTopbar
        title="System Health"
        subtitle="Detailed Hive Mind service health and version information"
      />

      <div className="px-6 pb-6 max-w-4xl space-y-6">
        {/* Version Info Card */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground mb-3">
            API Version
          </h3>
          {loadingVersion ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Fetching version info...</span>
            </div>
          ) : versionError ? (
            <div className="flex items-start gap-2">
              <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>{versionError}</p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
                >
                  <RefreshCw className="size-3.5" />
                  Retry
                </button>
              </div>
            </div>
          ) : version ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="text-sm font-medium text-foreground">
                  {version.service}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="text-sm font-medium text-foreground">
                  {version.version}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Node</p>
                <p className="text-sm font-medium text-foreground">
                  {version.nodeVersion}
                </p>
              </div>
              {version.commit && (
                <div>
                  <p className="text-xs text-muted-foreground">Commit</p>
                  <p className="text-sm font-mono text-foreground truncate">
                    {version.commit.slice(0, 10)}
                  </p>
                </div>
              )}
              {version.buildTime && (
                <div>
                  <p className="text-xs text-muted-foreground">Built</p>
                  <p className="text-sm text-foreground">
                    {new Date(version.buildTime).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Health Status */}
        <HealthStatus />
      </div>
    </>
  );
}
