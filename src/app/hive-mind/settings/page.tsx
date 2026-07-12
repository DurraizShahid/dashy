"use client";

import { CRMTopbar } from "@/components/crm/crm-topbar";
import { isHiveMindEnabled } from "@/lib/env";
import { isAuthEnabled } from "@/lib/auth/config";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { useAuth } from "@/lib/auth/use-auth";
import { Settings, CheckCircle, XCircle, Building2, Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function InfoRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string | undefined | null;
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
          {value ?? "(not set)"}
        </code>
      </div>
    </div>
  );
}

export default function HiveMindSettingsPage() {
  const hmEnabled = isHiveMindEnabled();
  const authEnabled = isAuthEnabled();
  const { currentUser, tenants, projects, selectedTenant, selectedProject, loading } = useHiveMind();
  const { isAuthenticated, session } = useAuth();

  const configItems = [
    {
      label: "Hive Mind API URL",
      value: process.env.NEXT_PUBLIC_HIVE_MIND_API_URL,
      ok: hmEnabled,
    },
  ];

  return (
    <>
      <CRMTopbar
        title="Hive Mind Settings"
        subtitle="Module configuration, status, and organization context"
      />

      <div className="px-6 pb-6 max-w-2xl space-y-4">
        {/* Configuration Status */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="size-5 text-foreground" />
            <h3 className="font-poppins font-semibold text-foreground">
              Configuration Status
            </h3>
          </div>

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={cn("size-2.5 rounded-full", hmEnabled ? "bg-green-600" : "bg-muted-foreground")} />
              <span className="text-xs text-muted-foreground">
                Hive Mind: {hmEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("size-2.5 rounded-full", authEnabled ? "bg-green-600" : "bg-muted-foreground")} />
              <span className="text-xs text-muted-foreground">
                Auth: {authEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("size-2.5 rounded-full", isAuthenticated ? "bg-green-600" : "bg-amber-500")} />
              <span className="text-xs text-muted-foreground">
                Session: {isAuthenticated ? "Active" : "None"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {configItems.map((item) => (
              <InfoRow key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Auth Status */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="size-5 text-foreground" />
            <h3 className="font-poppins font-semibold text-foreground">
              Authentication
            </h3>
          </div>

          <div className="flex flex-col gap-2">
            <InfoRow label="Auth Mode" value="Clerk" ok={authEnabled} />
            <InfoRow
              label="Signed In"
              value={currentUser?.email ?? session?.email ?? (isAuthenticated ? "Yes" : "No")}
              ok={isAuthenticated}
            />
            {(currentUser?.name || session?.name) && (
              <InfoRow
                label="Name"
                value={currentUser?.name || session?.name || ""}
                ok={true}
              />
            )}
            {currentUser?.actorType && (
              <InfoRow label="Actor Type" value={currentUser.actorType} ok={true} />
            )}
            <InfoRow
              label="Token Storage"
              value="Clerk session (managed by SDK)"
              ok={true}
            />
            <InfoRow
              label="API Key in Browser"
              value="Not used"
              ok={true}
            />
          </div>
        </div>

        {/* Organization Context */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="size-5 text-foreground" />
            <h3 className="font-poppins font-semibold text-foreground">
              Organization Context
            </h3>
          </div>

          <div className="flex flex-col gap-2">
            <InfoRow
              label="Organizations"
              value={loading ? "Loading..." : String(tenants.length)}
              ok={tenants.length > 0}
            />
            <InfoRow
              label="Projects"
              value={loading ? "Loading..." : String(projects.length)}
              ok={projects.length > 0}
            />
            <InfoRow
              label="Selected Organization"
              value={selectedTenant?.name ?? "None"}
              ok={!!selectedTenant}
            />
            <InfoRow
              label="Selected Project"
              value={selectedProject?.name ?? "None (all)"}
              ok={true}
            />
          </div>
        </div>

        {/* Security */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="size-5 text-foreground" />
            <h3 className="font-poppins font-semibold text-foreground">
              Security & Proxy
            </h3>
          </div>

          <div className="flex flex-col gap-2">
            <InfoRow label="Proxy Path" value="/api/hive-mind/*" ok={true} />
            <InfoRow label="Token Location" value="Clerk session (SDK managed)" ok={true} />
            <InfoRow label="Browser API Key" value="Removed" ok={true} />
            <InfoRow label="localStorage Tokens" value="None" ok={true} />
          </div>
        </div>

        {/* Backend Gaps */}
        <div className="rounded-[20px] bg-card p-6 shadow-card">
          <h3 className="font-poppins font-semibold text-foreground mb-2">
            Known Backend Gaps
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Some list endpoints may not yet implement cursor-based pagination</li>
            <li>Agent context response shape may differ from frontend expectations</li>
            <li>Document chunk detail may not be available for all documents</li>
            <li>Audit logs endpoint requires backend deployment verification</li>
          </ul>
        </div>

        {/* About */}
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
            Authentication is handled via Clerk. The server-side proxy
            forwards Clerk session tokens to the backend. No
            secrets are exposed to the browser.
          </p>
        </div>
      </div>
    </>
  );
}
