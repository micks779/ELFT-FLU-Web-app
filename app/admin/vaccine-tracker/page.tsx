import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AdminTabs from "@/components/admin/AdminTabs"
import VaccineTrackerForm from "@/components/admin/VaccineTrackerForm"

export const dynamic = "force-dynamic"

function stockColour(count: number) {
  if (count === 0) return "bg-red-100 text-red-700 border-red-200"
  if (count <= 10) return "bg-amber-100 text-amber-800 border-amber-200"
  return "bg-green-100 text-green-700 border-green-200"
}

export default async function VaccineTrackerPage() {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") redirect("/my-record")

  const allEntries = await prisma.vaccineStock.findMany({
    orderBy: { recordedAt: "desc" },
    take: 50,
    include: {
      recordedBy: { select: { firstName: true, lastName: true } },
    },
  })

  // Latest entry per location for summary cards
  const latestByLocation = new Map<string, typeof allEntries[number]>()
  for (const entry of allEntries) {
    if (!latestByLocation.has(entry.location)) {
      latestByLocation.set(entry.location, entry)
    }
  }
  const summaryCards = Array.from(latestByLocation.values()).sort((a, b) =>
    a.location.localeCompare(b.location)
  )

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

        {/* Summary cards */}
        {summaryCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {summaryCards.map((entry) => (
              <div
                key={entry.location}
                className={`rounded-lg border p-4 ${stockColour(entry.stockCount)}`}
              >
                <p className="font-semibold text-sm truncate">{entry.location}</p>
                <p className="text-3xl font-bold mt-1">{entry.stockCount}</p>
                <p className="text-xs mt-1 opacity-70">doses remaining</p>
                <p className="text-xs mt-2 opacity-60">
                  Updated{" "}
                  {new Date(entry.recordedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {entry.recordedBy.firstName} {entry.recordedBy.lastName}
                </p>
              </div>
            ))}
          </div>
        )}

        {summaryCards.length === 0 && (
          <p className="text-nhs-mid-grey text-sm mb-8">
            No stock counts recorded yet. Use the form below to log the first entry.
          </p>
        )}

        {/* Log form */}
        <div className="max-w-md mb-10">
          <VaccineTrackerForm />
        </div>

        {/* Recent history */}
        {allEntries.length > 0 && (
          <div>
            <h2 className="font-semibold text-nhs-black mb-3">Recent History</h2>
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-nhs-dark-grey">Location</th>
                    <th className="px-4 py-3 text-right font-medium text-nhs-dark-grey">Doses</th>
                    <th className="px-4 py-3 text-left font-medium text-nhs-dark-grey hidden sm:table-cell">Notes</th>
                    <th className="px-4 py-3 text-left font-medium text-nhs-dark-grey">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-nhs-dark-grey hidden md:table-cell">Recorded by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-nhs-black">{entry.location}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${stockColour(entry.stockCount)}`}
                        >
                          {entry.stockCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nhs-dark-grey hidden sm:table-cell">
                        {entry.notes ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-nhs-dark-grey whitespace-nowrap">
                        {new Date(entry.recordedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-nhs-dark-grey hidden md:table-cell">
                        {entry.recordedBy.firstName} {entry.recordedBy.lastName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
