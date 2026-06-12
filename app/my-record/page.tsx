import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import StatusBadge from "@/components/ui/StatusBadge"

function HealthcareWorkerIllustration() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
      role="img"
      aria-label="Healthcare worker holding a syringe with a protective shield"
    >
      {/* ── Shield (NHS green) ── */}
      <path
        d="M16 60 L16 77 Q16.5 89 28 94 Q39.5 89 40 77 L40 60 Z"
        stroke="#007f3b" strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Shield checkmark */}
      <path
        d="M22 77 L27 83 L37 69"
        stroke="#007f3b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* ── Sparkle 1 — top right (4-pointed star) ── */}
      <path
        d="M130 18 L132 12 L134 18 L140 20 L134 22 L132 28 L130 22 L124 20 Z"
        stroke="#007f3b" strokeWidth="1.5" strokeLinejoin="round"
      />

      {/* ── Sparkle 2 — upper left (small star) ── */}
      <path
        d="M47 24 L48 20 L49 24 L53 25 L49 26 L48 30 L47 26 L43 25 Z"
        stroke="#007f3b" strokeWidth="1.5" strokeLinejoin="round"
      />

      {/* ── Sparkle 3 — lower right (cross motif) ── */}
      <line x1="146" y1="94" x2="146" y2="102" stroke="#007f3b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="142" y1="98" x2="150" y2="98" stroke="#007f3b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="143.5" y1="95.5" x2="148.5" y2="100.5" stroke="#007f3b" strokeWidth="1" strokeLinecap="round" />
      <line x1="143.5" y1="100.5" x2="148.5" y2="95.5" stroke="#007f3b" strokeWidth="1" strokeLinecap="round" />

      {/* ── Healthcare worker figure (NHS blue) ── */}

      {/* Head */}
      <circle cx="75" cy="36" r="14" stroke="#005EB8" strokeWidth="2.5" />

      {/* Smile */}
      <path
        d="M70 39 Q75 43 80 39"
        stroke="#005EB8" strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Body / scrubs torso */}
      <path
        d="M63 52 Q75 49 87 52 L90 95 Q75 98 60 95 Z"
        stroke="#005EB8" strokeWidth="2.5" strokeLinejoin="round"
      />

      {/* V-neck collar */}
      <path
        d="M67 55 L75 65 L83 55"
        stroke="#005EB8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Medical cross on chest */}
      <line x1="75" y1="73" x2="75" y2="81" stroke="#005EB8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="71" y1="77" x2="79" y2="77" stroke="#005EB8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Left arm — relaxed by side */}
      <path
        d="M63 63 Q55 74 54 88"
        stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Left hand */}
      <circle cx="54" cy="91" r="3" stroke="#005EB8" strokeWidth="2" />

      {/* Right arm — raised, holding syringe */}
      <path
        d="M87 63 Q98 68 105 76"
        stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* ── Syringe (held in right hand, angled −20°) ── */}
      <g transform="translate(117 77) rotate(-20)">
        {/* Barrel */}
        <rect x="-22" y="-5.5" width="44" height="11" rx="4" stroke="#005EB8" strokeWidth="2" />
        {/* Plunger rod */}
        <line x1="-22" y1="0" x2="-30" y2="0" stroke="#005EB8" strokeWidth="2" strokeLinecap="round" />
        {/* Plunger thumb rest */}
        <line x1="-30" y1="-6" x2="-30" y2="6" stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Barrel measurement marks */}
        <line x1="-10" y1="-5.5" x2="-10" y2="5.5" stroke="#005EB8" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        <line x1="0"   y1="-5.5" x2="0"   y2="5.5" stroke="#005EB8" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        <line x1="10"  y1="-5.5" x2="10"  y2="5.5" stroke="#005EB8" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        {/* Needle hub */}
        <rect x="22" y="-3.5" width="7" height="7" rx="1.5" stroke="#005EB8" strokeWidth="1.5" />
        {/* Needle */}
        <line x1="29" y1="0" x2="40" y2="0" stroke="#005EB8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Legs */}
      <path
        d="M67 95 L64 120 L71 120"
        stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M83 95 L86 120 L79 120"
        stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Shoes */}
      <line x1="57" y1="120" x2="72" y2="120" stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="78" y1="120" x2="93" y2="120" stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default async function MyRecordPage() {
  const session = await auth()
  if (!session?.user?.staffId) redirect("/")

  const staff = await prisma.staff.findUnique({
    where: { id: session.user.staffId },
    include: { vaccinationRecord: true },
  })

  if (!staff) redirect("/not-found-staff")

  const status = staff.vaccinationRecord?.status ?? "UNKNOWN"
  const role = session.user.role

  return (
    <div className="flex flex-col min-h-screen">
      <Header settingsHref={role === "FLU_LEAD" ? "/admin" : undefined} />

      <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full" id="main-content">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-nhs-black">Hello, {staff.firstName}!</h1>
            <div className="mt-3">
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="card text-center space-y-6">
            <div>
              <HealthcareWorkerIllustration />
              <p className="text-nhs-dark-grey font-semibold italic mt-3">
                Getting vaccinated protects your patients
              </p>
            </div>

            <nav className="space-y-3" aria-label="Main actions">
              <Link href="/my-record/update" className="btn-primary">
                Update My Record
              </Link>
              <Link href="/clinics" className="btn-amber">
                Clinics Near Me
              </Link>
              {(role === "VACCINATOR" || role === "FLU_LEAD") && (
                <Link href="/vaccinator" className="btn-blue">
                  Record a Vaccination
                </Link>
              )}
            </nav>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Logged in as {staff.email}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
