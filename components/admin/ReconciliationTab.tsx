"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface ReconSummary {
  total: number
  matched: number
  probable: number
  possible: number
  unmatched: number
  confirmed: number
  tier1: number
  tier2: number
  tier3: number
}

interface PossibleRow {
  directorate: string | null
  count: number
}

interface UnmatchedRow {
  directorate: string | null
  count: number
}

interface ReconciliationTabProps {
  summary: ReconSummary | null
  possibleByDirectorate: PossibleRow[]
  unmatchedByDirectorate: UnmatchedRow[]
  esrFlaggedCount: number
  currentSeason: string
}

interface UploadResult {
  total: number
  matched: number
  probable: number
  possible: number
  unmatched: number
  season: string
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function pct(n: number, total: number): string {
  if (total === 0) return "0%"
  return `${Math.round((n / total) * 100)}%`
}

export default function ReconciliationTab({
  summary,
  possibleByDirectorate,
  unmatchedByDirectorate,
  esrFlaggedCount,
  currentSeason,
}: ReconciliationTabProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [confirmingDir, setConfirmingDir] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const displaySummary: ReconSummary | null = uploadResult
    ? {
        total: uploadResult.total,
        matched: uploadResult.matched,
        probable: uploadResult.probable,
        possible: uploadResult.possible,
        unmatched: uploadResult.unmatched,
        confirmed: 0,
        tier1: 0,
        tier2: 0,
        tier3: 0,
      }
    : summary

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    setUploadResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/ravs-upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setUploadResult(data as UploadResult)
      startTransition(() => router.refresh())
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleConfirm(directorate: string | null) {
    setConfirmingDir(directorate ?? "__null__")
    try {
      const res = await fetch("/api/admin/ravs-confirm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directorate, season: currentSeason }),
      })
      if (res.ok) startTransition(() => router.refresh())
    } finally {
      setConfirmingDir(null)
    }
  }

  const totalAttributed = displaySummary
    ? displaySummary.matched + displaySummary.probable + displaySummary.confirmed
    : 0

  return (
    <div className="space-y-8">
      {/* ── Upload form ─────────────────────────────────────────────── */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-3">
        <h3 className="font-semibold text-nhs-black text-sm">Upload RAVS CSV</h3>
        <p className="text-xs text-nhs-dark-grey">
          Expected columns: <code className="bg-white px-1 rounded border border-gray-200">NHS Number</code>,{" "}
          <code className="bg-white px-1 rounded border border-gray-200">First Name</code>,{" "}
          <code className="bg-white px-1 rounded border border-gray-200">Last Name</code>,{" "}
          <code className="bg-white px-1 rounded border border-gray-200">Postcode</code>,{" "}
          <code className="bg-white px-1 rounded border border-gray-200">Vaccine Date</code>.
          Uploading replaces any existing records for the current season.
        </p>
        <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            required
            className="text-sm text-nhs-dark-grey file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:text-sm file:font-medium file:bg-white file:cursor-pointer"
            aria-label="Select RAVS CSV file"
          />
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary w-auto px-4 py-2 text-sm"
            style={{ width: "auto" }}
          >
            {uploading ? <><Spinner /> Processing…</> : "Process Upload"}
          </button>
        </form>
        {uploadError && (
          <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded px-3 py-2" role="alert">
            {uploadError}
          </p>
        )}
        {uploadResult && (
          <p className="text-nhs-green text-sm font-medium">
            Upload complete — {uploadResult.total} records processed for season {uploadResult.season}.
          </p>
        )}
      </div>

      {!displaySummary && (
        <p className="text-sm text-nhs-mid-grey italic">
          No reconciliation data for the current season. Upload a RAVS CSV to begin.
        </p>
      )}

      {displaySummary && displaySummary.total > 0 && (
        <>
          {/* ── GREEN — Matched ──────────────────────────────────────── */}
          <div className="rounded-lg border border-green-200 bg-green-50 overflow-hidden">
            <div className="px-5 py-4 border-b border-green-200 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-nhs-green shrink-0" aria-hidden="true" />
              <h3 className="font-bold text-nhs-black text-sm">
                Matched —{" "}
                <span className="text-nhs-green">
                  {totalAttributed} record{totalAttributed !== 1 ? "s" : ""} attributed automatically (
                  {pct(totalAttributed, displaySummary.total)})
                </span>
              </h3>
            </div>
            <div className="px-5 py-4 space-y-1.5 text-sm text-nhs-dark-grey">
              {displaySummary.tier1 > 0 && (
                <p>
                  <span className="font-semibold text-nhs-black">{displaySummary.tier1}</span> matched via historical NHS number
                </p>
              )}
              {displaySummary.tier2 > 0 && (
                <p>
                  <span className="font-semibold text-nhs-black">{displaySummary.tier2}</span> matched via exact name and postcode
                </p>
              )}
              {displaySummary.tier3 > 0 && (
                <p>
                  <span className="font-semibold text-nhs-black">{displaySummary.tier3}</span> matched via fuzzy name matching
                </p>
              )}
              {displaySummary.confirmed > 0 && (
                <p>
                  <span className="font-semibold text-nhs-black">{displaySummary.confirmed}</span> confirmed by Flu Lead
                </p>
              )}
              {totalAttributed === 0 && <p className="italic text-nhs-mid-grey">No automatic matches found yet.</p>}
            </div>
          </div>

          {/* ── AMBER — Needs Review ─────────────────────────────────── */}
          {(displaySummary.possible > 0 || possibleByDirectorate.length > 0) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-200 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                <h3 className="font-bold text-nhs-black text-sm">
                  Needs Review —{" "}
                  <span className="text-amber-700">
                    {displaySummary.possible} record{displaySummary.possible !== 1 ? "s" : ""} need confirmation
                  </span>
                </h3>
              </div>
              {possibleByDirectorate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Possible matches by directorate">
                    <thead>
                      <tr className="bg-amber-100 border-b border-amber-200">
                        <th scope="col" className="px-4 py-3 text-left font-semibold text-nhs-dark-grey">Directorate</th>
                        <th scope="col" className="px-4 py-3 text-left font-semibold text-nhs-dark-grey">Records</th>
                        <th scope="col" className="px-4 py-3 text-left font-semibold text-nhs-dark-grey">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {possibleByDirectorate.map((row) => {
                        const key = row.directorate ?? "__null__"
                        const isConfirming = confirmingDir === key
                        return (
                          <tr key={key} className="bg-amber-50">
                            <td className="px-4 py-3 text-nhs-black">{row.directorate ?? "Unknown"}</td>
                            <td className="px-4 py-3 text-nhs-dark-grey">{row.count}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleConfirm(row.directorate)}
                                disabled={isConfirming}
                                className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded px-3 py-1.5 transition-colors disabled:opacity-60"
                                aria-label={`Confirm all possible matches for ${row.directorate ?? "unknown directorate"}`}
                              >
                                {isConfirming ? <Spinner /> : "Confirm all"}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-4 text-sm text-amber-700">
                  Refresh the page after upload to review possible matches by directorate.
                </div>
              )}
              <div className="px-5 py-3 border-t border-amber-200">
                <p className="text-xs text-amber-700">
                  Directorates only — no personal data shown. Confirming attributes these RAVS records to the matched directorate.
                </p>
              </div>
            </div>
          )}

          {/* ── RED — Unmatched ──────────────────────────────────────── */}
          {displaySummary.unmatched > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                  <h3 className="font-bold text-nhs-black text-sm">
                    Unattributed —{" "}
                    <span className="text-red-600">
                      {displaySummary.unmatched} record{displaySummary.unmatched !== 1 ? "s" : ""} could not be matched
                    </span>
                  </h3>
                </div>
                <a
                  href={`/api/admin/ravs-export?season=${encodeURIComponent(currentSeason)}`}
                  download={`ravs-unmatched-${currentSeason.replace("/", "-")}.csv`}
                  className="text-xs font-semibold text-nhs-blue border border-nhs-blue rounded px-3 py-1.5 hover:bg-blue-50 transition-colors"
                  aria-label="Download unmatched records as CSV for manual follow-up"
                >
                  Export for follow-up
                </a>
              </div>
              <div className="px-5 py-4 space-y-4 text-sm">
                {unmatchedByDirectorate.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-nhs-dark-grey uppercase tracking-wide">By directorate (approximate)</p>
                    <div className="space-y-1">
                      {unmatchedByDirectorate.map((row) => (
                        <div key={row.directorate ?? "__null__"} className="flex justify-between text-nhs-dark-grey text-sm">
                          <span>{row.directorate ?? "Unknown"}</span>
                          <span className="font-semibold">{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-red-100 border border-red-200 rounded-md px-4 py-3 text-red-700">
                  <span className="font-bold">{esrFlaggedCount}</span> staff{" "}
                  {esrFlaggedCount === 1 ? "has" : "have"} also flagged that their ESR record needs updating —{" "}
                  {esrFlaggedCount === 1 ? "this is" : "these are"} your priority contact{esrFlaggedCount !== 1 ? "s" : ""}.
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
