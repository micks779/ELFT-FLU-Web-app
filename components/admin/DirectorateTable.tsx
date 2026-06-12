import { formatUptake } from "@/lib/utils"

interface DirectorateRow {
  directorate: string
  eligible: number
  vaccinated: number
}

interface DirectorateTableProps {
  rows: DirectorateRow[]
}

export default function DirectorateTable({ rows }: DirectorateTableProps) {
  const sorted = [...rows].sort((a, b) => {
    const ua = a.eligible === 0 ? 100 : (a.vaccinated / a.eligible) * 100
    const ub = b.eligible === 0 ? 100 : (b.vaccinated / b.eligible) * 100
    return ua - ub
  })

  if (sorted.length === 0) {
    return <p className="text-nhs-mid-grey text-sm">No data available.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table" aria-label="Uptake by directorate">
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">
              Directorate
            </th>
            <th scope="col" className="text-right py-3 px-4 font-semibold text-nhs-dark-grey">
              Eligible
            </th>
            <th scope="col" className="text-right py-3 px-4 font-semibold text-nhs-dark-grey">
              Vaccinated
            </th>
            <th scope="col" className="text-right py-3 px-4 font-semibold text-nhs-dark-grey">
              Uptake %
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const uptake = row.eligible === 0 ? 0 : (row.vaccinated / row.eligible) * 100
            const belowTarget = uptake < 31.9
            return (
              <tr key={row.directorate} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{row.directorate || "Unknown"}</td>
                <td className="py-3 px-4 text-right text-gray-600">{row.eligible}</td>
                <td className="py-3 px-4 text-right text-gray-600">{row.vaccinated}</td>
                <td
                  className={`py-3 px-4 text-right font-bold ${
                    belowTarget ? "text-red-600" : "text-nhs-green"
                  }`}
                >
                  {formatUptake(row.vaccinated, row.eligible)}
                  {belowTarget && (
                    <span className="sr-only"> (below 31.9% target)</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
