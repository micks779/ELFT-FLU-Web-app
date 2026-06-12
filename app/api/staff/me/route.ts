import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user?.staffId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const staff = await prisma.staff.findUnique({
    where: { id: session.user.staffId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      directorate: true,
      team: true,
      jobTitle: true,
      role: true,
      esrConfirmed: true,
      esrUpdateFlagged: true,
      vaccinationRecord: {
        select: {
          status: true,
          vaccinatedAt: true,
          site: true,
          updatedAt: true,
        },
      },
    },
  })

  if (!staff) {
    return NextResponse.json({ error: "Staff record not found" }, { status: 404 })
  }

  return NextResponse.json(staff)
}
