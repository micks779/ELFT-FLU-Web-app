import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  if (session.user.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const staff = await prisma.staff.findMany({
    where: { active: true, frontline: true },
    include: { vaccinationRecord: true },
  })

  const eligible = staff.length
  const vaccinated = staff.filter(
    (s) =>
      s.vaccinationRecord?.status === "VACCINATED_ELFT" ||
      s.vaccinationRecord?.status === "VACCINATED_ELSEWHERE"
  ).length
  const declined = staff.filter((s) => s.vaccinationRecord?.status === "DECLINED").length
  const unrecorded = staff.filter(
    (s) => !s.vaccinationRecord || s.vaccinationRecord.status === "UNKNOWN"
  ).length

  const directorateMap: Record<string, { eligible: number; vaccinated: number; declined: number }> = {}

  for (const s of staff) {
    const d = s.directorate ?? "Unknown"
    if (!directorateMap[d]) directorateMap[d] = { eligible: 0, vaccinated: 0, declined: 0 }
    directorateMap[d].eligible++
    if (
      s.vaccinationRecord?.status === "VACCINATED_ELFT" ||
      s.vaccinationRecord?.status === "VACCINATED_ELSEWHERE"
    ) {
      directorateMap[d].vaccinated++
    }
    if (s.vaccinationRecord?.status === "DECLINED") {
      directorateMap[d].declined++
    }
  }

  const byDirectorate = Object.entries(directorateMap).map(([directorate, data]) => ({
    directorate,
    ...data,
    uptake: data.eligible > 0 ? ((data.vaccinated / data.eligible) * 100).toFixed(1) : "0.0",
  }))

  return NextResponse.json({
    eligible,
    vaccinated,
    declined,
    unrecorded,
    uptakePercent: eligible > 0 ? ((vaccinated / eligible) * 100).toFixed(1) : "0.0",
    byDirectorate,
  })
}
