import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AdminTabs from "@/components/admin/AdminTabs"
import ReconciliationTab from "@/components/admin/ReconciliationTab"

export const dynamic = "force-dynamic"

const CURRENT_SEASON = "2026/27"

export default async function RavsPage() {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") redirect("/my-record")

  const [matched, probable, possible, unmatched, confirmed] = await Promise.all([
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, status: "MATCHED" } }),
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, status: "PROBABLE" } }),
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, status: "POSSIBLE" } }),
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, status: "UNMATCHED" } }),
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, status: "CONFIRMED" } }),
  ])

  const [tier1, tier2, tier3] = await Promise.all([
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, matchTier: 1 } }),
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, matchTier: 2 } }),
    prisma.rAVSReconciliation.count({ where: { season: CURRENT_SEASON, matchTier: 3 } }),
  ])

  const total = matched + probable + possible + unmatched + confirmed

  const summary = total > 0
    ? { total, matched, probable, possible, unmatched, confirmed, tier1, tier2, tier3 }
    : null

  // POSSIBLE records grouped by directorate of the matched staff
  const possibleRecords = await prisma.rAVSReconciliation.findMany({
    where: { season: CURRENT_SEASON, status: "POSSIBLE" },
    include: { matchedStaff: { select: { directorate: true } } },
  })

  const possibleDirMap = new Map<string | null, number>()
  for (const r of possibleRecords) {
    const dir = r.matchedStaff?.directorate ?? null
    possibleDirMap.set(dir, (possibleDirMap.get(dir) ?? 0) + 1)
  }
  const possibleByDirectorate = Array.from(possibleDirMap.entries())
    .map(([directorate, count]) => ({ directorate, count }))
    .sort((a, b) => b.count - a.count)

  // UNMATCHED records — no staff link so group by ravsSurname initial as proxy
  const unmatchedRecords = await prisma.rAVSReconciliation.findMany({
    where: { season: CURRENT_SEASON, status: "UNMATCHED" },
    select: { id: true },
  })
  const unmatchedByDirectorate = unmatchedRecords.length > 0
    ? [{ directorate: null, count: unmatchedRecords.length }]
    : []

  const esrFlaggedCount = await prisma.staff.count({
    where: { active: true, esrUpdateFlagged: true },
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full" id="main-content">
        <Link
          href="/my-record"
          className="inline-flex items-center gap-1 text-nhs-blue hover:underline text-sm mb-6"
          aria-label="Back to my record"
        >
          ← My Record
        </Link>

        <h1 className="text-2xl font-bold text-nhs-black mb-1">Admin</h1>
        <p className="text-nhs-dark-grey text-sm mb-6">Flu Lead management tools.</p>

        <AdminTabs />

        <p className="text-nhs-dark-grey text-sm mb-6">
          Upload a RAVS extract to reconcile vaccination records against ELFT staff.
          The system automatically matches on NHS number, name, and postcode.
        </p>

        <ReconciliationTab
          summary={summary}
          possibleByDirectorate={possibleByDirectorate}
          unmatchedByDirectorate={unmatchedByDirectorate}
          esrFlaggedCount={esrFlaggedCount}
          currentSeason={CURRENT_SEASON}
        />
      </main>

      <Footer />
    </div>
  )
}
