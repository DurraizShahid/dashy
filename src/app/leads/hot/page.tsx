"use client"

import { mockLeads } from "@/data/mock"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { ProductBadge, ScoreBadge, StatusBadge, SourceBadge } from "@/components/crm/badges"
import { Send } from "lucide-react"

const hotLeads = mockLeads.filter((lead) => lead.leadScore >= 80)

export default function HotLeadsPage() {
  return (
    <div className="bg-[#C4CBDE] h-screen overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
        <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="leads" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Hot Leads" subtitle="High-intent leads scoring 80+" />

              <div className="mx-6 mb-4 rounded-[20px] p-5 bg-gradient-to-r from-[#F06890] to-[#7060B8] text-white">
                <p className="text-3xl font-bold">{hotLeads.length} Hot Leads</p>
                <div className="flex gap-6 mt-2 text-sm opacity-90">
                  <span>Avg Score: {Math.round(hotLeads.reduce((a, l) => a + l.leadScore, 0) / hotLeads.length)}</span>
                  <span>Top Source: LinkedIn</span>
                </div>
              </div>

              <div className="bg-white rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F7F7F8]">
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Lead</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Product</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Source</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Score</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Pain Points</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Status</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotLeads.map((lead) => {
                        const initials = lead.contactName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                        return (
                          <tr key={lead.id} className="border-b border-[#E9E7F0] hover:bg-[#F7F7F8] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#EEEAF6] text-[#504098] text-xs flex items-center justify-center font-medium">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm text-[#28243D] font-medium">{lead.companyName}</p>
                                  <p className="text-xs text-[#7B7592]">{lead.contactName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><ProductBadge product={lead.product} /></td>
                            <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                            <td className="px-4 py-3"><ScoreBadge score={lead.leadScore} /></td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {lead.painPoints.slice(0, 2).map((pain) => (
                                  <span key={pain} className="bg-[#F0EDF6] text-[#7060B8] text-xs px-2 py-0.5 rounded-full">
                                    {pain}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                            <td className="px-4 py-3">
                              <button className="bg-white/20 text-white rounded-lg px-3 py-1 text-xs flex items-center gap-1 hover:bg-white/30 transition-colors">
                                <Send className="size-3" />
                                Send to Slack
                              </button>
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
