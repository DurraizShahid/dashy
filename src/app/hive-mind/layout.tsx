"use client";

import { usePathname } from "next/navigation";
import { CRMSidebar } from "@/components/crm/crm-sidebar";
import { TenantProjectSelector } from "@/components/hive-mind/tenant-project-selector";
import { isHiveMindEnabled } from "@/lib/env";
import { useAuth, useIsAuthConfigured } from "@/lib/auth/use-auth";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import {
  ShieldAlert,
  Loader2,
  Building2,
} from "lucide-react";

function HiveMindShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeItem = pathname.startsWith("/hive-mind") ? "hive-mind" : "dashboard";

  return (
    <div className="bg-background h-screen overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem={activeItem} />
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              {/* Tenant/Project selector bar */}
              <div className="flex items-center justify-between px-6 pt-2">
                <TenantProjectSelector />
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HiveMindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isConfigured = useIsAuthConfigured();
  const { isAuthenticated, isLoading } = useAuth();
  const { tenants, loading: hmLoading, error: hmError } = useHiveMind();

  if (!isHiveMindEnabled()) {
    return (
      <div className="bg-background h-screen overflow-hidden">
        <div className="h-full py-4 px-4">
          <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
            <div className="flex gap-5 h-full">
              <CRMSidebar activeItem="hive-mind" />
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="font-poppins text-xl font-semibold text-foreground mb-2">
                  Hive Mind Not Configured
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Set <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    NEXT_PUBLIC_HIVEMIND_API_URL
                  </code>{" "}
                  in your environment to enable Hive Mind features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth configured but checking session
  if (isLoading) {
    return (
      <HiveMindShell>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-16">
          <Loader2 className="size-4 animate-spin" />
          Checking authentication...
        </div>
      </HiveMindShell>
    );
  }

  // Auth not configured — public mode, show everything
  if (!isConfigured) {
    return <HiveMindShell>{children}</HiveMindShell>;
  }

  // Auth configured but not signed in
  if (!isAuthenticated) {
    return (
      <HiveMindShell>
        <div className="flex items-center justify-center py-16">
          <div className="rounded-[20px] bg-card p-6 shadow-card max-w-md text-center">
            <ShieldAlert className="size-8 mx-auto text-amber-500 mb-3" />
            <h3 className="font-poppins font-semibold text-foreground mb-1">
              Authentication Required
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in with Keycloak to access Hive Mind features.
            </p>
            <a
              href="/api/auth/login"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </HiveMindShell>
    );
  }

  // Authenticated, loading tenants
  if (hmLoading && tenants.length === 0) {
    return (
      <HiveMindShell>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-16">
          <Loader2 className="size-4 animate-spin" />
          Loading organizations...
        </div>
      </HiveMindShell>
    );
  }

  // Authenticated but no tenants
  if (!hmLoading && tenants.length === 0 && !hmError) {
    return (
      <HiveMindShell>
        <div className="flex items-center justify-center py-16">
          <div className="rounded-[20px] bg-card p-6 shadow-card max-w-md text-center">
            <Building2 className="size-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-poppins font-semibold text-foreground mb-1">
              No Organization Memberships
            </h3>
            <p className="text-sm text-muted-foreground">
              Your account doesn&apos;t have access to any organizations.
              Contact an administrator to get access.
            </p>
          </div>
        </div>
      </HiveMindShell>
    );
  }

  // Authenticated, error loading tenants
  if (hmError && tenants.length === 0) {
    return (
      <HiveMindShell>
        <div className="flex items-center justify-center py-16">
          <div className="rounded-[20px] bg-card p-6 shadow-card max-w-md text-center">
            <p className="text-sm text-destructive">{hmError}</p>
          </div>
        </div>
      </HiveMindShell>
    );
  }

  return <HiveMindShell>{children}</HiveMindShell>;
}
