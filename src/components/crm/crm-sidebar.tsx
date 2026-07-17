"use client"

import { useState, useMemo, useEffect, type ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  UserPlus,
  Contact,
  Building2,
  ShoppingBag,
  Globe,
  RefreshCw,
  BarChart3,
  Receipt,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Wifi,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  Upload,
  FolderArchive,
  Briefcase,
  Bot,
  Cog,
  UsersRound,
  Users,
  ChartNetwork,
  Gauge,
  Flame,
  ClipboardCheck,
  Copy,
  Key,
  ScrollText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserButton } from "@clerk/nextjs"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Leads", icon: UserPlus, href: "/leads" },
  { label: "Hot Leads", icon: Flame, href: "/leads/hot", indent: true },
  { label: "Review Queue", icon: ClipboardCheck, href: "/leads/review", indent: true },
  { label: "Duplicates", icon: Copy, href: "/leads/duplicates", indent: true },
  { label: "Contacts", icon: Contact, href: "/contacts" },
  { label: "Companies", icon: Building2, href: "/companies" },
  { label: "Products", icon: ShoppingBag, href: "/products" },
  { label: "Lead Sources", icon: Globe, href: "/sources" },
  { label: "Scraper Runs", icon: RefreshCw, href: "/scraper-runs" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Invoices", icon: Receipt, href: "/invoices" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
]

const hiveMindItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/hive-mind" },
  { label: "Health", icon: HeartPulse, href: "/hive-mind/health" },
  { label: "Services", icon: Wifi, href: "/hive-mind/services" },
  { label: "Knowledge", icon: BookOpen, href: "/hive-mind/knowledge" },
  { label: "Research Memory", icon: BrainCircuit, href: "/hive-mind/research" },
  { label: "Research Schedules", icon: CalendarClock, href: "/hive-mind/research/schedules" },
  { label: "Ingest", icon: Upload, href: "/hive-mind/ingest" },
  { label: "Documents", icon: FolderArchive, href: "/hive-mind/documents" },
  { label: "Jobs", icon: Briefcase, href: "/hive-mind/jobs" },
  { label: "Agents", icon: Bot, href: "/hive-mind/agents" },
  { label: "Configuration", icon: Cog, href: "/hive-mind/under-the-hood" },
  { label: "Departments", icon: UsersRound, href: "/hive-mind/departments" },
  { label: "Employees", icon: Users, href: "/hive-mind/employees" },
  { label: "Graph Memory", icon: ChartNetwork, href: "/hive-mind/graph" },
  { label: "Graph Quality", icon: Gauge, href: "/hive-mind/graph/quality" },
  { label: "Graph Entities", icon: ChartNetwork, href: "/hive-mind/graph/entities", indent: true },
  { label: "Hive Mind Settings", icon: Settings, href: "/hive-mind/settings" },
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

const authRoutes = ["/sign-in", "/sign-up", "/login"]

export function CRMSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem("crm_sidebar_expanded")
    if (stored !== null) return stored === "true"
    return false
  })
  useEffect(() => {
    localStorage.setItem("crm_sidebar_expanded", String(expanded))
  }, [expanded])

  // Cmd+B / Ctrl+B keyboard shortcut to toggle sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setExpanded((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Focus first nav link after expanding
  useEffect(() => {
    if (expanded) {
      const firstLink = document.querySelector<HTMLAnchorElement>("#crm-sidebar [aria-label]")
      firstLink?.focus()
    }
  }, [expanded])

  // Scroll active item into view on route change
  useEffect(() => {
    const el = document.querySelector('[aria-current="page"]')
    if (el) {
      el.scrollIntoView({ block: "nearest" })
    }
  }, [pathname])

  // Don't render the sidebar on auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return null
  }

  const activeHref = useMemo(() => findActiveHref(pathname), [pathname])

  function isActive(href: string): boolean {
    return href.toLowerCase() === activeHref?.toLowerCase()
  }

  function renderSectionHeading(label: string) {
    return (
      <h2 className={cn(
        "px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/50",
        !expanded && "sr-only"
      )}>
        {label}
      </h2>
    )
  }

  function renderNavItem(
    item: { label: string; icon: ComponentType<{ className?: string }>; href: string; indent?: boolean },
    variant: "crm" | "hive-mind" | "admin"
  ) {
    const itemActive = isActive(item.href)
    const isHiveMindAdmin = variant === "hive-mind" || variant === "admin"

    const hasActiveChild =
      !itemActive &&
      activeHref &&
      activeHref.toLowerCase().startsWith(item.href.toLowerCase() + "/")

    return (
      <li role="listitem" className={cn("shrink-0", !expanded && "flex justify-center")}>
        <Link
          key={item.href}
          href={item.href}
          aria-current={itemActive ? "page" : undefined}
          aria-label={item.label}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-colors shrink-0 relative",
            expanded
              ? cn("px-3 py-2.5 w-full", item.indent && "pl-8")
              : "h-10 w-10 justify-center mx-auto",
            itemActive
              ? "bg-white/15 text-white"
              : isHiveMindAdmin
                ? "text-white/80 hover:bg-white/10 hover:text-white"
                : "text-white hover:bg-white/10"
          )}
          title={item.label}
        >
          <item.icon className={cn("shrink-0", expanded && isHiveMindAdmin ? "h-4 w-4" : "h-5 w-5")} />
          {expanded && (
            <span className={cn("font-medium truncate", isHiveMindAdmin ? "text-xs" : "text-sm")}>
              {item.label}
            </span>
          )}
          {hasActiveChild && !expanded && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white/60" />
          )}
        </Link>
      </li>
    )
  }

  return (
    <aside
      id="crm-sidebar"
      aria-label="Sidebar"
      className={cn(
        "flex h-full flex-col rounded-[26px] bg-gradient-to-b from-[#7060B8] to-[#504098] py-5 transition-all duration-300 shrink-0",
        expanded ? "w-[200px] px-3" : "w-[68px] px-2"
      )}
    >
      {/* Logo — link to dashboard */}
      <Link
        href="/dashboard"
        aria-label="HelpTribe"
        className={cn(
          "mb-5 flex items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white shrink-0",
          expanded ? "h-10 w-full" : "h-10 w-10 mx-auto"
        )}
      >
        {expanded ? "HelpTribe" : "HT"}
      </Link>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        {/* CRM section */}
        {renderSectionHeading("CRM")}

        <ul role="list" className="flex flex-col gap-1">
          {navItems.map((item) => (
            <div key={item.href}>
              {renderNavItem(item, "crm")}
            </div>
          ))}
        </ul>

        {/* Hive Mind section */}
        <div className={cn(
          "border-t border-white/10",
          expanded ? "mx-0 mt-2 mb-1" : "mx-2 mt-2 mb-1"
        )} />

        {renderSectionHeading("Hive Mind")}

        <ul role="list" className="flex flex-col gap-1">
          {hiveMindItems.map((item) => renderNavItem(item, "hive-mind"))}
        </ul>

        {/* Admin section divider */}
        <div className={cn(
          "border-t border-white/10",
          expanded ? "mx-0 mt-2 mb-1" : "mx-2 mt-2 mb-1"
        )} />

        {renderSectionHeading("Admin")}

        <ul role="list" className="flex flex-col gap-1">
          {adminItems.map((item) => renderNavItem(item, "admin"))}
        </ul>

        {/* Settings inside nav */}
        <div className={cn(
          "border-t border-white/10",
          expanded ? "mx-0 mt-2 mb-1" : "mx-2 mt-2 mb-1"
        )} />

        <ul role="list" className="flex flex-col gap-1">
          <li role="listitem" className={cn("shrink-0", !expanded && "flex justify-center")}>
            <Link
              href="/settings"
              aria-current={isActive("/settings") ? "page" : undefined}
              aria-label="Settings"
              className={cn(
                "flex items-center gap-3 rounded-xl text-white transition-colors shrink-0",
                expanded ? "px-3 py-2.5 w-full" : "h-10 w-10 justify-center mx-auto",
                isActive("/settings") ? "bg-white/15" : "hover:bg-white/10"
              )}
              title="Settings"
            >
              <Settings className="h-5 w-5 shrink-0" />
              {expanded && <span className="text-sm font-medium">Settings</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center gap-3 shrink-0 pt-3 border-t border-white/10">
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="crm-sidebar"
          aria-keyshortcuts="Meta+b Control+b"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white overflow-hidden">
            <UserButton />
          </div>
        </div>
      </div>
    </aside>
  )
}
