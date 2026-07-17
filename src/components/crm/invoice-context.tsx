"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { InvoiceRecord, InvoiceStatus } from "@/data/invoice-types"
import { mockInvoices } from "@/data/mock-invoices"

interface InvoiceContextType {
  invoices: InvoiceRecord[]
  addInvoice: (inv: InvoiceRecord) => void
  updateStatus: (id: string, status: InvoiceStatus) => void
  getInvoice: (id: string) => InvoiceRecord | undefined
}

const InvoiceContext = createContext<InvoiceContextType | null>(null)

const STORAGE_KEY = "helptribe_invoices"

function loadInvoices(): InvoiceRecord[] {
  if (typeof window === "undefined") return mockInvoices
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as InvoiceRecord[]
      if (parsed.length > 0) return parsed
    }
  } catch {}
  return mockInvoices
}

function saveInvoices(invoices: InvoiceRecord[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  } catch {}
}

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(mockInvoices)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvoices(loadInvoices())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveInvoices(invoices)
  }, [invoices, loaded])

  const addInvoice = useCallback((inv: InvoiceRecord) => {
    setInvoices((prev) => [inv, ...prev])
  }, [])

  const updateStatus = useCallback((id: string, status: InvoiceStatus) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)))
  }, [])

  const getInvoice = useCallback((id: string) => {
    return invoices.find((inv) => inv.id === id)
  }, [invoices])

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, updateStatus, getInvoice }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoices() {
  const ctx = useContext(InvoiceContext)
  if (!ctx) throw new Error("useInvoices must be used within InvoiceProvider")
  return ctx
}
