"use client"

import { mockContacts } from "@/data/mock"
import { CRMShell } from "@/components/crm/crm-shell"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { SourceBadge, StatusBadge } from "@/components/crm/badges"

export default function ContactsPage() {
  const companies = [...new Set(mockContacts.map((c) => c.companyName))].length
  const countries = [...new Set(mockContacts.map((c) => c.country))].length

  return (
    <CRMShell>
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
        <CRMTopbar title="Contacts" subtitle="People and decision-makers" />

        <div className="flex flex-wrap gap-3 px-6 mb-4">
          <span className="rounded-full bg-[#F0EDF6] text-[#7060B8] px-4 py-1.5 text-xs font-medium">
            {mockContacts.length} Contacts
          </span>
          <span className="rounded-full bg-[#E3F2FD] text-[#1565C0] px-4 py-1.5 text-xs font-medium">
            {companies} Companies
          </span>
          <span className="rounded-full bg-[#FFF3E0] text-[#E65100] px-4 py-1.5 text-xs font-medium">
            {countries} Countries
          </span>
        </div>

        <div className="bg-card rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Contact</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Company</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Job Title</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Country</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Source</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Status</th>
                  <th scope="col" className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {mockContacts.length > 0 ? (
                  mockContacts.map((contact) => {
                  const initials = contact.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                  return (
                    <tr
                      key={contact.id}
                      className="border-b border-border hover:bg-muted transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EEEAF6] text-[#504098] text-xs flex items-center justify-center font-medium">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm text-foreground font-medium">{contact.fullName}</p>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.companyName}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.jobTitle}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.country}</td>
                      <td className="px-4 py-3"><SourceBadge source={contact.source} /></td>
                      <td className="px-4 py-3"><StatusBadge status={contact.status} /></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{contact.createdAt}</td>
                    </tr>
                  )
                })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No contacts found.
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
