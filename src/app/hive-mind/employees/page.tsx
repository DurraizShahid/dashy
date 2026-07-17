"use client";

import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { Brain, Construction } from "lucide-react";

export default function EmployeesPage() {
  const { selectedTenant, selectedProject } = useHiveMind();

  return (
    <>
      <CRMTopbar
        title="Employees"
        subtitle="People management and team member profiles"
      />

      <div className="px-6 pb-6 space-y-4">
        <div className="rounded-[20px] bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            <Brain className="size-3 inline mr-1" />
            Scope:{" "}
            <span className="font-medium text-foreground">
              {selectedTenant?.name ?? "No organization selected"}
            </span>
            {selectedProject && (
              <span className="text-muted-foreground">
                {" / "}{selectedProject.name}
              </span>
            )}
          </p>
        </div>

        <div className="rounded-[20px] bg-card p-10 shadow-card text-center">
          <Construction className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-poppins font-semibold text-foreground mb-1">
            Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Employee directory, role assignments, and individual performance tracking will be available here.
          </p>
        </div>
      </div>
    </>
  );
}
