"use client"

import { useState } from "react"

interface StaffRole {
  id: string
  firstName: string
  lastName: string
  email: string
  directorate?: string | null
  role: string
}

interface RoleManagerProps {
  staff: StaffRole[]
}

const roleLabels: Record<string, string> = {
  STAFF: "Staff",
  VACCINATOR: "Vaccinator",
  FLU_LEAD: "Flu Lead",
}

export default function RoleManager({ staff: initialStaff }: RoleManagerProps) {
  const [staff, setStaff] = useState(initialStaff)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = staff.filter((s) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    )
  })

  async function toggleRole(s: StaffRole) {
    if (s.role === "FLU_LEAD") return
    const newRole = s.role === "VACCINATOR" ? "STAFF" : "VACCINATOR"
    setLoading(s.id)
    setError(null)

    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: s.id, role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to update role")
      }

      setStaff((prev) =>
        prev.map((m) => (m.id === s.id ? { ...m, role: newRole } : m))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="role-search" className="sr-only">
          Search staff
        </label>
        <input
          id="role-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="field-input max-w-md"
          aria-label="Search staff for role management"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-4 text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Staff roles management">
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Name</th>
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Email</th>
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Directorate</th>
              <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Role</th>
              <th scope="col" className="py-3 px-4 font-semibold text-nhs-dark-grey">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-nhs-mid-grey">
                  No staff found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{s.email}</td>
                  <td className="py-3 px-4 text-gray-600">{s.directorate ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        s.role === "FLU_LEAD"
                          ? "bg-nhs-blue text-white"
                          : s.role === "VACCINATOR"
                          ? "bg-nhs-light-blue text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {roleLabels[s.role] ?? s.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.role === "FLU_LEAD" ? (
                      <span className="text-gray-400 text-xs">Protected</span>
                    ) : (
                      <button
                        onClick={() => toggleRole(s)}
                        disabled={loading === s.id}
                        className="text-nhs-blue hover:underline text-xs font-medium disabled:opacity-60"
                        aria-label={`${s.role === "VACCINATOR" ? "Remove vaccinator role from" : "Make vaccinator"} ${s.firstName} ${s.lastName}`}
                      >
                        {loading === s.id
                          ? "Saving…"
                          : s.role === "VACCINATOR"
                          ? "Remove Vaccinator"
                          : "Make Vaccinator"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
