"use client"

import { useState } from "react"
import { Users, Flame, Sparkles, Bell } from "lucide-react"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { IntentBadge, StatusBadge, SourceBadge, ScoreBadge } from "@/components/crm/badges"
import { mockLeads } from "@/data/mock"

const products = [
  {
    name: "Dilivygo",
    subtitle: "Restaurant & Food Service Leads",
    accent: "#2E7D32",
    accentLight: "#E8F5E9",
    sources: [
      { name: "Reddit", count: 210 },
      { name: "LinkedIn", count: 120 },
      { name: "Facebook", count: 80 },
      { name: "Instagram", count: 45 },
      { name: "Referral", count: 30 },
    ],
    markets: [
      { name: "USA", count: 180 },
      { name: "UK", count: 120 },
      { name: "GCC", count: 95 },
      { name: "Australia", count: 60 },
      { name: "Other", count: 30 },
    ],
    painPoints: ["missed phone orders", "delivery tablets", "food cost"],
  },
  {
    name: "Marlin",
    subtitle: "Property Management Leads",
    accent: "#1565C0",
    accentLight: "#E3F2FD",
    sources: [
      { name: "LinkedIn", count: 150 },
      { name: "Google Maps", count: 90 },
      { name: "Directory", count: 45 },
      { name: "Reddit", count: 25 },
      { name: "Referral", count: 12 },
    ],
    markets: [
      { name: "USA", count: 140 },
      { name: "UK", count: 85 },
      { name: "Australia", count: 55 },
      { name: "GCC", count: 25 },
      { name: "Other", count: 10 },
    ],
    painPoints: ["tenant management", "rent collection", "maintenance requests"],
  },
  {
    name: "Terro",
    subtitle: "Accounting & Finance Leads",
    accent: "#E65100",
    accentLight: "#FFF3E0",
    sources: [
      { name: "LinkedIn", count: 130 },
      { name: "X / Twitter", count: 60 },
      { name: "Referral", count: 45 },
      { name: "Reddit", count: 30 },
      { name: "Manual", count: 15 },
    ],
    markets: [
      { name: "GCC", count: 110 },
      { name: "USA", count: 90 },
      { name: "UK", count: 45 },
      { name: "Australia", count: 25 },
      { name: "Other", count: 10 },
    ],
    painPoints: ["tax compliance", "e-invoicing", "month-end close"],
  },
  {
    name: "Haigo",
    subtitle: "Hotel & Hospitality Leads",
    accent: "#7060B8",
    accentLight: "#EDE7F6",
    sources: [
      { name: "Google Maps", count: 100 },
      { name: "YouTube", count: 55 },
      { name: "Website", count: 35 },
      { name: "LinkedIn", count: 20 },
      { name: "Instagram", count: 10 },
    ],
    markets: [
      { name: "GCC", count: 90 },
      { name: "UK", count: 55 },
      { name: "Australia", count: 40 },
      { name: "USA", count: 25 },
      { name: "Other", count: 10 },
    ],
    painPoints: ["OTA commissions", "overbooking", "guest management"],
  },
]

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(products[0].name)
  const product = products.find((p) => p.name === selectedProduct) || products[0]
  const productLeads = mockLeads.filter((l) => l.product === product.name)
  const maxSourceCount = Math.max(...product.sources.map((s) => s.count))
  const maxMarketCount = Math.max(...product.markets.map((m) => m.count))

  return (
    <div className="bg-background h-screen overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title={product.name} subtitle={product.subtitle} />

              {/* Product Selector */}
              <div className="flex gap-2 mx-6">
                {products.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedProduct(p.name)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedProduct === p.name
                        ? "text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                    }`}
                    style={selectedProduct === p.name ? { backgroundColor: p.accent } : {}}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Header Card */}
              <div className="mx-6 rounded-[20px] p-5" style={{ backgroundColor: product.accentLight }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${product.accent}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.accent }} />
                  </div>
                  <h2 className="font-poppins font-semibold text-foreground">{product.name} Overview</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${product.accent}15` }}>
                      <Users className="w-5 h-5" style={{ color: product.accent }} />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold font-poppins" style={{ color: product.accent }}>{productLeads.length || "--"}</p>
                      <p className="text-xs text-muted-foreground">Total Leads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFF3E0]">
                      <Flame className="w-5 h-5 text-[#E65100]" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold font-poppins text-[#E65100]">{productLeads.filter((l) => l.intentLevel === "Hot Lead").length}</p>
                      <p className="text-xs text-muted-foreground">Hot</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E3F2FD]">
                      <Sparkles className="w-5 h-5 text-[#1565C0]" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold font-poppins text-[#1565C0]">{productLeads.filter((l) => l.status === "New").length}</p>
                      <p className="text-xs text-muted-foreground">New</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Cards Row */}
              <div className="grid grid-cols-4 gap-4 mx-6">
                {/* Leads by Source */}
                <div className="bg-card rounded-[20px] p-4 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground text-sm mb-3">Leads by Source</h3>
                  <div className="flex flex-col gap-2">
                    {product.sources.map((s) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground w-16 truncate">{s.name}</span>
                        <div className="flex-1 bg-[#E9E7F0] rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(s.count / maxSourceCount) * 100}%`, backgroundColor: product.accent }} />
                        </div>
                        <span className="text-[11px] font-medium text-foreground w-8 text-right">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leads by Market */}
                <div className="bg-card rounded-[20px] p-4 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground text-sm mb-3">Leads by Market</h3>
                  <div className="flex flex-col gap-2">
                    {product.markets.map((m) => (
                      <div key={m.name} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground w-16 truncate">{m.name}</span>
                        <div className="flex-1 bg-[#E9E7F0] rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(m.count / maxMarketCount) * 100}%`, backgroundColor: product.accent }} />
                        </div>
                        <span className="text-[11px] font-medium text-foreground w-8 text-right">{m.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Pain Points */}
                <div className="bg-card rounded-[20px] p-4 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground text-sm mb-3">Top Pain Points</h3>
                  <div className="flex flex-col gap-2">
                    {product.painPoints.map((p) => (
                      <div key={p} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.accent }} />
                        <span className="text-sm text-foreground flex-1">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Slack Alerts */}
                <div className="bg-card rounded-[20px] p-4 shadow-card">
                  <h3 className="font-poppins font-semibold text-foreground text-sm mb-3">Recent Slack Alerts</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${product.accent}15` }}>
                      <Bell className="w-5 h-5" style={{ color: product.accent }} />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold font-poppins" style={{ color: product.accent }}>
                        {productLeads.filter((l) => l.intentLevel === "Hot Lead").length * 2 || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Alerts this week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Leads Table */}
              <div className="bg-card rounded-[20px] p-5 shadow-card mx-6 mb-6">
                <h3 className="font-poppins font-semibold text-foreground mb-4">Recent Leads</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Contact</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Source</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Market</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Score</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Intent</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productLeads.length > 0 ? (
                        productLeads.slice(0, 5).map((lead) => (
                          <tr key={lead.id} className="border-b border-[#F5F5F5] last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{lead.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground">{lead.contactName}</td>
                            <td className="py-3"><SourceBadge source={lead.source} /></td>
                            <td className="py-3 text-sm text-muted-foreground">{lead.market}</td>
                            <td className="py-3"><ScoreBadge score={lead.leadScore} /></td>
                            <td className="py-3"><IntentBadge level={lead.intentLevel} /></td>
                            <td className="py-3"><StatusBadge status={lead.status} /></td>
                            <td className="py-3 text-sm text-muted-foreground">{lead.assignedUser}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                            No leads found for this product yet.
                          </td>
                        </tr>
                      )}
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
