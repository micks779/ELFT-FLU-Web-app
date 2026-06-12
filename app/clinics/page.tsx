"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ClinicCard from "@/components/ui/ClinicCard"

interface Clinic {
  id: string
  name: string
  site: string
  date: string
  startTime: string
  endTime: string
  lead: string | null
  notes: string | null
}

export default function ClinicsPage() {
  const { data: session } = useSession()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/clinics")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load clinics")
        return r.json()
      })
      .then((data) => setClinics(data.clinics))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = clinics.filter((c) => {
    if (!query) return true
    const q = query.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.site.toLowerCase().includes(q)
  })

  const isFluLead = session?.user?.role === "FLU_LEAD"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full" id="main-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/my-record"
              className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm"
              aria-label="Back to home"
            >
              ← Home
            </Link>
            <h1 className="text-2xl font-bold text-nhs-black mt-1">Clinics near me</h1>
          </div>
          {isFluLead && (
            <Link href="/clinics/add" className="btn-primary btn-sm w-auto">
              + Add a Clinic
            </Link>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="clinic-search" className="sr-only">
            Search clinics
          </label>
          <input
            id="clinic-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by clinic name or site…"
            className="field-input"
            aria-label="Search clinics by name or site"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-12" aria-live="polite" aria-label="Loading clinics">
            <svg className="animate-spin h-8 w-8 text-nhs-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="card border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
            {error}. Please refresh or contact your Flu Lead.
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4" aria-live="polite">
            {filtered.length === 0 ? (
              <div className="card text-center py-12 text-nhs-mid-grey">
                {query
                  ? `No clinics matching "${query}".`
                  : "No clinics currently listed. Check back soon."}
              </div>
            ) : (
              filtered.map((c) => (
                <ClinicCard
                  key={c.id}
                  name={c.name}
                  site={c.site}
                  date={c.date}
                  startTime={c.startTime}
                  endTime={c.endTime}
                  lead={c.lead}
                  notes={c.notes}
                />
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
