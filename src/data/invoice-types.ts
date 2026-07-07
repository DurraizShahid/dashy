export type InvoiceType = "invoice" | "receipt" | "quotation"

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_received"
  | "balance_received"
  | "closed"

export type PaymentType = "full" | "partial"

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoiceRecord {
  id: string
  type: InvoiceType
  number: string
  status: InvoiceStatus
  date: string
  dueDate: string
  clientName: string
  clientEmail: string
  clientAddress: string
  companyName: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
  paymentType?: PaymentType
  amountPaid?: number
  relatedInvoiceId?: string
  createdAt: string
}
