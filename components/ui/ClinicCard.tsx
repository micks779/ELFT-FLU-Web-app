import { formatDateTime } from "@/lib/utils"

interface ClinicCardProps {
  name: string
  site: string
  date: string | Date
  startTime: string
  endTime: string
  lead?: string | null
  notes?: string | null
}

export default function ClinicCard({ name, site, date, startTime, endTime, lead, notes }: ClinicCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-10 h-10 bg-nhs-light-blue rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-nhs-black">{name}</h3>
          <p className="text-nhs-dark-grey text-sm mt-0.5">{site}</p>
          <p className="text-nhs-blue font-medium text-sm mt-1">
            {formatDateTime(date, startTime, endTime)}
          </p>
          {lead && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium">Lead:</span> {lead}
            </p>
          )}
          {notes && <p className="text-sm text-gray-500 mt-1 italic">{notes}</p>}
        </div>
      </div>
    </div>
  )
}
