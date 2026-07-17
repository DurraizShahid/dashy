"use client"

import { mockLeads } from "@/data/mock"
import { CRMShell } from "@/components/crm/crm-shell"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { ScoreBadge, StatusBadge, SourceBadge } from "@/components/crm/badges"

const duplicateLeads = mockLeads.filter((lead) => lead.status === "Duplicate")
const displayLeads = duplicateLeads.length > 0 ? duplicateLeads : mockLeads

export default function DuplicatesPage() {
  return (
    <CRMShell>
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
        <CRMTopbar title="Duplicate Leads" subtitle="Potential duplicate entries detected" />

        <div className="mx-6 mb-4 rounded-[20px] p-5 bg-[#FFF3E0] text-[#E65100]">
          <p className="text-3xl font-bold">{duplicateLeads.length} Possible Duplicates</p>
        </div>

        <div className="bg-card rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Lead</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Company</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Source</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Duplicate Key</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Score</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Status</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayLeads.length > 0 ? (
                  displayLeads.map((lead) => {
                  const initials = lead.contactName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                  return (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EEEAF6] text-[#504098] text-xs flex items-center justify-center font-medium">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm text-foreground font-medium">{lead.contactName}</p>
                            <p className="text-xs text-muted-foreground">{lead.product}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{lead.companyName}</td>
                      <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{lead.duplicateKey}</td>
                      <td className="px-4 py-3"><ScoreBadge score={lead.leadScore} /></td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="bg-[#7060B8] text-white text-xs rounded-lg px-3 py-1 hover:bg-[#504098] transition-colors">
                            Merge
                          </button>
                          <button className="bg-[#E9E7F0] text-secondary-foreground text-xs rounded-lg px-3 py-1 hover:bg-[#DED8EB] transition-colors">
                            Keep Separate
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No duplicate leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CRMShell>
  )
}
