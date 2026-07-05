"use client"

import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

interface CRMTopbarProps {
  title: string
  subtitle?: string
}

export function CRMTopbar({ title, subtitle }: CRMTopbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div>
        <p className="text-xs" style={{ color: "#7B7592" }}>
          HelpTribe CRM
        </p>
        <h1
          className="font-poppins text-lg font-semibold"
          style={{ color: "#28243D" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search leads..."
            className={cn(
              "h-8 w-56 rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          />
        </div>

        <div
          className="flex size-8 items-center justify-center rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: "#7060B8" }}
        >
          AJ
        </div>
      </div>
    </div>
  )
}
