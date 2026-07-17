"use client"

import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { CRMShell } from "@/components/crm/crm-shell"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { ProductBadge, ScoreBadge } from "@/components/crm/badges"
import { fetchLeads } from "@/lib/crm/api"
import type { Lead } from "@/data/types"

const productCards = [
  { name: "Dilivygo Leads", count: 485, hot: 62, color: "#2E7D32", pill: "bg-[#E8F5E9] text-[#2E7D32]", barColor: "#2E7D32" },
  { name: "Marlin Leads", count: 312, hot: 38, color: "#1565C0", pill: "bg-[#E3F2FD] text-[#1565C0]", barColor: "#1565C0" },
  { name: "Terro Leads", count: 278, hot: 45, color: "#E65100", pill: "bg-[#FFF3E0] text-[#E65100]", barColor: "#E65100" },
  { name: "Haigo Leads", count: 215, hot: 28, color: "#7060B8", pill: "bg-[#F3E5F5] text-[#7060B8]", barColor: "#7060B8" },
]

const marketSnapshot = [
  { region: "USA", color: "#7060B8" },
  { region: "UK", color: "#F06890" },
  { region: "AUS", color: "#2E7D32" },
  { region: "GCC", color: "#E65100" },
]

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  useEffect(() => { fetchLeads().then(setLeads) }, [])
  const [activeTab, setActiveTab] = useState<"hot" | "review">("hot")
  const hotLeads = leads.filter((l) => l.intentLevel === "Hot Lead")
  const reviewLeads = leads.filter((l) => l.status === "Needs Review" || l.intentLevel === "Unclear")
  const displayLeads = activeTab === "hot" ? hotLeads : reviewLeads

  return (
    <CRMShell>
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
        <CRMTopbar title="Lead Dashboard" />

        {/* Row 1 */}
        <div className="flex gap-4">
          {/* Large Purple Card */}
          <div className="flex-1 min-h-[240px] rounded-[24px] p-6 gradient-purple flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <h2 className="font-poppins text-xl font-semibold text-white">Lead Overview</h2>
              <span className="rounded-full bg-card/20 px-3 py-1 text-xs text-white">Jul 2025</span>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-white">
                <p className="text-xs text-white/70">Total Leads</p>
                <p className="text-2xl font-semibold font-poppins">1,452</p>
              </div>
              <div className="text-white">
                <p className="text-xs text-white/70">Hot Leads</p>
                <p className="text-2xl font-semibold font-poppins">172</p>
              </div>
              <div className="text-white">
                <p className="text-xs text-white/70">Avg Score</p>
                <p className="text-2xl font-semibold font-poppins">68</p>
              </div>
              <div className="text-white">
                <p className="text-xs text-white/70">Sent to Slack</p>
                <p className="text-2xl font-semibold font-poppins">89</p>
              </div>
            </div>

            <svg viewBox="0 0 400 60" className="w-full mt-3" preserveAspectRatio="none">
              <path
                d="M0,50 C50,45 100,35 150,28 C200,20 250,32 300,15 C350,8 380,18 400,10"
                fill="none"
                stroke="#F880A8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Smaller Pink Card */}
          <div className="w-[260px] rounded-[24px] p-6 gradient-pink flex flex-col justify-between shrink-0">
            <div>
              <h2 className="font-poppins text-lg font-semibold text-white">Hot Lead Activity</h2>
              <p className="text-4xl font-bold text-white mt-3 font-poppins">12</p>
              <p className="text-sm text-white/80 mt-1">Hot Leads Today</p>
              <p className="text-sm text-white/60 mt-0.5">Top Product: Dilivygo</p>
            </div>
            <div className="flex justify-end">
              <div className="w-9 h-9 rounded-full bg-card/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-4">
          {productCards.map((card) => {
            const percentage = (card.count / 500) * 100
            return (
              <div key={card.name} className="bg-card rounded-[20px] p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}15` }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${card.pill}`}>
                    {card.hot} hot
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{card.name}</p>
                <p className="text-2xl font-semibold font-poppins text-foreground mt-1">{card.count}</p>
                <div className="bg-[#E9E7F0] rounded-full h-1.5 mt-3">
                  <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: card.barColor }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Row 3 */}
        <div className="flex gap-4">
          {/* Leads by Source */}
          <div className="flex-1 bg-card rounded-[20px] p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-foreground mb-4">Leads by Source</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={(() => {
                const counts: Record<string, number> = {}
                for (const l of leads) { counts[l.source] = (counts[l.source] || 0) + 1 }
                return Object.entries(counts).map(([source, count]) => ({ source, count }))
              })()} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="source"
                  tick={{ fontSize: 11, fill: "#7B7592" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#7B7592" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(80,64,152,0.12)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                  activeBar={false}
                >
                  {(() => {
                    const counts: Record<string, number> = {}
                    for (const l of leads) { counts[l.source] = (counts[l.source] || 0) + 1 }
                    return Object.entries(counts).map((_, index) => (
                      <Cell key={index} fill="#7060B8" />
                    ))
                  })()}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right Panel */}
          <div className="w-[300px] bg-card rounded-[20px] p-5 shadow-card shrink-0">
            <h3 className="font-poppins font-semibold text-foreground mb-3">Priority Leads</h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("hot")}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "hot"
                    ? "bg-[#7060B8] text-white"
                    : "bg-[#EEEAF6] text-[#504098] hover:bg-muted"
                }`}
              >
                Hot
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "review"
                    ? "bg-[#7060B8] text-white"
                    : "bg-[#EEEAF6] text-[#504098] hover:bg-muted"
                }`}
              >
                Review
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {displayLeads.slice(0, 5).map((lead) => {
                const initials = lead.companyName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                return (
                  <div key={lead.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EEEAF6] flex items-center justify-center text-[11px] font-semibold text-[#504098] shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lead.companyName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ProductBadge product={lead.product} />
                      </div>
                    </div>
                    <ScoreBadge score={lead.leadScore} />
                  </div>
                )
              })}
            </div>

            {/* Market Snapshot */}
            <div className="mt-5 rounded-[16px] bg-[#F7F5FA] p-4">
              <p className="text-xs font-semibold text-foreground mb-3">Market Snapshot</p>
              <div className="flex gap-4">
                {marketSnapshot.map((m) => (
                  <div key={m.region} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-[11px] text-muted-foreground">{m.region}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CRMShell>
  )
}
