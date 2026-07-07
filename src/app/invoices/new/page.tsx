"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Receipt,
  ScrollText,
  Download,
} from "lucide-react"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { useInvoices } from "@/components/crm/invoice-context"
import { mockInvoices } from "@/data/mock-invoices"
import type { InvoiceType, InvoiceItem, PaymentType, InvoiceRecord } from "@/data/invoice-types"

const typeLabels: Record<InvoiceType, string> = {
  invoice: "Invoice",
  receipt: "Receipt",
  quotation: "Quotation",
}
const typeIcons: Record<InvoiceType, typeof FileText> = {
  invoice: FileText,
  receipt: Receipt,
  quotation: ScrollText,
}
const typeColors: Record<InvoiceType, string> = {
  invoice: "bg-[#7060B8]",
  receipt: "bg-green-600",
  quotation: "bg-amber-500",
}

export default function NewInvoicePageWrapper() {
  return (
    <Suspense fallback={
      <div className="bg-[#C4CBDE] h-screen overflow-hidden flex items-center justify-center">
        <div className="text-[#7B7592] text-sm">Loading...</div>
      </div>
    }>
      <NewInvoicePage />
    </Suspense>
  )
}

function NewInvoicePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addInvoice } = useInvoices()
  const initialType = (searchParams.get("type") as InvoiceType) || "invoice"

  const [docType, setDocType] = useState<InvoiceType>(initialType)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ])
  const [taxRate, setTaxRate] = useState(5)
  const [notes, setNotes] = useState("")
  const [paymentType, setPaymentType] = useState<PaymentType>("full")
  const [relatedInvoiceId, setRelatedInvoiceId] = useState("")
  const [generated, setGenerated] = useState(false)
  const [generatedNumber, setGeneratedNumber] = useState("")

  useEffect(() => {
    const t = searchParams.get("type") as InvoiceType
    if (t && ["invoice", "receipt", "quotation"].includes(t)) setDocType(t)
  }, [searchParams])

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ])
  }

  function removeItem(id: string) {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function updateItem(id: string, field: keyof InvoiceItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.amount = updated.quantity * updated.unitPrice
        }
        return updated
      })
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount
  const partialAmount = total / 2

  function generateNumber() {
    const prefix = docType === "invoice" ? "INV" : docType === "receipt" ? "RCT" : "QT"
    const num = String(Math.floor(Math.random() * 900) + 100)
    return `${prefix}-2026-${num}`
  }

  function handleGenerate() {
    const number = generateNumber()
    setGeneratedNumber(number)
    setGenerated(true)

    const newRecord: InvoiceRecord = {
      id: `${docType === "invoice" ? "inv" : docType === "receipt" ? "rcv" : "qt"}_${Date.now()}`,
      type: docType,
      number,
      status: "draft",
      date,
      dueDate: dueDate || date,
      clientName: clientName || "Untitled Client",
      clientEmail,
      clientAddress,
      companyName: "HelpTribe Technologies",
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      notes,
      paymentType: docType === "receipt" ? paymentType : undefined,
      amountPaid: docType === "receipt" ? (paymentType === "partial" ? partialAmount : total) : undefined,
      relatedInvoiceId: docType === "receipt" ? relatedInvoiceId || undefined : undefined,
      createdAt: new Date().toISOString(),
    }
    addInvoice(newRecord)
  }

  function downloadPdf() {
    const typeLabel = typeLabels[docType].toUpperCase()
    const lines: string[] = []
    lines.push(typeLabel)
    lines.push("========================================")
    lines.push("")
    lines.push(`Number: ${generatedNumber}`)
    lines.push(`Date: ${date}`)
    lines.push(`Due: ${dueDate || "N/A"}`)
    lines.push("")
    lines.push("FROM:")
    lines.push("HelpTribe Technologies")
    lines.push("")
    lines.push("TO:")
    lines.push(clientName)
    lines.push(clientAddress)
    lines.push(clientEmail)
    lines.push("")
    lines.push("----------------------------------------")
    lines.push("ITEMS")
    lines.push("----------------------------------------")
    items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.description || "Untitled item"}`)
      lines.push(
        `   Qty: ${item.quantity} x $${item.unitPrice.toLocaleString()} = $${item.amount.toLocaleString()}`
      )
    })
    lines.push("")
    lines.push(`Subtotal:  $${subtotal.toLocaleString()}`)
    if (taxRate > 0) lines.push(`Tax (${taxRate}%):  $${taxAmount.toLocaleString()}`)
    lines.push(`TOTAL:     $${total.toLocaleString()}`)

    if (docType === "receipt") {
      lines.push("")
      lines.push(`Payment Type: ${paymentType === "partial" ? "Partial (50%)" : "Full"}`)
      lines.push(`Amount Paid:  $${paymentType === "partial" ? partialAmount.toLocaleString() : total.toLocaleString()}`)
      lines.push(`Balance Due:  $${paymentType === "partial" ? (total - partialAmount).toLocaleString() : "0"}`)
      if (relatedInvoiceId) {
        lines.push(`Related Invoice: ${relatedInvoiceId}`)
      }
    }

    if (notes) {
      lines.push("")
      lines.push("NOTES:")
      lines.push(notes)
    }
    lines.push("")
    lines.push("========================================")
    lines.push("Generated by HelpTribe CRM")

    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${generatedNumber}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#C4CBDE] h-screen overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
        <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="invoices" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar
                title={`New ${typeLabels[docType]}`}
                subtitle={`Create a new ${typeLabels[docType].toLowerCase()} document`}
              />

              <div className="px-6 pb-4">
                {/* Back link */}
                <button
                  onClick={() => router.push("/invoices")}
                  className="flex items-center gap-2 text-sm text-[#7060B8] hover:underline mb-4"
                >
                  <ArrowLeft className="size-4" />
                  Back to Invoices
                </button>

                {/* Type selector */}
                <div className="flex gap-3 mb-6">
                  {(["invoice", "receipt", "quotation"] as const).map((t) => {
                    const Icon = typeIcons[t]
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          setDocType(t)
                          setGenerated(false)
                          router.push(`/invoices/new?type=${t}`)
                        }}
                        className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                          docType === t
                            ? `${typeColors[t]} text-white shadow-soft`
                            : "bg-[#F0EDF6] text-[#4D4764] hover:bg-[#E9E7F0]"
                        }`}
                      >
                        <Icon className="size-4" />
                        {typeLabels[t]}
                      </button>
                    )
                  })}
                </div>

                {generated ? (
                  /* Success state */
                  <div className="rounded-[20px] border border-green-200 bg-green-50 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <FileText className="size-8 text-green-600" />
                    </div>
                    <h2 className="font-poppins font-semibold text-xl text-[#28243D]">
                      {typeLabels[docType]} Created Successfully
                    </h2>
                    <p className="text-[#7B7592] mt-2">
                      Number: <span className="font-semibold text-[#28243D]">{generatedNumber}</span>
                    </p>
                    <p className="text-[#7B7592] mt-1">
                      Total: <span className="font-semibold text-[#28243D]">${total.toLocaleString()}</span>
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <button
                        onClick={downloadPdf}
                        className="flex items-center gap-2 rounded-xl bg-[#7060B8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#504098] transition-colors"
                      >
                        <Download className="size-4" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => router.push("/invoices")}
                        className="flex items-center gap-2 rounded-xl bg-white border border-[#E9E7F0] px-5 py-2.5 text-sm font-medium text-[#4D4764] hover:bg-[#F7F7F8] transition-colors"
                      >
                        View All {typeLabels[docType]}s
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <div className="space-y-6">
                    {/* Client info */}
                    <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                      <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">
                        {typeLabels[docType]} Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#4D4764] mb-1">Client Name</label>
                          <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full rounded-xl border border-[#E9E7F0] px-3 py-2.5 text-sm text-[#28243D] placeholder:text-[#B0ACC4] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4D4764] mb-1">Client Email</label>
                          <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="e.g. finance@company.com"
                            className="w-full rounded-xl border border-[#E9E7F0] px-3 py-2.5 text-sm text-[#28243D] placeholder:text-[#B0ACC4] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-[#4D4764] mb-1">Client Address</label>
                          <input
                            type="text"
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                            placeholder="e.g. Dubai, UAE"
                            className="w-full rounded-xl border border-[#E9E7F0] px-3 py-2.5 text-sm text-[#28243D] placeholder:text-[#B0ACC4] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4D4764] mb-1">Date</label>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl border border-[#E9E7F0] px-3 py-2.5 text-sm text-[#28243D] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4D4764] mb-1">Due Date</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-xl border border-[#E9E7F0] px-3 py-2.5 text-sm text-[#28243D] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Receipt-specific: payment type + related invoice */}
                    {docType === "receipt" && (
                      <div className="rounded-[20px] border border-green-200 bg-green-50 p-5">
                        <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-4">
                          Payment Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[#4D4764] mb-1">Payment Type</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setPaymentType("full")}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                                  paymentType === "full"
                                    ? "bg-green-600 text-white"
                                    : "bg-white border border-[#E9E7F0] text-[#4D4764] hover:bg-[#F7F7F8]"
                                }`}
                              >
                                Full Payment (${total.toLocaleString()})
                              </button>
                              <button
                                onClick={() => setPaymentType("partial")}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                                  paymentType === "partial"
                                    ? "bg-amber-500 text-white"
                                    : "bg-white border border-[#E9E7F0] text-[#4D4764] hover:bg-[#F7F7F8]"
                                }`}
                              >
                                Partial 50% (${partialAmount.toLocaleString()})
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#4D4764] mb-1">Related Invoice</label>
                            <select
                              value={relatedInvoiceId}
                              onChange={(e) => setRelatedInvoiceId(e.target.value)}
                              className="w-full rounded-xl border border-[#E9E7F0] px-3 py-2.5 text-sm text-[#28243D] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                            >
                              <option value="">Select invoice (optional)</option>
                              {mockInvoices
                                .filter((inv) => inv.type === "invoice")
                                .map((inv) => (
                                  <option key={inv.id} value={inv.id}>
                                    {inv.number} - ${inv.total.toLocaleString()}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div className="mt-3 rounded-xl bg-white border border-green-200 p-3 text-sm">
                          <span className="text-[#4D4764]">
                            Amount to receive:{" "}
                          </span>
                          <span className="font-semibold text-[#28243D]">
                            ${paymentType === "partial" ? partialAmount.toLocaleString() : total.toLocaleString()}
                          </span>
                          {paymentType === "partial" && (
                            <span className="text-amber-600 ml-2">
                              (Remaining ${(total - partialAmount).toLocaleString()} due)
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Line items */}
                    <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-poppins font-semibold text-sm text-[#28243D]">Line Items</h3>
                        <button
                          onClick={addItem}
                          className="flex items-center gap-1.5 rounded-lg bg-[#F0EDF6] px-3 py-1.5 text-xs font-medium text-[#7060B8] hover:bg-[#E9E7F0] transition-colors"
                        >
                          <Plus className="size-3" />
                          Add Item
                        </button>
                      </div>
                      <div className="space-y-3">
                        {items.map((item, idx) => (
                          <div key={item.id} className="flex items-start gap-3">
                            <span className="mt-2.5 text-xs text-[#B0ACC4] w-5">{idx + 1}.</span>
                            <div className="flex-1 grid grid-cols-[1fr_80px_100px_100px_40px] gap-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                placeholder="Item description"
                                className="rounded-lg border border-[#E9E7F0] px-3 py-2 text-sm text-[#28243D] placeholder:text-[#B0ACC4] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                              />
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                                className="rounded-lg border border-[#E9E7F0] px-3 py-2 text-sm text-[#28243D] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                                className="rounded-lg border border-[#E9E7F0] px-3 py-2 text-sm text-[#28243D] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                              />
                              <div className="rounded-lg bg-[#F7F7F8] px-3 py-2 text-sm font-medium text-[#28243D] flex items-center">
                                ${item.amount.toLocaleString()}
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="mt-2 rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                      <div className="flex justify-end">
                        <div className="w-80 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#7B7592]">Subtotal</span>
                            <span className="font-medium text-[#28243D]">${subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#7B7592]">Tax Rate (%)</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={taxRate}
                              onChange={(e) => setTaxRate(Number(e.target.value))}
                              className="w-20 rounded-lg border border-[#E9E7F0] px-2 py-1 text-sm text-right text-[#28243D] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30"
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#7B7592]">Tax ({taxRate}%)</span>
                            <span className="font-medium text-[#28243D]">${taxAmount.toLocaleString()}</span>
                          </div>
                          <div className="border-t border-[#E9E7F0] pt-2 flex justify-between">
                            <span className="font-poppins font-semibold text-[#28243D]">Total</span>
                            <span className="font-poppins font-bold text-lg text-[#7060B8]">${total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                      <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-3">Notes</h3>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional notes or terms..."
                        rows={3}
                        className="w-full rounded-xl border border-[#E9E7F0] px-3 py-2.5 text-sm text-[#28243D] placeholder:text-[#B0ACC4] focus:outline-none focus:ring-2 focus:ring-[#7060B8]/30 resize-none"
                      />
                    </div>

                    {/* Generate button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleGenerate}
                        className={`flex items-center gap-2 rounded-xl ${typeColors[docType]} px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity`}
                      >
                        <FileText className="size-4" />
                        Generate {typeLabels[docType]}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
