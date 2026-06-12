"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

interface StaffData {
  firstName: string
  lastName: string
  email: string
  directorate: string | null
  team: string | null
  esrConfirmed: boolean
  vaccinationRecord: { status: string } | null
}

type UIState = "form" | "success-esr" | "success-only" | "esr-confirmed" | "esr-flagged"

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function PageSpinner() {
  return (
    <div className="flex justify-center py-12" aria-live="polite" aria-label="Loading">
      <svg className="animate-spin h-8 w-8 text-nhs-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

function SuccessBlock() {
  return (
    <div className="text-center space-y-2">
      <div className="w-14 h-14 bg-nhs-green rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-nhs-black">Thank you!</h2>
      <p className="text-nhs-dark-grey text-sm">
        Your record has been updated. You&apos;re helping protect your patients and colleagues.
      </p>
    </div>
  )
}

function ClipboardIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="6" width="16" height="22" rx="2" stroke="#FFB81C" strokeWidth="2" />
      <path d="M12 6V5a1 1 0 011-1h6a1 1 0 011 1v1" stroke="#FFB81C" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="13" x2="20" y2="13" stroke="#FFB81C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="20" y2="17" stroke="#FFB81C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="21" x2="17" y2="21" stroke="#FFB81C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EsrNudge({ onEsr, loading }: { onEsr: (confirmed: boolean) => void; loading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <ClipboardIcon />
        <div>
          <h3 className="font-bold text-nhs-black text-base leading-snug">
            One more thing — help us count your vaccination
          </h3>
        </div>
      </div>
      <p className="text-sm text-nhs-dark-grey">
        For your vaccination to appear in national NHS figures, your details on ESR need to be up to date.
        Is your name and home address currently correct on ESR?
      </p>
      <div className="space-y-3 pt-1">
        <button
          className="btn-primary"
          onClick={() => onEsr(true)}
          disabled={loading}
          aria-label="Confirm my ESR record is up to date"
        >
          {loading ? <Spinner /> : null}
          Yes, my ESR record is up to date
        </button>
        <button
          className="btn-amber"
          onClick={() => onEsr(false)}
          disabled={loading}
          aria-label="Indicate I need to update my ESR record"
        >
          {loading ? <Spinner /> : null}
          No, I need to update my ESR
        </button>
      </div>
    </div>
  )
}

function EsrConfirmedBlock() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-nhs-green font-semibold text-sm">
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Great — thank you for confirming.
      </div>
      <Link href="/my-record" className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm font-medium">
        ← My Record
      </Link>
    </div>
  )
}

function EsrFlaggedBlock() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-nhs-dark-grey">
        Thank you for letting us know. Please update your ESR record as soon as possible.
        Your Flu Lead has been notified and may follow up with you.
      </p>
      <div className="space-y-2">
        <a
          href="#"
          className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm font-medium"
          aria-label="Guidance on how to update your ESR record"
        >
          How to update your ESR record →
        </a>
        <br />
        <Link href="/my-record" className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm font-medium">
          ← My Record
        </Link>
      </div>
    </div>
  )
}

function UpdateForm() {
  const searchParams = useSearchParams()
  const site = searchParams.get("site")

  const [staff, setStaff] = useState<StaffData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [uiState, setUiState] = useState<UIState>("form")
  const [pending, setPending] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [esrLoading, setEsrLoading] = useState(false)

  useEffect(() => {
    fetch("/api/staff/me")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load your record")
        return r.json()
      })
      .then(setStaff)
      .catch((e) => setLoadError(e.message))
  }, [])

  async function submitStatus(status: string) {
    setPending(status)
    setSubmitError(null)
    try {
      const res = await fetch("/api/vaccination/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, site: site ?? undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to update your record")
      }
      setUiState(staff?.esrConfirmed ? "success-only" : "success-esr")
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setPending(null)
    }
  }

  async function submitEsr(confirmed: boolean) {
    setEsrLoading(true)
    try {
      await fetch("/api/staff/esr-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed, flagged: !confirmed }),
      })
    } catch {
      // Best-effort — don't block the user on a network error
    } finally {
      setEsrLoading(false)
      setUiState(confirmed ? "esr-confirmed" : "esr-flagged")
    }
  }

  if (loadError) {
    return (
      <div className="card border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
        {loadError}. Please refresh the page or contact your Flu Lead.
      </div>
    )
  }

  if (!staff) return <PageSpinner />

  // ── Post-submit confirmation states ──────────────────────────────
  if (uiState === "success-only") {
    return (
      <div className="card space-y-5 text-center" role="status" aria-live="polite">
        <SuccessBlock />
        <Link href="/my-record" className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm font-medium">
          ← My Record
        </Link>
      </div>
    )
  }

  if (uiState === "success-esr" || uiState === "esr-confirmed" || uiState === "esr-flagged") {
    return (
      <div className="card space-y-5" role="status" aria-live="polite">
        <SuccessBlock />

        <hr className="border-gray-200" />

        {uiState === "success-esr" && (
          <EsrNudge onEsr={submitEsr} loading={esrLoading} />
        )}
        {uiState === "esr-confirmed" && <EsrConfirmedBlock />}
        {uiState === "esr-flagged"   && <EsrFlaggedBlock />}
      </div>
    )
  }

  // ── Form state ────────────────────────────────────────────────────
  return (
    <div className="card space-y-6">
      <div className="space-y-4">
        <div>
          <span className="field-label">Name</span>
          <p className="field-readonly">{staff.firstName} {staff.lastName}</p>
        </div>
        <div>
          <span className="field-label">Email address</span>
          <p className="field-readonly">{staff.email}</p>
        </div>
        <div>
          <span className="field-label">Directorate</span>
          <p className="field-readonly">{staff.directorate ?? "—"}</p>
        </div>
        <div>
          <span className="field-label">Team</span>
          <p className="field-readonly">{staff.team ?? "—"}</p>
        </div>
        {site && (
          <div>
            <span className="field-label">Clinic site</span>
            <p className="field-readonly">
              {decodeURIComponent(site).replace(/-/g, " ")}
            </p>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-nhs-dark-grey">Select your flu jab status:</p>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-red-700 text-sm" role="alert">
            {submitError}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={() => submitStatus("VACCINATED_ELFT")}
          disabled={pending !== null}
          aria-label="Record that I have had my flu jab at ELFT"
        >
          {pending === "VACCINATED_ELFT" ? <Spinner /> : null}
          Yes, I&apos;ve had my flu jab
        </button>
        <button
          className="btn-amber"
          onClick={() => submitStatus("DECLINED")}
          disabled={pending !== null}
          aria-label="Record that I decline the flu jab this year"
        >
          {pending === "DECLINED" ? <Spinner /> : null}
          No, I decline the flu jab
        </button>
        <button
          className="btn-blue"
          onClick={() => submitStatus("VACCINATED_ELSEWHERE")}
          disabled={pending !== null}
          aria-label="Record that I have had my flu jab elsewhere"
        >
          {pending === "VACCINATED_ELSEWHERE" ? <Spinner /> : null}
          I&apos;ve had my jab elsewhere
        </button>
      </div>
    </div>
  )
}

export default function UpdateRecordPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full" id="main-content">
        <Link
          href="/my-record"
          className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm mb-6"
          aria-label="Back to my record"
        >
          ← My Record
        </Link>

        <h1 className="text-2xl font-bold text-nhs-black mb-6">Update my record</h1>

        <Suspense fallback={<PageSpinner />}>
          <UpdateForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
