"use client"

import { mockCompanies } from "@/data/mock"
import { CRMShell } from "@/components/crm/crm-shell"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { ProductBadge } from "@/components/crm/badges"

export default function CompaniesPage() {
  const countries = [...new Set(mockCompanies.map((c) => c.country))].length
  const products = [...new Set(mockCompanies.map((c) => c.productFit))].length

  return (
    <CRMShell>
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

        <div className="bg-card rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Company</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Industry</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Product</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Country</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">City</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Employees</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Leads</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {mockCompanies.length > 0 ? (
                  mockCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-border hover:bg-muted transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.website}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{company.industry}</td>
                    <td className="px-4 py-3"><ProductBadge product={company.productFit} /></td>
                    <td className="px-4 py-3 text-sm text-foreground">{company.country}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{company.city}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{company.employeeCount}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{company.leadCount}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{company.createdAt}</td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CRMShell>
  )
}
