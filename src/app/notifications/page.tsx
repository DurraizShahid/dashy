"use client"

import { CRMShell } from "@/components/crm/crm-shell"
import { CRMTopbar } from "@/components/crm/crm-topbar"

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`relative rounded-full w-10 h-5 ${
        on ? "bg-[#7060B8]" : "bg-[#E9E7F0]"
      }`}
    >
      <div
        className={`absolute top-0.5 size-4 rounded-full bg-card transition-transform ${
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
    <CRMShell>
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
        <CRMTopbar title="Notifications" subtitle="Slack notification rules and routing" />

        <div className="px-6 mb-6 space-y-4">
          <div className="bg-card rounded-[20px] p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-sm text-foreground mb-4">Slack Integration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground">Enable Slack notifications</span>
                <Toggle on={true} />
              </div>
              <div className="py-2">
                <label className="text-sm text-foreground block mb-2">Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full rounded-[12px] bg-muted border border-border px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[20px] p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-sm text-foreground mb-4">Alert Rules</h3>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground">Send hot leads only</span>
                <Toggle on={true} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground">Send warm leads</span>
                <Toggle on={false} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground">Send review queue alerts</span>
                <Toggle on={true} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground">Send daily digest</span>
                <Toggle on={true} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground">Min score to send</span>
                <span className="text-sm text-muted-foreground">60</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">Min score for hot lead</span>
                <span className="text-sm text-muted-foreground">80</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[20px] p-5 shadow-card">
            <h3 className="font-poppins font-semibold text-sm text-foreground mb-4">Channel Routing</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Product</th>
                    <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {channelRouting.length > 0 ? (
                    channelRouting.map((row) => (
                    <tr key={row.product} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">{row.product}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.channel}</td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                        No channel routing configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </CRMShell>
  )
}
