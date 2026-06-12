import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { toCSVRow, formatShortDate } from "@/lib/utils"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  if (session.user.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const staff = await prisma.staff.findMany({
    where: { active: true },
    include: { vaccinationRecord: true },
    orderBy: [{ directorate: "asc" }, { lastName: "asc" }],
  })

  const header = toCSVRow([
    "Assignment Number",
    "First Name",
    "Last Name",
    "Email",
    "Directorate",
    "Team",
    "Job Title",
    "Frontline",
    "Vaccination Status",
    "Vaccinated At",
    "Vaccinated By",
    "Site",
    "Batch Number",
    "Last Updated",
  ])

  const rows = staff.map((s) =>
    toCSVRow([
      s.assignmentNumber,
      s.firstName,
      s.lastName,
      s.email,
      s.directorate,
      s.team,
      s.jobTitle,
      s.frontline ? "Yes" : "No",
      s.vaccinationRecord?.status ?? "UNKNOWN",
      s.vaccinationRecord?.vaccinatedAt
        ? formatShortDate(s.vaccinationRecord.vaccinatedAt)
        : null,
      s.vaccinationRecord?.vaccinatedBy,
      s.vaccinationRecord?.site,
      s.vaccinationRecord?.batchNumber,
      s.vaccinationRecord?.updatedAt
        ? formatShortDate(s.vaccinationRecord.updatedAt)
        : null,
    ])
  )

  const csv = [header, ...rows].join("\n")
  const filename = `elft-flu-export-${new Date().toISOString().split("T")[0]}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
