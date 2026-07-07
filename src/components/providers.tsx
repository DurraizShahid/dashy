"use client"

import { ThemeProvider } from "next-themes"
import { InvoiceProvider } from "@/components/crm/invoice-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <InvoiceProvider>{children}</InvoiceProvider>
    </ThemeProvider>
  )
}
