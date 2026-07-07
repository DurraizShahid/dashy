"use client";

import { useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { isHiveMindEnabled } from "@/lib/env";
import { isAuthEnabled } from "@/lib/auth/config";
import { useTenantProject } from "@/lib/hive-mind/hive-mind-context";
import {
  Settings,
  CheckCircle,
  XCircle,
  Building2,
  FolderKanban,
  Info,
} from "lucide-react";
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
  const {
    tenantId,
    projectId,
    tenantName,
    projectName,
    setTenant,
    setProject,
    resetContext,
  } = useTenantProject();

  const [tenantInput, setTenantInput] = useState(tenantId);
  const [tenantNameInput, setTenantNameInput] = useState(tenantName);
  const [projectInput, setProjectInput] = useState(projectId);
  const [projectNameInput, setProjectNameInput] = useState(projectName);

  const configItems = [
    {
      label: "Hive Mind API URL",
      value: process.env.NEXT_PUBLIC_HIVEMIND_API_URL,
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

  function handleSaveTenant() {
    setTenant(tenantInput, tenantNameInput || undefined);
  }

  function handleSaveProject() {
    setProject(projectInput, projectNameInput || undefined);
  }

  return (
    <>
      <CRMTopbar
        title="Hive Mind Settings"
        subtitle="Module configuration, context, and environment status"
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

        {/* Tenant / Project Context */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Info className="size-5 text-foreground" />
            <h3 className="font-poppins font-semibold text-foreground">
              Organization / Project Context
            </h3>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Set your active tenant (organization) and project for API calls.
            Since the backend does not yet provide list endpoints, enter IDs
            manually. This is a client-side preference only.
          </p>

          {/* Tenant */}
          <div className="mb-4">
            <label className="text-xs font-medium text-foreground mb-2 block flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              Tenant
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tenantInput}
                onChange={(e) => setTenantInput(e.target.value)}
                placeholder="Tenant ID"
                className={cn(
                  "flex-1 h-9 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              />
              <input
                type="text"
                value={tenantNameInput}
                onChange={(e) => setTenantNameInput(e.target.value)}
                placeholder="Tenant name (optional)"
                className={cn(
                  "flex-1 h-9 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              />
              <button
                onClick={handleSaveTenant}
                className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
              >
                Set
              </button>
            </div>
            {tenantId && (
              <p className="text-xs text-green-600 mt-1">
                Active tenant: {tenantName || tenantId}
              </p>
            )}
          </div>

          {/* Project */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block flex items-center gap-1.5">
              <FolderKanban className="size-3.5" />
              Project
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                placeholder="Project ID"
                className={cn(
                  "flex-1 h-9 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              />
              <input
                type="text"
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value)}
                placeholder="Project name (optional)"
                className={cn(
                  "flex-1 h-9 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              />
              <button
                onClick={handleSaveProject}
                className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
              >
                Set
              </button>
            </div>
            {projectId && (
              <p className="text-xs text-green-600 mt-1">
                Active project: {projectName || projectId}
              </p>
            )}
          </div>

          {(tenantId || projectId) && (
            <button
              onClick={resetContext}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear context
            </button>
          )}
        </div>

        {/* About */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground mb-2">
            API Architecture
          </h3>
          <p className="text-sm text-muted-foreground">
            API calls are routed through a server-side proxy at{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              /api/hive-mind/*
            </code>
            . The proxy attaches your Keycloak Bearer token server-side, so no
            tokens or API keys are exposed in the browser.
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
