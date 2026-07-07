"use client"

import { InvoiceProvider } from "@/components/crm/invoice-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <InvoiceProvider>{children}</InvoiceProvider>
}
