"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, MoreHorizontal, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth/use-auth"
import { mockLeads } from "@/data/mock"
import type { Lead } from "@/data/types"
import { IntentBadge, StatusBadge, ProductBadge, SourceBadge, ScoreBadge } from "@/components/crm/badges"
import { CRMShell } from "@/components/crm/crm-shell"
import { AuthGate } from "@/components/crm/auth-gate"
import { CRMTopbar } from "@/components/crm/crm-topbar"

function computeStats(leads: Lead[]) {
  const total = leads.length
  const newLeads = leads.filter((l) => l.status === "New").length
  const hot = leads.filter((l) => l.intentLevel === "Hot Lead").length
  const qualified = leads.filter((l) => l.status === "Qualified").length
  const won = leads.filter((l) => l.status === "Won").length
  return [
    { label: "Total", count: String(total), bg: "bg-[#F0EDF6]", text: "text-[#7060B8]" },
    { label: "New", count: String(newLeads), bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
    { label: "Hot", count: String(hot), bg: "bg-[#FCE4EC]", text: "text-[#E85888]" },
    { label: "Qualified", count: String(qualified), bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
    { label: "Won", count: String(won), bg: "bg-[#E8F5E9]", text: "text-[#1B5E20]" },
  ]
}

function mapApiLead(apiLead: Record<string, unknown>): Lead {
  return {
    id: apiLead.leadId as string,
    companyName: apiLead.companyName as string,
    contactName: (apiLead.contactName as string) || "Unknown",
    product: (apiLead.product as Lead["product"]) || "Review",
    industry: (apiLead.industry as string) || "",
    market: (apiLead.market as Lead["market"]) || "Other",
    country: (apiLead.country as string) || "",
    city: (apiLead.city as string) || "",
    source: (apiLead.source as Lead["source"]) || "Other",
    sourceUrl: (apiLead.sourceUrl as string) || "",
    leadScore: (apiLead.leadScore as number) || 0,
    intentLevel: (apiLead.intentLevel as Lead["intentLevel"]) || "Unclear",
    status: (apiLead.status as Lead["status"]) || "New",
    painPoints: (apiLead.painPoints as string[]) || [],
    suggestedAngle: (apiLead.suggestedAngle as string) || "",
    aiSummary: (apiLead.aiSummary as string) || "",
    assignedUser: "Unassigned",
    createdAt: (apiLead.createdAt as string)?.slice(0, 10) || "",
    updatedAt: "",
    lastSeenAt: "",
    duplicateKey: (apiLead.duplicateKey as string) || "",
  }
}

const selectClasses =
  "rounded-[12px] bg-muted border border-border px-3 py-2 text-sm text-foreground outline-none"

export default function LeadsPage() {
  const { isAuthenticated } = useAuth()
  const [apiLeads, setApiLeads] = useState<Lead[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.leads)) {
          setApiLeads(data.leads.map(mapApiLead))
        }
      })
      .catch(() => {
        // Fall back to mock data on error
      })
  }, [isAuthenticated])

  const allLeads = useMemo(() => {
    return [...apiLeads, ...mockLeads]
  }, [apiLeads])

  const [search, setSearch] = useState("")
  const [productFilter, setProductFilter] = useState("All")
  const [sourceFilter, setSourceFilter] = useState("All")
  const [marketFilter, setMarketFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [intentFilter, setIntentFilter] = useState("All")

  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      const matchesSearch =
        search === "" ||
        lead.companyName.toLowerCase().includes(search.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(search.toLowerCase()) ||
        lead.source.toLowerCase().includes(search.toLowerCase())
      const matchesProduct = productFilter === "All" || lead.product === productFilter
      const matchesSource = sourceFilter === "All" || lead.source === sourceFilter
      const matchesMarket = marketFilter === "All" || lead.market === marketFilter
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter
      const matchesIntent = intentFilter === "All" || lead.intentLevel === intentFilter
      return matchesSearch && matchesProduct && matchesSource && matchesMarket && matchesStatus && matchesIntent
    })
  }, [search, productFilter, sourceFilter, marketFilter, statusFilter, intentFilter, allLeads])

  const stats = useMemo(() => computeStats(allLeads), [allLeads])

  return (
    <CRMShell>
      <AuthGate authMessage="Sign in to access leads and manage captured data.">
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-1">
          <CRMTopbar title="All Leads" subtitle="Manage and track all captured leads" />

          <div className="flex flex-wrap gap-3 px-6 mb-4">
            {stats.map((s) => (
              <span key={s.label} className={`${s.bg} ${s.text} rounded-full px-4 py-1.5 text-xs font-medium`}>
                {s.label}: {s.count}
              </span>
            ))}
          </div>

          <div className="bg-card rounded-[20px] p-4 shadow-card mb-4 mx-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-[12px] bg-muted border border-border pl-9 pr-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className={selectClasses}>
                <option value="All">All Products</option>
                <option value="Dilivygo">Dilivygo</option>
                <option value="Marlin">Marlin</option>
                <option value="Terro">Terro</option>
                <option value="Haigo">Haigo</option>
                <option value="Review">Review</option>
              </select>
              <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={selectClasses}>
                <option value="All">All Sources</option>
                <option value="Reddit">Reddit</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Google Maps">Google Maps</option>
                <option value="YouTube">YouTube</option>
                <option value="X / Twitter">X / Twitter</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Directory">Directory</option>
                <option value="Manual">Manual</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
              </select>
              <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className={selectClasses}>
                <option value="All">All Markets</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Australia">Australia</option>
                <option value="GCC">GCC</option>
                <option value="Other">Other</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClasses}>
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Qualified">Qualified</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                <option value="Demo Booked">Demo Booked</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Rejected">Rejected</option>
                <option value="Duplicate">Duplicate</option>
              </select>
              <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)} className={selectClasses}>
                <option value="All">All Intents</option>
                <option value="Hot Lead">Hot Lead</option>
                <option value="Warm Lead">Warm Lead</option>
                <option value="Pain Signal">Pain Signal</option>
                <option value="Low Intent">Low Intent</option>
                <option value="Unclear">Unclear</option>
              </select>
              <button className="flex items-center gap-2 bg-[#7060B8] text-white rounded-[12px] px-4 py-2 text-sm font-medium">
                <Plus className="size-4" />
                Add Lead
              </button>
            </div>
          </div>

          <div className="bg-card rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Lead</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Product</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Source</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Intent</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Score</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Status</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Market</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Created</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => {
                    const initials = lead.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)
                    return (
                      <tr key={lead.id} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EEEAF6] text-[#504098] text-xs flex items-center justify-center font-medium">{initials}</div>
                            <div>
                              <p className="text-sm text-foreground font-medium">{lead.companyName}</p>
                              <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><ProductBadge product={lead.product} /></td>
                        <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                        <td className="px-4 py-3"><IntentBadge level={lead.intentLevel} /></td>
                        <td className="px-4 py-3"><ScoreBadge score={lead.leadScore} /></td>
                        <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                        <td className="px-4 py-3 text-sm text-foreground">{lead.market}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{lead.createdAt}</td>
                        <td className="px-4 py-3">
                          <button aria-label="More actions" className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                            <MoreHorizontal className="size-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                        No leads match the current filters.
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
