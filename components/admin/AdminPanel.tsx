"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import StaffCard from "@/components/ui/StaffCard"
import RoleManager from "@/components/admin/RoleManager"

interface StaffResult {
  id: string
  firstName: string
  lastName: string
  directorate: string | null
  team: string | null
  email: string
  vaccinationRecord: { status: string } | null
}

interface StaffRoleRow {
  id: string
  firstName: string
  lastName: string
  email: string
  directorate: string | null
  role: string
}

interface AdminPanelProps {
  role: string
  allRolesStaff: StaffRoleRow[]
}

export default function AdminPanel({ role, allRolesStaff }: AdminPanelProps) {
  const isFluLead = role === "FLU_LEAD"

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<StaffResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/staff/search?q=${encodeURIComponent(query.trim())}`)
        if (!res.ok) throw new Error("Search failed")
        const data = await res.json()
        setResults(data.staff)
        setSearched(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed")
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return (
    <div className="space-y-10">
      {/* ── Back link ─────────────────────────────────────────────── */}
      <Link
        href="/my-record"
        className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm"
        aria-label="Back to my record"
      >
        ← My Record
      </Link>

      {/* ── Section 1: Record Vaccination ─────────────────────────── */}
      <section aria-labelledby="record-heading">
        <h1 id="record-heading" className="text-2xl font-bold text-nhs-black mb-1">
          Record a Vaccination
        </h1>
        <p className="text-nhs-dark-grey text-sm mb-6">
          Search for a staff member to update their vaccination record on their behalf.
        </p>

        <div className="mb-6">
          <label htmlFor="staff-search" className="sr-only">
            Search staff by name or email
          </label>
          <input
            id="staff-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email address…"
            className="field-input max-w-lg"
            aria-label="Search staff by name or email"
            autoFocus
          />
          {query.trim().length > 0 && query.trim().length < 2 && (
            <p className="text-sm text-gray-500 mt-1">Type at least 2 characters to search</p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-8" aria-live="polite" aria-label="Searching">
            <svg className="animate-spin h-6 w-6 text-nhs-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="card border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
            {error}. Please try again.
          </div>
        )}

        <div className="space-y-4 max-w-lg" aria-live="polite">
          {searched && !loading && results.length === 0 && (
            <div className="card text-center py-8 text-nhs-mid-grey">
              No staff found matching &ldquo;{query}&rdquo;. Try a different name or email.
            </div>
          )}
          {results.map((s) => (
            <StaffCard key={s.id} staff={s} />
          ))}
        </div>
      </section>

      {/* ── Section 2: Manage Roles (FLU_LEAD only) ───────────────── */}
      {isFluLead && (
        <>
          <hr className="border-gray-200" />
          <section aria-labelledby="roles-heading">
            <h2 id="roles-heading" className="text-xl font-bold text-nhs-black mb-1">
              Manage Roles
            </h2>
            <p className="text-nhs-dark-grey text-sm mb-6">
              Grant or remove Vaccinator access for staff members.
            </p>
            <RoleManager staff={allRolesStaff} />
          </section>
        </>
      )}
    </div>
  )
}
