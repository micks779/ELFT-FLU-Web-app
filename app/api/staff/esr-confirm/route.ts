import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.staffId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  let body: { confirmed?: unknown; flagged?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const confirmed = body.confirmed === true
  const flagged = body.flagged === true
  const now = new Date()

  await prisma.staff.update({
    where: { id: session.user.staffId },
    data: {
      ...(confirmed ? { esrConfirmed: true, esrConfirmedAt: now } : {}),
      ...(flagged ? { esrUpdateFlagged: true, esrFlaggedAt: now } : {}),
    },
  })

  await prisma.auditLog.create({
    data: {
      staffId: session.user.staffId,
      action: confirmed ? "ESR_CONFIRM" : "ESR_FLAG",
      changedBy: session.user.email!,
      newValue: confirmed ? "confirmed" : "flagged-for-update",
    },
  })

  return NextResponse.json({ success: true })
}
