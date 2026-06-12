import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const VALID_STATUSES = ["VACCINATED_ELFT", "VACCINATED_ELSEWHERE", "DECLINED"] as const
type Status = (typeof VALID_STATUSES)[number]

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.staffId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  let body: { status?: unknown; staffId?: unknown; site?: unknown; batchNumber?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { status, staffId: targetStaffId, site, batchNumber } = body

  if (!status || !VALID_STATUSES.includes(status as Status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    )
  }

  const actingRole = session.user.role
  const actingStaffId = session.user.staffId
  const actingEmail = session.user.email!

  // Determine who we're updating
  let subjectStaffId: string

  if (targetStaffId && targetStaffId !== actingStaffId) {
    // Updating someone else — must be VACCINATOR or FLU_LEAD
    if (actingRole !== "VACCINATOR" && actingRole !== "FLU_LEAD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    subjectStaffId = targetStaffId as string
  } else {
    subjectStaffId = actingStaffId
  }

  // Verify subject exists
  const subject = await prisma.staff.findUnique({
    where: { id: subjectStaffId },
    include: { vaccinationRecord: true },
  })

  if (!subject) {
    return NextResponse.json({ error: "Staff record not found" }, { status: 404 })
  }

  const oldStatus = subject.vaccinationRecord?.status ?? "UNKNOWN"
  const newStatus = status as Status

  // Upsert vaccination record
  const record = await prisma.vaccinationRecord.upsert({
    where: { staffId: subjectStaffId },
    update: {
      status: newStatus,
      vaccinatedAt: newStatus !== "DECLINED" ? new Date() : null,
      vaccinatedBy: actingEmail,
      site: typeof site === "string" ? site : null,
      batchNumber: typeof batchNumber === "string" ? batchNumber : null,
    },
    create: {
      staffId: subjectStaffId,
      status: newStatus,
      vaccinatedAt: newStatus !== "DECLINED" ? new Date() : null,
      vaccinatedBy: actingEmail,
      site: typeof site === "string" ? site : null,
      batchNumber: typeof batchNumber === "string" ? batchNumber : null,
    },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      staffId: subjectStaffId,
      action: "VACCINATION_UPDATE",
      changedBy: actingEmail,
      oldValue: oldStatus,
      newValue: newStatus,
    },
  })

  return NextResponse.json({ record })
}
