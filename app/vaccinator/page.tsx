"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import StaffCard from "@/components/ui/StaffCard"

interface StaffResult {
  id: string
  firstName: string
  lastName: string
  directorate: string | null
  team: string | null
  email: string
  vaccinationRecord: { status: string } | null
}

export default function VaccinatorPage() {
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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full" id="main-content">
        <Link
          href="/my-record"
          className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm mb-6"
          aria-label="Back to home"
        >
          ← Home
        </Link>

        <h1 className="text-2xl font-bold text-nhs-black">Record a Vaccination</h1>
        <p className="text-nhs-dark-grey mt-1 mb-6">
          Search for a staff member to update their vaccination record.
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
            className="field-input"
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

        <div className="space-y-4" aria-live="polite">
          {searched && !loading && results.length === 0 && (
            <div className="card text-center py-8 text-nhs-mid-grey">
              No staff found matching &ldquo;{query}&rdquo;. Try a different name or email.
            </div>
          )}

          {results.map((s) => (
            <StaffCard key={s.id} staff={s} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
