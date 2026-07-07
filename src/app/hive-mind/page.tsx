"use client";

import { CRMTopbar } from "@/components/crm/crm-topbar";
import { HealthStatus } from "@/components/hive-mind/health-status";

export default function HiveMindPage() {
  return (
    <>
      <CRMTopbar title="Hive Mind" subtitle="System health and overview" />

      <div className="px-6 pb-6 max-w-2xl">
        <HealthStatus />
      </div>
    </>
  );
}
