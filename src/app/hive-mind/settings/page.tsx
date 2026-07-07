"use client";

import { CRMTopbar } from "@/components/crm/crm-topbar";
import { isHiveMindEnabled } from "@/lib/env";
import { isAuthEnabled } from "@/lib/auth/config";
import { Settings, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function ConfigRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string | undefined;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle className="size-4 text-green-600" />
        ) : (
          <XCircle className="size-4 text-muted-foreground" />
        )}
        <code className="text-xs text-muted-foreground max-w-[200px] truncate">
          {value || "(not set)"}
        </code>
      </div>
    </div>
  );
}

export default function HiveMindSettingsPage() {
  const hmEnabled = isHiveMindEnabled();
  const authEnabled = isAuthEnabled();

  const configItems = [
    {
      label: "Hive Mind API URL",
      value: process.env.NEXT_PUBLIC_HIVE_MIND_API_URL,
      ok: hmEnabled,
    },
    {
      label: "Keycloak URL",
      value: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      ok: !!process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    },
    {
      label: "Keycloak Realm",
      value: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      ok: !!process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    },
    {
      label: "Keycloak Client ID",
      value: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      ok: !!process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    },
  ];

  return (
    <>
      <CRMTopbar
        title="Hive Mind Settings"
        subtitle="Module configuration and environment status"
      />

      <div className="px-6 pb-6 max-w-2xl space-y-4">
        {/* Overall Status */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="size-5 text-foreground" />
            <h3 className="font-poppins font-semibold text-foreground">
              Configuration Status
            </h3>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "size-2.5 rounded-full",
                  hmEnabled ? "bg-green-600" : "bg-muted-foreground"
                )}
              />
              <span className="text-xs text-muted-foreground">
                Hive Mind: {hmEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "size-2.5 rounded-full",
                  authEnabled ? "bg-green-600" : "bg-muted-foreground"
                )}
              />
              <span className="text-xs text-muted-foreground">
                Auth: {authEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {configItems.map((item) => (
              <ConfigRow key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground mb-2">
            About
          </h3>
          <p className="text-sm text-muted-foreground">
            The Hive Mind module integrates with the Hive Mind backend API
            to provide knowledge management, content ingestion, service
            discovery, and agent context capabilities.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Protected endpoints require Keycloak authentication. Configure
            Keycloak environment variables to enable auth.
          </p>
        </div>
      </div>
    </>
  );
}
