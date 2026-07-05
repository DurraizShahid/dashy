"use client"

import { mockLeads } from "@/data/mock"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { ProductBadge, ScoreBadge, StatusBadge, SourceBadge } from "@/components/crm/badges"

const duplicateLeads = mockLeads.filter((lead) => lead.status === "Duplicate")
const displayLeads = duplicateLeads.length > 0 ? duplicateLeads : mockLeads

export default function DuplicatesPage() {
  return (
    <div className="bg-[#C4CBDE] h-screen overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
        <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="leads" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Duplicate Leads" subtitle="Potential duplicate entries detected" />

              <div className="mx-6 mb-4 rounded-[20px] p-5 bg-[#FFF3E0] text-[#E65100]">
                <p className="text-3xl font-bold">{duplicateLeads.length} Possible Duplicates</p>
              </div>

              <div className="bg-white rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F7F7F8]">
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Lead</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Company</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Source</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Duplicate Key</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Score</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Status</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayLeads.map((lead) => {
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
                                  <p className="text-sm text-[#28243D] font-medium">{lead.contactName}</p>
                                  <p className="text-xs text-[#7B7592]">{lead.product}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#28243D]">{lead.companyName}</td>
                            <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                            <td className="px-4 py-3 text-xs text-[#7B7592] font-mono">{lead.duplicateKey}</td>
                            <td className="px-4 py-3"><ScoreBadge score={lead.leadScore} /></td>
                            <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button className="bg-[#7060B8] text-white text-xs rounded-lg px-3 py-1 hover:bg-[#504098] transition-colors">
                                  Merge
                                </button>
                                <button className="bg-[#E9E7F0] text-[#4D4764] text-xs rounded-lg px-3 py-1 hover:bg-[#DED8EB] transition-colors">
                                  Keep Separate
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
