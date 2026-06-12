"use client"

import { useState } from "react"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatShortDate } from "@/lib/utils"

interface StaffRow {
  id: string
  firstName: string
  lastName: string
  directorate?: string | null
  team?: string | null
  vaccinationRecord?: {
    status: string
    updatedAt: string
  } | null
}

interface StaffTableProps {
  staff: StaffRow[]
}

export default function StaffTable({ staff }: StaffTableProps) {
  const [query, setQuery] = useState("")

  const filtered = staff.filter((s) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      (s.directorate ?? "").toLowerCase().includes(q) ||
      (s.team ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="staff-search" className="sr-only">
          Search staff
        </label>
        <input
          id="staff-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, directorate or team…"
          className="field-input max-w-md"
          aria-label="Search staff records"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="All staff vaccination records">
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Name</th>
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Directorate</th>
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Team</th>
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Status</th>
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-nhs-mid-grey">
                  No staff records found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{s.directorate ?? "—"}</td>
                  <td className="py-3 px-4 text-gray-600">{s.team ?? "—"}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={s.vaccinationRecord?.status ?? "UNKNOWN"} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {s.vaccinationRecord?.updatedAt
                      ? formatShortDate(s.vaccinationRecord.updatedAt)
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Showing {filtered.length} of {staff.length} staff
      </p>
    </div>
  )
}
