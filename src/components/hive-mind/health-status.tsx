"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useHiveMindClient } from "@/lib/hive-mind/provider";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import { cn } from "@/lib/utils";
import type { HealthCheckResponse } from "@/lib/hive-mind/types";

type ConnectionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: HealthCheckResponse };

interface HealthStatusProps {
  className?: string;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof HiveMindApiError) {
    return `API error ${err.status}: ${err.statusText}`;
  }
  if (err instanceof HiveMindNetworkError) {
    return err.message;
  }
  return err instanceof Error ? err.message : "Unknown error";
}

export function HealthStatus({ className }: HealthStatusProps) {
  const { client, isReady } = useHiveMindClient();
  const [state, setState] = useState<ConnectionState>({ status: "loading" });

  useEffect(() => {
    if (!client || !isReady) return;

    let cancelled = false;

    client
      .getHealth()
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ status: "error", message: getErrorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, isReady]);

  // Early return after all hooks for no-client state
  if (!client) {
    return (
      <div className={cn("rounded-[20px] bg-card p-6 shadow-card", className)}>
        <div className="flex items-start gap-3">
          <XCircle className="size-6 shrink-0 text-destructive mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-semibold text-foreground">
              Not Available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hive Mind client not available — is the API URL configured?
            </p>
          </div>
        </div>
      </div>
    );
  }

  function handleRetry() {
    setState({ status: "loading" });
    if (client) {
      client
        .getHealth()
        .then((data) => setState({ status: "success", data }))
        .catch((err) => setState({ status: "error", message: getErrorMessage(err) }));
    }
  }

  // ─── Loading ────────────────────────────────────────────────

  if (state.status === "loading") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-muted-foreground text-sm",
          className
        )}
      >
        <Loader2 className="size-4 animate-spin" />
        <span>Connecting to Hive Mind...</span>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────

  if (state.status === "error") {
    return (
      <div className={cn("rounded-[20px] bg-card p-6 shadow-card", className)}>
        <div className="flex items-start gap-3">
          <XCircle className="size-6 shrink-0 text-destructive mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-semibold text-foreground">
              Connection Failed
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {state.message}
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary hover:underline"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success ────────────────────────────────────────────────

  const { data } = state;
  const healthyCount = data.services.filter(
    (s) => s.status === "healthy"
  ).length;
  const degradedCount = data.services.filter(
    (s) => s.status === "degraded"
  ).length;
  const unhealthyCount = data.services.filter(
    (s) => s.status === "unhealthy"
  ).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Status */}
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.status === "healthy" ? (
              <CheckCircle className="size-6 text-green-600" />
            ) : data.status === "degraded" ? (
              <AlertTriangle className="size-6 text-amber-500" />
            ) : (
              <XCircle className="size-6 text-destructive" />
            )}
            <div>
              <h2 className="font-poppins font-semibold text-foreground">
                System Status
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {data.status}
              </p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-green-600" />
            <span className="text-xs text-muted-foreground">
              {healthyCount} healthy
            </span>
          </div>
          {degradedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">
                {degradedCount} degraded
              </span>
            </div>
          )}
          {unhealthyCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">
                {unhealthyCount} unhealthy
              </span>
            </div>
          )}
        </div>

        {data.uptime > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Uptime: {Math.floor(data.uptime / 3600)}h{" "}
            {Math.floor((data.uptime % 3600) / 60)}m
          </p>
        )}
      </div>

      {/* Service List */}
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <h3 className="font-poppins font-semibold text-foreground mb-4">
          Services ({data.services.length})
        </h3>
        <div className="flex flex-col gap-2">
          {data.services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {service.status === "healthy" ? (
                  <CheckCircle className="size-4 shrink-0 text-green-600" />
                ) : service.status === "degraded" ? (
                  <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                ) : (
                  <XCircle className="size-4 shrink-0 text-destructive" />
                )}
                <span className="text-sm font-medium text-foreground truncate">
                  {service.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                {service.latency !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {service.latency}ms
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                    service.status === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : service.status === "degraded"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
