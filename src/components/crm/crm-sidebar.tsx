"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Package,
  Globe,
  Building2,
  Contact,
  Activity,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Leads", icon: Users, href: "/leads" },
  { label: "Products", icon: Package, href: "/products" },
  { label: "Sources", icon: Globe, href: "/sources" },
  { label: "Companies", icon: Building2, href: "/companies" },
  { label: "Contacts", icon: Contact, href: "/contacts" },
  { label: "Scraper Runs", icon: Activity, href: "/scraper-runs" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
]

interface CRMSidebarProps {
  activeItem: string
}

export function CRMSidebar({ activeItem }: CRMSidebarProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[26px] bg-gradient-to-b from-[#7060B8] to-[#504098] py-5 transition-all duration-300 shrink-0",
        expanded ? "w-[200px] px-3" : "w-[68px] px-2"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "mb-5 flex items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white shrink-0",
        expanded ? "h-10 w-full" : "h-10 w-10 mx-auto"
      )}>
        {expanded ? "HelpTribe" : "HT"}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeItem === item.label.toLowerCase()
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl text-white transition-colors shrink-0",
                expanded ? "px-3 py-2.5" : "h-10 w-10 justify-center mx-auto",
                isActive ? "bg-white/15" : "hover:bg-white/10"
              )}
              title={item.label}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {expanded && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center gap-3 shrink-0 pt-3 border-t border-white/10">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl text-white transition-colors",
            expanded ? "px-3 py-2.5 w-full" : "h-10 w-10 justify-center",
            activeItem === "settings" ? "bg-white/15" : "hover:bg-white/10"
          )}
          title="Settings"
        >
          <Settings className="h-5 w-5 shrink-0" />
          {expanded && <span className="text-sm font-medium">Settings</span>}
        </Link>

        {/* Expand/Collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
          AJ
        </div>
      </div>
    </div>
  )
}
