"use client"

import { useState } from "react"
import StatusBadge from "./StatusBadge"
import ConfirmModal from "./ConfirmModal"

interface StaffCardProps {
  staff: {
    id: string
    firstName: string
    lastName: string
    directorate?: string | null
    team?: string | null
    email: string
    vaccinationRecord?: {
      status: string
    } | null
  }
  onUpdate?: (staffId: string, newStatus: string) => void
}

const actions = [
  { status: "VACCINATED_ELFT", label: "Vaccinated at ELFT", cls: "btn-primary btn-sm" },
  { status: "VACCINATED_ELSEWHERE", label: "Vaccinated elsewhere", cls: "btn-blue btn-sm" },
  { status: "DECLINED", label: "Declined", cls: "btn-amber btn-sm" },
]

export default function StaffCard({ staff, onUpdate }: StaffCardProps) {
  const [pending, setPending] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<{ status: string; label: string } | null>(null)
  const [currentStatus, setCurrentStatus] = useState(
    staff.vaccinationRecord?.status ?? "UNKNOWN"
  )
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!confirming) return
    setPending(confirming.status)

    try {
      const res = await fetch("/api/vaccination/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staff.id, status: confirming.status }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to update")
      }

      setCurrentStatus(confirming.status)
      setSuccess(true)
      setError(null)
      onUpdate?.(staff.id, confirming.status)
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setPending(null)
      setConfirming(null)
    }
  }

  return (
    <>
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="font-bold text-nhs-black">
              {staff.firstName} {staff.lastName}
            </p>
            <p className="text-sm text-nhs-mid-grey">
              {[staff.directorate, staff.team].filter(Boolean).join(" · ")}
            </p>
            <p className="text-sm text-gray-500">{staff.email}</p>
            <div className="mt-2">
              <StatusBadge status={currentStatus} size="sm" />
            </div>
          </div>

          {success ? (
            <div className="shrink-0 flex items-center gap-1 text-nhs-green text-sm font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Updated
            </div>
          ) : null}
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-2" role="alert">
            {error}
          </p>
        )}

        {!success && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action) => (
              <button
                key={action.status}
                className={action.cls}
                onClick={() => setConfirming(action)}
                disabled={pending !== null || currentStatus === action.status}
                aria-label={`Record ${staff.firstName} ${staff.lastName} as ${action.label}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirming}
        title="Confirm vaccination record"
        message={`Record ${staff.firstName} ${staff.lastName} as "${confirming?.label}"? This action will be logged.`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(null)}
        loading={pending !== null}
      />
    </>
  )
}
