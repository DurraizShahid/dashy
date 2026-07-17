"use client"

import { useState, useEffect } from "react"
import { SourceBadge } from "@/components/crm/badges"
import { CRMShell } from "@/components/crm/crm-shell"
import { AuthGate } from "@/components/crm/auth-gate"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { fetchSources } from "@/lib/crm/api"
import type { ScraperRun } from "@/data/types"

function computeStats(runs: ScraperRun[]) {
  const total = runs.length
  const completed = runs.filter(r => r.status === "Completed").length
  const running = runs.filter(r => r.status === "Running").length
  const failed = runs.filter(r => r.status === "Failed").length
  return [
    { label: "Total Runs", count: String(total), bg: "bg-[#F0EDF6]", text: "text-[#7060B8]" },
    { label: "Completed", count: String(completed), bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
    { label: "Running", count: String(running), bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
    { label: "Failed", count: String(failed), bg: "bg-[#FFEBEE]", text: "text-[#C62828]" },
  ]
}

export default function ScraperRunsPage() {
  const [runs, setRuns] = useState<ScraperRun[]>([])
  useEffect(() => { fetchSources().then((sources) => {
    const allRuns: ScraperRun[] = []
    let loaded = 0
    for (const src of sources) {
      fetch(`/api/crm/sources/${encodeURIComponent(src.name)}/runs?limit=10`)
        .then(r => r.json())
        .then(d => { if (d.success) allRuns.push(...(d.data ?? [])) })
        .finally(() => { loaded++; if (loaded === sources.length) setRuns([...allRuns]) })
    }
    if (sources.length === 0) setRuns([])
  }) }, [])
  const stats = computeStats(runs)
  return (
    <CRMShell>
      <AuthGate authMessage="Sign in to view scraper run history and logs.">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
          <CRMTopbar title="Scraper Runs" subtitle="Automation run history and logs" />

          <div className="flex flex-wrap gap-3 px-6 mb-4">
            {stats.map((s) => (
              <span
                key={s.label}
                className={`${s.bg} ${s.text} rounded-full px-4 py-1.5 text-xs font-medium`}
              >
                {s.count} {s.label}
              </span>
            ))}
          </div>

          <div className="bg-card rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Run ID</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Source</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Started</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Duration</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Leads Found</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Added</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Dupes Skipped</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Errors</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Status</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.length > 0 ? (
                    runs.map((run) => (
                    <tr key={run.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">{run.id}</td>
                      <td className="px-4 py-3"><SourceBadge source={run.source} /></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(run.startedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{run.duration}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{run.leadsFound}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{run.leadsAdded}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{run.duplicatesSkipped}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{run.errors}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {run.status === "Running" && (
                            <span className="relative flex size-2">
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#1565C0] opacity-75" />
                              <span className="relative inline-flex size-2 rounded-full bg-[#1565C0]" />
                            </span>
                          )}
                          {run.status === "Completed" && (
                            <span className="size-2 rounded-full bg-[#2E7D32]" />
                          )}
                          {run.status === "Failed" && (
                            <span className="size-2 rounded-full bg-[#C62828]" />
                          )}
                          <span className="text-sm text-foreground">{run.status}</span>
                        </div>
                        {run.errorMessage && (
                          <p className="text-xs text-[#C62828] mt-1">{run.errorMessage}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-[#7060B8] text-xs font-medium hover:underline">
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                        No scraper runs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AuthGate>
    </CRMShell>
  )
}
