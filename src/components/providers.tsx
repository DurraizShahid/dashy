"use client"

import { ThemeProvider } from "next-themes"
import { InvoiceProvider } from "@/components/crm/invoice-context"
import { HiveMindProvider } from "@/lib/hive-mind/provider"
import { HiveMindTenantProvider } from "@/lib/hive-mind/hive-mind-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <HiveMindProvider>
        <HiveMindTenantProvider>
          <InvoiceProvider>{children}</InvoiceProvider>
        </HiveMindTenantProvider>
      </HiveMindProvider>
    </ThemeProvider>
  )
}
