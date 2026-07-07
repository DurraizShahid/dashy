"use client"

import { Moon, Search, Sun, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { useSyncExternalStore } from "react"
import { useAuth } from "@/lib/auth/use-auth"

interface CRMTopbarProps {
  title: string
  subtitle?: string
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Hydration-safe check: returns true on client, false on server
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

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

function UserMenu() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth()

  if (isLoading) {
    return <div className="size-8 rounded-full bg-muted animate-pulse" />
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="flex size-8 items-center justify-center rounded-lg border border-input bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Sign in"
      >
        <User className="size-4" />
      </button>
    )
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "?"

  return (
    <div className="relative group">
      <button
        className="flex size-8 items-center justify-center rounded-full text-xs font-medium text-white transition-opacity hover:opacity-80"
        style={{ backgroundColor: "var(--crm-purple)" }}
        title={user?.name || user?.email || "User"}
      >
        {initials}
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-card border border-input shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        <div className="p-3 border-b border-border">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.name || "User"}
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          )}
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-b-xl"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function CRMTopbar({ title, subtitle }: CRMTopbarProps) {
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
        <UserMenu />
      </div>
    </div>
  )
}
