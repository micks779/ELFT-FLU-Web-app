import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const clinics = await prisma.clinic.findMany({
    where: { active: true },
    orderBy: { date: "asc" },
  })

  return NextResponse.json({ clinics })
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  if (session.user.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: {
    name?: unknown
    site?: unknown
    date?: unknown
    startTime?: unknown
    endTime?: unknown
    lead?: unknown
    notes?: unknown
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { name, site, date, startTime, endTime, lead, notes } = body

  if (!name || !site || !date || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Name, site, date, start time and end time are required" },
      { status: 400 }
    )
  }

  const parsedDate = new Date(date as string)
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
  }

  const clinic = await prisma.clinic.create({
    data: {
      name: name as string,
      site: site as string,
      date: parsedDate,
      startTime: startTime as string,
      endTime: endTime as string,
      lead: typeof lead === "string" && lead ? lead : null,
      notes: typeof notes === "string" && notes ? notes : null,
    },
  })

  return NextResponse.json({ clinic }, { status: 201 })
}
