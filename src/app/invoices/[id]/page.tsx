"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  ChevronDown,
  FileText,
  Receipt,
  ScrollText,
  Pencil,
  CheckCircle2,
  Clock,
  Ban,
  ArrowUpRight,
} from "lucide-react"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { useInvoices } from "@/components/crm/invoice-context"
import type { InvoiceRecord, InvoiceStatus, InvoiceType } from "@/data/invoice-types"

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100", icon: Pencil },
  sent: { label: "Sent", color: "text-blue-600", bg: "bg-blue-100", icon: ArrowUpRight },
  partially_received: { label: "Partially Received", color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
  balance_received: { label: "Balance Received", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 },
  closed: { label: "Closed", color: "text-gray-500", bg: "bg-gray-100", icon: Ban },
}

const typeConfig: Record<InvoiceType, { label: string; color: string; bg: string; icon: typeof FileText }> = {
  invoice: { label: "Invoice", color: "text-[#7060B8]", bg: "bg-[#F0EDF6]", icon: FileText },
  receipt: { label: "Receipt", color: "text-green-600", bg: "bg-green-50", icon: Receipt },
  quotation: { label: "Quotation", color: "text-amber-600", bg: "bg-amber-50", icon: ScrollText },
}

const allStatuses: InvoiceStatus[] = ["draft", "sent", "partially_received", "balance_received", "closed"]

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getInvoice, updateStatus } = useInvoices()
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const inv = getInvoice(id)

  if (!inv) {
    return (
      <div className="bg-[#C4CBDE] h-screen overflow-hidden">
        <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
          <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
            <div className="flex gap-5 h-full">
              <CRMSidebar />
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-[#7B7592]">Invoice not found.</p>
                <button onClick={() => router.push("/invoices")} className="mt-3 text-[#7060B8] text-sm hover:underline">
                  Back to Invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const current: InvoiceRecord = inv
  const tc = typeConfig[current.type]
  const sc = statusConfig[current.status]
  const TypeIcon = tc.icon
  const StatusIcon = sc.icon

  function handleUpdateStatus(newStatus: InvoiceStatus) {
    updateStatus(id, newStatus)
    setShowStatusDropdown(false)
  }

  function downloadPdf() {
    const typeLabel = current.type === "invoice" ? "INVOICE" : current.type === "receipt" ? "RECEIPT" : "QUOTATION"
    const lines: string[] = []
    lines.push(typeLabel)
    lines.push("========================================")
    lines.push("")
    lines.push(`Number: ${current.number}`)
    lines.push(`Date: ${current.date}`)
    lines.push(`Due: ${current.dueDate}`)
    lines.push(`Status: ${statusConfig[current.status].label}`)
    lines.push("")
    lines.push("FROM:")
    lines.push(current.companyName)
    lines.push("")
    lines.push("TO:")
    lines.push(current.clientName)
    lines.push(current.clientAddress)
    lines.push(current.clientEmail)
    lines.push("")
    lines.push("----------------------------------------")
    lines.push("ITEMS")
    lines.push("----------------------------------------")
    current.items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.description}`)
      lines.push(`   Qty: ${item.quantity} x $${item.unitPrice.toLocaleString()} = $${item.amount.toLocaleString()}`)
    })
    lines.push("")
    lines.push(`Subtotal:  $${current.subtotal.toLocaleString()}`)
    if (current.taxRate > 0) lines.push(`Tax (${current.taxRate}%):  $${current.taxAmount.toLocaleString()}`)
    lines.push(`TOTAL:     $${current.total.toLocaleString()}`)
    if (current.paymentType === "partial" && current.amountPaid) {
      lines.push("")
      lines.push(`Payment Type: Partial`)
      lines.push(`Amount Paid:  $${current.amountPaid.toLocaleString()}`)
      lines.push(`Balance Due:  $${(current.total - current.amountPaid).toLocaleString()}`)
    }
    if (current.paymentType === "full" && current.amountPaid) {
      lines.push("")
      lines.push(`Payment Type: Full`)
      lines.push(`Amount Paid:  $${current.amountPaid.toLocaleString()}`)
      lines.push(`Balance Due:  $0`)
    }
    if (current.notes) {
      lines.push("")
      lines.push("NOTES:")
      lines.push(current.notes)
    }
    lines.push("")
    lines.push("========================================")
    lines.push("Generated by HelpTribe CRM")

    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${current.number}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#C4CBDE] h-screen overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
        <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title={current.number} subtitle={`${tc.label} details`} />

              <div className="px-6 pb-4 space-y-4">
                <button
                  onClick={() => router.push("/invoices")}
                  className="flex items-center gap-2 text-sm text-[#7060B8] hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  Back to Invoices
                </button>

                {/* Header card */}
                <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl ${tc.bg} p-2.5`}>
                        <TypeIcon className={`size-5 ${tc.color}`} />
                      </div>
                      <div>
                        <h2 className="font-poppins font-semibold text-lg text-[#28243D]">{current.number}</h2>
                        <p className="text-sm text-[#7B7592]">{tc.label} - {current.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Status dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${sc.bg} ${sc.color} hover:opacity-80 transition-opacity cursor-pointer`}
                        >
                          <StatusIcon className="size-4" />
                          {sc.label}
                          <ChevronDown className="size-4" />
                        </button>
                        {showStatusDropdown && (
                          <div className="absolute z-20 top-full right-0 mt-1 bg-white rounded-xl shadow-elevated border border-[#E9E7F0] py-1 min-w-[200px]">
                            {allStatuses.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleUpdateStatus(s)}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F0EDF6] flex items-center gap-2 transition-colors ${
                                  current.status === s ? "font-semibold text-[#7060B8]" : "text-[#4D4764]"
                                }`}
                              >
                                <span className={`size-2 rounded-full ${statusConfig[s].bg}`} style={{ backgroundColor: current.status === s ? "#7060B8" : undefined }} />
                                {statusConfig[s].label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={downloadPdf}
                        className="flex items-center gap-2 rounded-xl bg-[#7060B8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#504098] transition-colors"
                      >
                        <Download className="size-4" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                    <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-3">Client Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-[#7B7592]">Name: </span><span className="text-[#28243D]">{current.clientName}</span></div>
                      <div><span className="text-[#7B7592]">Email: </span><span className="text-[#28243D]">{current.clientEmail}</span></div>
                      <div><span className="text-[#7B7592]">Address: </span><span className="text-[#28243D]">{current.clientAddress}</span></div>
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                    <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-3">{tc.label} Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-[#7B7592]">Date: </span><span className="text-[#28243D]">{current.date}</span></div>
                      <div><span className="text-[#7B7592]">Due Date: </span><span className="text-[#28243D]">{current.dueDate}</span></div>
                      <div><span className="text-[#7B7592]">Status: </span><span className={`font-medium ${sc.color}`}>{sc.label}</span></div>
                      {current.paymentType && (
                        <div><span className="text-[#7B7592]">Payment: </span><span className="text-[#28243D] capitalize">{current.paymentType}</span></div>
                      )}
                      {current.amountPaid != null && (
                        <div><span className="text-[#7B7592]">Amount Paid: </span><span className="text-green-600 font-medium">${current.amountPaid.toLocaleString()}</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items table */}
                <div className="rounded-[20px] border border-[#E9E7F0] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F7F7F8] border-b border-[#E9E7F0]">
                        <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-[#4D4764]">#</th>
                        <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-[#4D4764]">Description</th>
                        <th className="text-center py-3 px-4 font-poppins font-semibold text-xs text-[#4D4764]">Qty</th>
                        <th className="text-right py-3 px-4 font-poppins font-semibold text-xs text-[#4D4764]">Unit Price</th>
                        <th className="text-right py-3 px-4 font-poppins font-semibold text-xs text-[#4D4764]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current.items.map((item, idx) => (
                        <tr key={item.id} className="border-b border-[#E9E7F0] last:border-0">
                          <td className="py-3 px-4 text-[#7B7592]">{idx + 1}</td>
                          <td className="py-3 px-4 text-[#28243D]">{item.description}</td>
                          <td className="py-3 px-4 text-center text-[#4D4764]">{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-[#4D4764]">${item.unitPrice.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-medium text-[#28243D]">${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-80 rounded-[20px] border border-[#E9E7F0] p-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7B7592]">Subtotal</span>
                      <span className="text-[#28243D]">${current.subtotal.toLocaleString()}</span>
                    </div>
                    {current.taxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7B7592]">Tax ({current.taxRate}%)</span>
                        <span className="text-[#28243D]">${current.taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-[#E9E7F0] pt-2 flex justify-between">
                      <span className="font-poppins font-semibold text-[#28243D]">Total</span>
                      <span className="font-poppins font-bold text-lg text-[#7060B8]">${current.total.toLocaleString()}</span>
                    </div>
                    {current.paymentType === "partial" && current.amountPaid != null && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Amount Paid</span>
                          <span className="text-green-600 font-medium">${current.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-600">Balance Due</span>
                          <span className="text-amber-600 font-medium">${(current.total - current.amountPaid).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {current.notes && (
                  <div className="rounded-[20px] border border-[#E9E7F0] p-5">
                    <h3 className="font-poppins font-semibold text-sm text-[#28243D] mb-2">Notes</h3>
                    <p className="text-sm text-[#4D4764]">{current.notes}</p>
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
