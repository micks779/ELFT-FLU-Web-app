"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function AddClinicPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      site: (form.elements.namedItem("site") as HTMLInputElement).value,
      date: (form.elements.namedItem("date") as HTMLInputElement).value,
      startTime: (form.elements.namedItem("startTime") as HTMLInputElement).value,
      endTime: (form.elements.namedItem("endTime") as HTMLInputElement).value,
      lead: (form.elements.namedItem("lead") as HTMLInputElement).value || undefined,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value || undefined,
    }

    try {
      const res = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to create clinic")
      }

      router.push("/clinics")
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full" id="main-content">
        <Link
          href="/clinics"
          className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm mb-6"
          aria-label="Back to clinics"
        >
          ← Clinics
        </Link>

        <h1 className="text-2xl font-bold text-nhs-black mb-6">Add a Clinic</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-4 text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="field-label">
              Clinic name <span aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="field-input"
              placeholder="e.g. Drop-in Flu Clinic"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="site" className="field-label">
              Site / location <span aria-hidden="true">*</span>
            </label>
            <input
              id="site"
              name="site"
              type="text"
              required
              className="field-input"
              placeholder="e.g. Mile End Hospital"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="date" className="field-label">
              Date <span aria-hidden="true">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="field-input"
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="field-label">
                Start time <span aria-hidden="true">*</span>
              </label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                required
                className="field-input"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="field-label">
                End time <span aria-hidden="true">*</span>
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                required
                className="field-input"
                aria-required="true"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lead" className="field-label">Lead name (optional)</label>
            <input
              id="lead"
              name="lead"
              type="text"
              className="field-input"
              placeholder="e.g. Sarah Johnson"
            />
          </div>

          <div>
            <label htmlFor="notes" className="field-label">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="field-input resize-none"
              placeholder="Any additional information for staff…"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner /> : null}
            Add Clinic
          </button>
        </form>
      </main>

      <Footer />
    </div>
  )
}
