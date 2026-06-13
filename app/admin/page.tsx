import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AdminTabs from "@/components/admin/AdminTabs"
import RoleManager from "@/components/admin/RoleManager"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") redirect("/my-record")

  const allStaff = await prisma.staff.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true, email: true, directorate: true, role: true },
    orderBy: { lastName: "asc" },
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
          Grant or remove Vaccinator access for staff members.
        </p>

        <RoleManager staff={allStaff} />
      </main>

      <Footer />
    </div>
  )
}
