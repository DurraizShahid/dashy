"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  FileText,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Wifi,
  BookOpen,
  Upload,
  FolderArchive,
  Bot,
  Key,
  ScrollText,
  Cog,
  UsersRound,
  ChartNetwork,
  GitBranch,
  BrainCircuit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/use-auth"
import { UserButton } from "@clerk/nextjs"

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
  { label: "Invoices", icon: FileText, href: "/invoices" },
]

const hiveMindItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/hive-mind" },
  { label: "Health", icon: HeartPulse, href: "/hive-mind/health" },
  { label: "Services", icon: Wifi, href: "/hive-mind/services" },
  { label: "Knowledge", icon: BookOpen, href: "/hive-mind/knowledge" },
  { label: "Research Memory", icon: BrainCircuit, href: "/hive-mind/research" },
  { label: "Ingest", icon: Upload, href: "/hive-mind/ingest" },
  { label: "Documents", icon: FolderArchive, href: "/hive-mind/documents" },
  { label: "Jobs", icon: Activity, href: "/hive-mind/jobs" },
  { label: "Agents", icon: Bot, href: "/hive-mind/agents" },
  { label: "Under the Hood", icon: Cog, href: "/hive-mind/under-the-hood" },
  { label: "Departments", icon: UsersRound, href: "/hive-mind/departments" },
  { label: "Graph Memory", icon: ChartNetwork, href: "/hive-mind/graph" },
  { label: "Graph Quality", icon: GitBranch, href: "/hive-mind/graph/quality" },
]

const adminItems = [
  { label: "API Keys", icon: Key, href: "/hive-mind/admin/api-keys" },
  { label: "Audit Logs", icon: ScrollText, href: "/hive-mind/admin/audit-logs" },
]

const allItems = [...navItems, ...hiveMindItems, ...adminItems, { label: "Settings", icon: Settings, href: "/settings" }]

function findActiveHref(pathname: string): string | null {
  const path = pathname.toLowerCase()
  let best: string | null = null
  for (const item of allItems) {
    const target = item.href.toLowerCase()
    if (path === target || (target !== "/" && path.startsWith(target + "/"))) {
      if (!best || item.href.length > best.length) {
        best = item.href
      }
    }
  }
  return best
}

export function CRMSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  useAuth()

  const activeHref = useMemo(() => findActiveHref(pathname), [pathname])

  function isActive(href: string): boolean {
    return href.toLowerCase() === activeHref?.toLowerCase()
  }

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

      {/* CRM Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const itemActive = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl text-white transition-colors shrink-0",
                expanded ? "px-3 py-2.5" : "h-10 w-10 justify-center mx-auto",
                itemActive ? "bg-white/15" : "hover:bg-white/10"
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

        {/* Hive Mind section */}
        <div className={cn(
          "border-t border-white/10",
          expanded ? "mx-0 mt-2 mb-1" : "mx-2 mt-2 mb-1"
        )} />

        {/* Hive Mind section label */}
        {expanded && (
          <span className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Hive Mind
          </span>
        )}

        {/* Hive Mind items */}
        {hiveMindItems.map((item) => {
          const itemActive = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl transition-colors shrink-0",
                expanded ? "px-3 py-2.5" : "h-10 w-10 justify-center mx-auto",
                itemActive
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
              title={item.label}
            >
              <item.icon className={cn("shrink-0", expanded ? "h-4 w-4" : "h-5 w-5")} />
              {expanded && (
                <span className="text-xs font-medium truncate">{item.label}</span>
              )}
            </Link>
          )
        })}

        {/* Admin section divider */}
        <div className={cn(
          "border-t border-white/10",
          expanded ? "mx-0 mt-2 mb-1" : "mx-2 mt-2 mb-1"
        )} />

        {/* Admin section label */}
        {expanded && (
          <span className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Admin
          </span>
        )}

        {/* Admin items */}
        {adminItems.map((item) => {
          const itemActive = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl transition-colors shrink-0",
                expanded ? "px-3 py-2.5" : "h-10 w-10 justify-center mx-auto",
                itemActive
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
              title={item.label}
            >
              <item.icon className={cn("shrink-0", expanded ? "h-4 w-4" : "h-5 w-5")} />
              {expanded && (
                <span className="text-xs font-medium truncate">{item.label}</span>
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
            isActive("/settings") ? "bg-white/15" : "hover:bg-white/10"
          )}
          title="Settings"
        >
          <Settings className="h-5 w-5 shrink-0" />
          {expanded && <span className="text-sm font-medium">Settings</span>}
        </Link>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white overflow-hidden">
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  )
}
