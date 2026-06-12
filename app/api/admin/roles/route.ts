import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_ROLES = ["STAFF", "VACCINATOR"] as const

export async function PATCH(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  if (session.user.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { staffId?: unknown; role?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { staffId, role } = body

  if (!staffId || typeof staffId !== "string") {
    return NextResponse.json({ error: "staffId is required" }, { status: 400 })
  }

  if (!role || !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json(
      { error: "Role must be STAFF or VACCINATOR" },
      { status: 400 }
    )
  }

  const target = await prisma.staff.findUnique({
    where: { id: staffId },
    select: { id: true, role: true, firstName: true, lastName: true },
  })

  if (!target) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 })
  }

  if (target.role === "FLU_LEAD") {
    return NextResponse.json(
      { error: "Flu Lead roles cannot be changed from this interface" },
      { status: 403 }
    )
  }

  const oldRole = target.role

  const updated = await prisma.staff.update({
    where: { id: staffId },
    data: { role: role as "STAFF" | "VACCINATOR" },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  })

  await prisma.auditLog.create({
    data: {
      staffId,
      action: "ROLE_UPDATE",
      changedBy: session.user.email!,
      oldValue: oldRole,
      newValue: role as string,
    },
  })

  return NextResponse.json({ staff: updated })
}
