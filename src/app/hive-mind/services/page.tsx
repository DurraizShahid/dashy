"use client";

import { useEffect, useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { AuthGate } from "@/components/auth/auth-gate";
import { createClient } from "@/lib/hive-mind/client";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import { Loader2, XCircle, RefreshCw, Globe, Wifi, WifiOff, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceRegistryEntry } from "@/lib/hive-mind/types";

function ServiceRegistryList() {
  const [services, setServices] = useState<ServiceRegistryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const client = createClient();
    let cancelled = false;

    client
      .getServiceRegistry()
      .then((data) => { if (!cancelled) setServices(data); })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof HiveMindApiError) {
            setError(`API error ${err.status}: ${err.statusText}`);
          } else if (err instanceof HiveMindNetworkError) {
            setError(err.message);
          } else {
            setError(err instanceof Error ? err.message : "Unknown error");
          }
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [refreshKey]);

  function handleRefresh() {
    setLoading(true);
    setError(null);
    setServices([]);
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="size-4 animate-spin" />
        <span>Loading service registry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <div className="flex items-start gap-3">
          <XCircle className="size-5 shrink-0 text-destructive mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
        <Globe className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No services registered yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-poppins font-semibold text-foreground">
          Registered Services ({services.length})
        </h3>
        <button
          onClick={handleRefresh}
          className="flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {svc.status === "registered" ? (
                <Wifi className="size-4 shrink-0 text-green-600" />
              ) : svc.status === "unreachable" ? (
                <WifiOff className="size-4 shrink-0 text-destructive" />
              ) : (
                <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {svc.name}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                  {svc.url}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="text-xs text-muted-foreground">
                {new Date(svc.lastSeen).toLocaleString()}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                  svc.status === "registered"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : svc.status === "unreachable"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                )}
              >
                {svc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HiveMindServicesPage() {
  return (
    <>
      <CRMTopbar
        title="Service Registry"
        subtitle="Discover and monitor registered Hive Mind services"
      />

      <div className="px-6 pb-6 max-w-3xl">
        <AuthGate
          title="Service Registry"
          description="Browse and monitor microservices registered with the Hive Mind service registry."
        >
          <ServiceRegistryList />
        </AuthGate>
      </div>
    </>
  );
}
