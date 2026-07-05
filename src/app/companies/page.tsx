"use client"

import { mockCompanies } from "@/data/mock"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { ProductBadge } from "@/components/crm/badges"

export default function CompaniesPage() {
  const countries = [...new Set(mockCompanies.map((c) => c.country))].length
  const products = [...new Set(mockCompanies.map((c) => c.productFit))].length

  return (
    <div className="bg-[#C4CBDE] h-screen overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto py-4 px-4">
        <div className="h-full bg-white rounded-[36px] p-5 shadow-elevated">
          <div className="flex gap-5 h-full">
            <CRMSidebar activeItem="companies" />

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
              <CRMTopbar title="Companies" subtitle="Account-level business records" />

              <div className="flex flex-wrap gap-3 px-6 mb-4">
                <span className="rounded-full bg-[#F0EDF6] text-[#7060B8] px-4 py-1.5 text-xs font-medium">
                  {mockCompanies.length} Companies
                </span>
                <span className="rounded-full bg-[#E3F2FD] text-[#1565C0] px-4 py-1.5 text-xs font-medium">
                  {countries} Countries
                </span>
                <span className="rounded-full bg-[#FFF3E0] text-[#E65100] px-4 py-1.5 text-xs font-medium">
                  {products} Products
                </span>
              </div>

              <div className="bg-white rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F7F7F8]">
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Company</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Industry</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Product</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Country</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">City</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Employees</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Leads</th>
                        <th className="text-xs uppercase text-[#7B7592] font-medium px-4 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCompanies.map((company) => (
                        <tr
                          key={company.id}
                          className="border-b border-[#E9E7F0] hover:bg-[#F7F7F8] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#28243D]">{company.name}</p>
                            <p className="text-xs text-[#7B7592]">{company.website}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#28243D]">{company.industry}</td>
                          <td className="px-4 py-3"><ProductBadge product={company.productFit} /></td>
                          <td className="px-4 py-3 text-sm text-[#28243D]">{company.country}</td>
                          <td className="px-4 py-3 text-sm text-[#28243D]">{company.city}</td>
                          <td className="px-4 py-3 text-sm text-[#28243D]">{company.employeeCount}</td>
                          <td className="px-4 py-3 text-sm text-[#28243D]">{company.leadCount}</td>
                          <td className="px-4 py-3 text-sm text-[#7B7592]">{company.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
