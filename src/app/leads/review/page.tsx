"use client"

import { mockLeads } from "@/data/mock"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { ProductBadge, ScoreBadge, StatusBadge, SourceBadge, IntentBadge } from "@/components/crm/badges"

const reviewLeads = mockLeads.filter(
  (lead) => lead.status === "Needs Review" || lead.intentLevel === "Unclear"
)

export default function ReviewQueuePage() {
  return (
    <div className="bg-background h-screen overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="leads" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Review Queue" subtitle="Leads requiring manual review" />

              <div className="mx-6 mb-4 rounded-[20px] p-5 bg-gradient-to-r from-[#7060B8] to-[#504098] text-white">
                <p className="text-3xl font-bold">{reviewLeads.length} Leads in Queue</p>
                <div className="flex gap-6 mt-2 text-sm opacity-90">
                  <span>Avg Score: {Math.round(reviewLeads.reduce((a, l) => a + l.leadScore, 0) / reviewLeads.length)}</span>
                </div>
              </div>

              <div className="bg-card rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Lead</th>
                        <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Product</th>
                        <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Source</th>
                        <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Score</th>
                        <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Intent</th>
                        <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Status</th>
                        <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewLeads.map((lead) => {
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
                                  <p className="text-sm text-foreground font-medium">{lead.companyName}</p>
                                  <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><ProductBadge product={lead.product} /></td>
                            <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                            <td className="px-4 py-3"><ScoreBadge score={lead.leadScore} /></td>
                            <td className="px-4 py-3"><IntentBadge level={lead.intentLevel} /></td>
                            <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button className="bg-[#2E7D32] text-white text-xs rounded-lg px-3 py-1 hover:bg-[#1B5E20] transition-colors">
                                  Approve
                                </button>
                                <button className="bg-[#C62828] text-white text-xs rounded-lg px-3 py-1 hover:bg-[#B71C1C] transition-colors">
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
