"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ELFT_SITES = [
  "Mile End Hospital",
  "Newham Centre for Mental Health",
  "Goodmayes Hospital",
  "Morland Road",
  "Cranbrook Road",
  "John Howard Centre",
  "Trust HQ",
]

export default function VaccineTrackerForm() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [stockCount, setStockCount] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!location.trim() || stockCount === "") return
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/vaccine-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location.trim(),
          stockCount: parseInt(stockCount, 10),
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
      setLocation("")
      setStockCount("")
      setNotes("")
      router.refresh()
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-semibold text-nhs-black text-base">Log Stock Count</h2>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-nhs-black mb-1">
          Location
        </label>
        <input
          id="location"
          list="elft-sites"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Type or select a site…"
          className="field-input"
          required
        />
        <datalist id="elft-sites">
          {ELFT_SITES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="stockCount" className="block text-sm font-medium text-nhs-black mb-1">
          Doses Remaining
        </label>
        <input
          id="stockCount"
          type="number"
          min="0"
          step="1"
          value={stockCount}
          onChange={(e) => setStockCount(e.target.value)}
          placeholder="0"
          className="field-input"
          required
        />
      </div>

      <div>
        <label htmlFor="stock-notes" className="block text-sm font-medium text-nhs-black mb-1">
          Notes{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="stock-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. new delivery expected Thursday"
          className="field-input"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-700 text-sm font-medium" role="status">
          Stock count saved successfully.
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Saving…" : "Save Stock Count"}
      </button>
    </form>
  )
}
