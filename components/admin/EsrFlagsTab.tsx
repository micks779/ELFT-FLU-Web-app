interface EsrFlagRow {
  directorate: string | null
  team: string | null
  esrFlaggedAt: string | null
  esrConfirmed: boolean
}

interface EsrFlagsTabProps {
  rows: EsrFlagRow[]
  ravsUnmatchedCount: number
}

function StatusBadge({ resolved }: { resolved: boolean }) {
  if (resolved) {
    return (
      <span className="inline-flex items-center gap-1 text-nhs-green font-semibold text-xs">
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Resolved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      Pending
    </span>
  )
}

export default function EsrFlagsTab({ rows, ravsUnmatchedCount }: EsrFlagsTabProps) {
  const total = rows.length
  const pending = rows.filter((r) => !r.esrConfirmed).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 text-center min-w-[100px]">
          <p className="text-2xl font-bold text-amber-700">{total}</p>
          <p className="text-xs text-amber-600 mt-0.5">Flagged ESR</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 text-center min-w-[100px]">
          <p className="text-2xl font-bold text-amber-700">{pending}</p>
          <p className="text-xs text-amber-600 mt-0.5">Pending</p>
        </div>
        <div className="bg-blue-50 border border-nhs-blue border-opacity-20 rounded-lg px-5 py-3 flex items-center">
          <p className="text-sm text-nhs-dark-grey">
            <span className="font-bold text-nhs-blue">{ravsUnmatchedCount}</span>{" "}
            {ravsUnmatchedCount === 1 ? "of these staff also appears" : "of these staff also appear"} as unmatched in the latest RAVS upload.
          </p>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-nhs-mid-grey italic py-4">
          No staff have flagged their ESR record as needing an update.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm" aria-label="ESR flagged staff">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th scope="col" className="px-4 py-3 text-left font-semibold text-nhs-dark-grey">Directorate</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-nhs-dark-grey">Team</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-nhs-dark-grey">Flagged Date</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-nhs-dark-grey">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-nhs-black">{row.directorate ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-nhs-dark-grey">{row.team ?? "—"}</td>
                  <td className="px-4 py-3 text-nhs-dark-grey">
                    {row.esrFlaggedAt
                      ? new Date(row.esrFlaggedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge resolved={row.esrConfirmed} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-nhs-mid-grey">
        Staff are identified by directorate and team only in accordance with GDPR. No personal data is shown.
      </p>
    </div>
  )
}
