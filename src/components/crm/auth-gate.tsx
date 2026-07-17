"use client"

import Link from "next/link"
import { ShieldAlert, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/use-auth"

interface AuthGateProps {
  children: React.ReactNode
  authMessage?: string
}

export function AuthGate({ children, authMessage = "Sign in to access this page." }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking authentication...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="rounded-[20px] bg-card p-6 shadow-card max-w-md text-center">
          <ShieldAlert className="size-8 mx-auto text-amber-500 mb-3" />
          <h3 className="font-poppins font-semibold text-foreground mb-1">
            Authentication Required
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {authMessage}
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
