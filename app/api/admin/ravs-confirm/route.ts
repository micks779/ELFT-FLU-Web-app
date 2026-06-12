import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { directorate?: unknown; season?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const season = typeof body.season === "string" ? body.season : null
  if (!season) return NextResponse.json({ error: "season is required" }, { status: 400 })

  // directorate may be null (for unknown directorate rows)
  const directorate = body.directorate === null ? null : typeof body.directorate === "string" ? body.directorate : undefined
  if (directorate === undefined) return NextResponse.json({ error: "directorate is required" }, { status: 400 })

  // Resolve staff IDs in this directorate
  const staffInDirectorate = await prisma.staff.findMany({
    where: { directorate: directorate ?? undefined },
    select: { id: true },
  })
  const staffIds = staffInDirectorate.map((s) => s.id)

  if (staffIds.length === 0) {
    return NextResponse.json({ confirmed: 0 })
  }

  const result = await prisma.rAVSReconciliation.updateMany({
    where: {
      season,
      status: "POSSIBLE",
      matchedStaffId: { in: staffIds },
    },
    data: {
      status: "CONFIRMED",
      confirmedBy: session.user.email!,
      confirmedAt: new Date(),
    },
  })

  return NextResponse.json({ confirmed: result.count })
}
