"use client"

import {
  PieChart,
  BarChart3,
  TrendingUp,
  Target,
  AlertTriangle,
  MessageSquare,
  Send,
  Clock,
  Trophy,
  Activity,
} from "lucide-react"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"

const reports = [
  { title: "Leads by Product", description: "Distribution of leads across product lines", icon: PieChart },
  { title: "Leads by Source", description: "Lead volume breakdown by acquisition source", icon: BarChart3 },
  { title: "Leads by Market", description: "Geographic distribution of all leads", icon: TrendingUp },
  { title: "Hot Leads by Product", description: "High-intent leads per product", icon: Target },
  { title: "Conversion Rate by Source", description: "Win rate for each lead source", icon: Activity },
  { title: "Rejected Leads by Reason", description: "Why leads were rejected or marked lost", icon: AlertTriangle },
  { title: "Top Pain Points", description: "Most frequently detected pain signals", icon: MessageSquare },
  { title: "Slack Alerts Sent", description: "Notification delivery history", icon: Send },
  { title: "Follow-ups Due", description: "Upcoming follow-up tasks and deadlines", icon: Clock },
  { title: "Won Leads by Product", description: "Closed-won deals per product line", icon: Trophy },
  { title: "Avg Score by Source", description: "Average lead score per acquisition channel", icon: BarChart3 },
  { title: "Scraper Performance", description: "Automation run success and error rates", icon: Activity },
]

export default function ReportsPage() {
  return (
    <div className="bg-background h-screen overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="Reports" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Reports" subtitle="Analytics and performance insights" />

              <div className="grid grid-cols-3 gap-4 px-6 mb-6">
                {reports.map((report) => {
                  const Icon = report.icon
                  return (
                    <div key={report.title} className="bg-card rounded-[20px] p-5 shadow-card">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[#F0EDF6] p-2.5">
                          <Icon className="size-5 text-[#7060B8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-poppins font-semibold text-sm text-foreground">{report.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                          <button className="text-[#7060B8] text-xs font-medium mt-3 hover:underline">
                            View Report
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
