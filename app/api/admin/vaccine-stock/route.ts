import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const entries = await prisma.vaccineStock.findMany({
    orderBy: { recordedAt: "desc" },
    take: 50,
    include: {
      recordedBy: { select: { firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ entries })
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { location, stockCount, notes } = body

  if (!location || typeof stockCount !== "number" || stockCount < 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const entry = await prisma.vaccineStock.create({
    data: {
      location: location.trim(),
      stockCount,
      notes: notes?.trim() || null,
      recordedByStaffId: session.user.staffId,
    },
  })

  return NextResponse.json({ entry }, { status: 201 })
}
