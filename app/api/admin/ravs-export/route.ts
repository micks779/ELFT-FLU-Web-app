import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function currentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startYear = now.getMonth() + 1 >= 4 ? year : year - 1
  return `${startYear}/${(startYear + 1).toString().slice(2)}`
}

function escapeCsv(value: string | null | undefined): string {
  const s = value ?? ""
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const season = req.nextUrl.searchParams.get("season") ?? currentSeason()

  const records = await prisma.rAVSReconciliation.findMany({
    where: { season, status: "UNMATCHED" },
    select: {
      ravsFirstName: true,
      ravsSurname: true,
      ravsPostcode: true,
      vaccineDate: true,
      createdAt: true,
    },
    orderBy: { ravsSurname: "asc" },
  })

  const header = ["First Name", "Last Name", "Postcode", "Vaccine Date", "Upload Date"]
  const rows = records.map((r) => [
    escapeCsv(r.ravsFirstName),
    escapeCsv(r.ravsSurname),
    escapeCsv(r.ravsPostcode),
    escapeCsv(r.vaccineDate),
    escapeCsv(r.createdAt.toISOString().split("T")[0]),
  ])

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n")

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="ravs-unmatched-${season.replace("/", "-")}.csv"`,
    },
  })
}
