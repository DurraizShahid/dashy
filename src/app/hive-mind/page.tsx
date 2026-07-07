"use client";

import { CRMSidebar } from "@/components/crm/crm-sidebar";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { HealthStatus } from "@/components/hive-mind/health-status";
import { isHiveMindEnabled } from "@/lib/env";

export default function HiveMindPage() {
  if (!isHiveMindEnabled()) {
    return (
      <div className="bg-background h-screen overflow-hidden">
        <div className="h-full py-4 px-4">
          <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
            <div className="flex gap-5 h-full">
              <CRMSidebar activeItem="dashboard" />
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="font-poppins text-xl font-semibold text-foreground mb-2">
                  Hive Mind Not Configured
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Set <code className="bg-muted px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_HIVE_MIND_API_URL</code>{" "}
                  in your environment to enable Hive Mind features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background h-screen overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="hive-mind" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Hive Mind" subtitle="System health and overview" />

              <div className="px-6 pb-6 max-w-2xl">
                <HealthStatus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
