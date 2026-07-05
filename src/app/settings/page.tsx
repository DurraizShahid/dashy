"use client"

import Link from "next/link"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"

const products = [
  { name: "Dilivygo", enabled: true },
  { name: "Marlin", enabled: true },
  { name: "Terro", enabled: true },
  { name: "Haigo", enabled: true },
]

const markets = [
  { name: "USA", enabled: true },
  { name: "UK", enabled: true },
  { name: "Australia", enabled: true },
  { name: "GCC", enabled: true },
  { name: "Other", enabled: true },
]

const scoringRules = [
  { rule: "Correct product match", points: "+20" },
  { rule: "Target market match", points: "+15" },
  { rule: "Clear pain point", points: "+20" },
  { rule: "Business info available", points: "+15" },
  { rule: "Decision-maker found", points: "+15" },
  { rule: "Multi-location", points: "+10" },
  { rule: "Recent activity", points: "+5" },
]

const intentThresholds = [
  { label: "Hot", operator: ">=", value: "80" },
  { label: "Warm", operator: ">=", value: "60" },
  { label: "Pain Signal", operator: ">=", value: "40" },
  { label: "Low Intent", operator: "<", value: "40" },
]

const duplicateRules = [
  { rule: "source + source_url" },
  { rule: "company + country + city" },
  { rule: "website" },
  { rule: "phone" },
  { rule: "email" },
  { rule: "LinkedIn URL" },
]

export default function SettingsPage() {
  return (
    <div className="bg-[#C4CBDE] h-screen overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
        <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="Settings" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Settings" subtitle="Configure your CRM preferences" />

              <div className="px-6 mb-6 space-y-4">
                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Products</h3>
                  {products.map((p) => (
                    <div key={p.name} className="flex justify-between items-center py-2 border-b border-[#E9E7F0] last:border-0">
                      <span className="text-sm text-[#28243D]">{p.name}</span>
                      <span className="text-sm text-[#2E7D32]">[x]</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Markets</h3>
                  {markets.map((m) => (
                    <div key={m.name} className="flex justify-between items-center py-2 border-b border-[#E9E7F0] last:border-0">
                      <span className="text-sm text-[#28243D]">{m.name}</span>
                      <span className="text-sm text-[#2E7D32]">[x]</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Lead Scoring Rules</h3>
                  {scoringRules.map((r) => (
                    <div key={r.rule} className="flex justify-between py-2 border-b border-[#E9E7F0] last:border-0">
                      <span className="text-sm text-[#28243D]">{r.rule}</span>
                      <span className="text-sm text-[#7B7592]">{r.points}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Intent Thresholds</h3>
                  {intentThresholds.map((t) => (
                    <div key={t.label} className="flex justify-between py-2 border-b border-[#E9E7F0] last:border-0">
                      <span className="text-sm text-[#28243D]">{t.label}</span>
                      <span className="text-sm text-[#7B7592]">{t.operator}{t.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Duplicate Rules</h3>
                  {duplicateRules.map((d) => (
                    <div key={d.rule} className="flex justify-between py-2 border-b border-[#E9E7F0] last:border-0">
                      <span className="text-sm text-[#28243D]">{d.rule}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Notification Settings</h3>
                  <div className="py-2">
                    <Link href="/notifications" className="text-[#7060B8] text-sm font-medium hover:underline">
                      Configure in Notifications page {'>'}
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">API Settings</h3>
                  <div className="space-y-3">
                    <div className="py-2 border-b border-[#E9E7F0]">
                      <label className="text-sm text-[#28243D] block mb-2">API Key</label>
                      <input
                        type="password"
                        placeholder="Enter your API key"
                        className="w-full rounded-[12px] bg-[#F7F7F8] border border-[#E9E7F0] px-3 py-2 text-sm text-[#28243D] outline-none placeholder:text-[#7B7592]"
                      />
                    </div>
                    <div className="py-2">
                      <label className="text-sm text-[#28243D] block mb-2">Lead Ingestion Endpoint</label>
                      <div className="rounded-[12px] bg-[#F7F7F8] border border-[#E9E7F0] px-3 py-2">
                        <p className="text-xs text-[#7B7592]">POST /api/leads/ingest</p>
                        <p className="text-xs text-[#7B7592] mt-1">Content-Type: application/json</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
