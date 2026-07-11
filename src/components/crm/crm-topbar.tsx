"use client"

import { Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/use-auth"

interface CRMTopbarProps {
  title: string
  subtitle?: string
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="size-8" />
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex size-8 items-center justify-center rounded-lg border border-input bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}

export function CRMTopbar({ title, subtitle }: CRMTopbarProps) {
  const { session } = useAuth()

  const initials = (() => {
    const name = session?.name || session?.preferredUsername || session?.email || ""
    if (!name) return "?"
    const parts = name.split(/[\s.@]+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  })()

  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div>
        <p className="text-xs text-muted-foreground">
          HelpTribe CRM
        </p>
        <h1 className="font-poppins text-lg font-semibold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search leads..."
            className={cn(
              "h-8 w-56 rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          />
        </div>

        <ThemeToggle />

        <div
          className="flex size-8 items-center justify-center rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: "var(--crm-purple)" }}
          title={session?.name || session?.email || "User"}
        >
          {initials}
        </div>
      </div>
    </div>
  )
}
