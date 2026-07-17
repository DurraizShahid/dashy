"use client"

import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { cn } from "@/lib/utils"

interface CRMShellProps {
  children: React.ReactNode
  className?: string
  cardClassName?: string
}

export function CRMShell({ children, className, cardClassName }: CRMShellProps) {
  return (
    <div className={cn("bg-background h-screen overflow-hidden", className)}>
      <div className="h-full py-4 px-4">
        <div className={cn("h-full rounded-[36px] p-5 shadow-elevated", cardClassName ?? "bg-card")}>
          <div className="flex gap-5 h-full">
            <CRMSidebar />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
