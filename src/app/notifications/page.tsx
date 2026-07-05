"use client"

import Link from "next/link"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`relative rounded-full w-10 h-5 ${
        on ? "bg-[#7060B8]" : "bg-[#E9E7F0]"
      }`}
    >
      <div
        className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </div>
  )
}

const channelRouting = [
  { product: "Dilivygo", channel: "#leads-dilivygo" },
  { product: "Marlin", channel: "#leads-marlin" },
  { product: "Terro", channel: "#leads-terro" },
  { product: "Haigo", channel: "#leads-haigo" },
  { product: "Review", channel: "#leads-review" },
  { product: "Errors", channel: "#lead-system-alerts" },
  { product: "Hot Leads", channel: "#hot-leads" },
]

export default function NotificationsPage() {
  return (
    <div className="bg-[#C4CBDE] h-screen overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
        <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="Notifications" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Notifications" subtitle="Slack notification rules and routing" />

              <div className="px-6 mb-6 space-y-4">
                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Slack Integration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-[#E9E7F0]">
                      <span className="text-sm text-[#28243D]">Enable Slack notifications</span>
                      <Toggle on={true} />
                    </div>
                    <div className="py-2">
                      <label className="text-sm text-[#28243D] block mb-2">Webhook URL</label>
                      <input
                        type="text"
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full rounded-[12px] bg-[#F7F7F8] border border-[#E9E7F0] px-3 py-2 text-sm text-[#28243D] outline-none placeholder:text-[#7B7592]"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Alert Rules</h3>
                  <div className="space-y-0">
                    <div className="flex items-center justify-between py-2 border-b border-[#E9E7F0]">
                      <span className="text-sm text-[#28243D]">Send hot leads only</span>
                      <Toggle on={true} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E9E7F0]">
                      <span className="text-sm text-[#28243D]">Send warm leads</span>
                      <Toggle on={false} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E9E7F0]">
                      <span className="text-sm text-[#28243D]">Send review queue alerts</span>
                      <Toggle on={true} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E9E7F0]">
                      <span className="text-sm text-[#28243D]">Send daily digest</span>
                      <Toggle on={true} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E9E7F0]">
                      <span className="text-sm text-[#28243D]">Min score to send</span>
                      <span className="text-sm text-[#7B7592]">60</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-[#28243D]">Min score for hot lead</span>
                      <span className="text-sm text-[#7B7592]">80</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[20px] p-5 shadow-card">
                  <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">Channel Routing</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#F7F7F8]">
                          <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Product</th>
                          <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Channel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {channelRouting.map((row) => (
                          <tr key={row.product} className="border-b border-[#E9E7F0] hover:bg-[#F7F7F8] transition-colors">
                            <td className="px-4 py-3 text-sm text-[#28243D] font-medium">{row.product}</td>
                            <td className="px-4 py-3 text-sm text-[#7B7592]">{row.channel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
