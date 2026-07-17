"use client"

import { Pause, Play, FileText } from "lucide-react"
import { CRMShell } from "@/components/crm/crm-shell"
import { AuthGate } from "@/components/crm/auth-gate"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { useState, useEffect } from "react"
import { fetchSources } from "@/lib/crm/api"
import type { SourceHealth } from "@/data/types"

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceHealth[]>([])
  useEffect(() => { fetchSources().then(setSources) }, [])

  const togglePause = (index: number) => {
    setSources((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, status: s.status === "Active" ? "Paused" : "Active" }
          : s
      )
    )
  }

  const getProgressColor = (rate: number) => {
    if (rate > 95) return "bg-[#2E7D32]"
    if (rate > 85) return "bg-[#F57F17]"
    return "bg-[#C62828]"
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E8F5E9] text-[#2E7D32]"
      case "Paused":
        return "bg-[#FFF8E1] text-[#F57F17]"
      case "Error":
        return "bg-[#FFEBEE] text-[#C62828]"
      default:
        return "bg-[#F5F5F5] text-muted-foreground"
    }
  }

  return (
    <CRMShell>
      <AuthGate authMessage="Sign in to monitor scraper health and source performance.">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
          <CRMTopbar title="Lead Sources" subtitle="Monitor scraper health and source performance" />

          <div className="grid grid-cols-3 gap-4 px-6 mb-6">
            {sources.map((source, i) => (
              <div
                key={source.name}
                className="bg-card rounded-[20px] p-5 shadow-card border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-poppins font-semibold text-foreground">
                    {source.name}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      source.status
                    )}`}
                  >
                    {source.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <p>{source.leadsFound} leads found</p>
                  <p>{source.hotLeads} hot leads</p>
                  <p>Avg score: {source.avgScore}</p>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <span className="text-xs font-medium text-foreground">
                      {source.successRate}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E9E7F0]">
                    <div
                      className={`h-full rounded-full ${getProgressColor(
                        source.successRate
                      )}`}
                      style={{ width: `${source.successRate}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  Last run: {source.lastRun}
                </p>

                {source.errorCount > 0 && (
                  <p className="text-xs text-[#C62828] font-medium mb-3">
                    {source.errorCount} error{source.errorCount > 1 ? "s" : ""}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePause(i)}
                    className="flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {source.status === "Active" ? (
                      <>
                        <Pause className="size-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-3" />
                        Resume
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-[#7060B8] hover:underline">
                    <FileText className="size-3" />
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AuthGate>
    </CRMShell>
  )
}
