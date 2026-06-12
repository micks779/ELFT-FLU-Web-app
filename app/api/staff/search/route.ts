import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const role = session.user.role
  if (role !== "VACCINATOR" && role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ staff: [] })
  }

  const staff = await prisma.staff.findMany({
    where: {
      active: true,
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      directorate: true,
      team: true,
      vaccinationRecord: {
        select: { status: true },
      },
    },
    take: 20,
    orderBy: { lastName: "asc" },
  })

  return NextResponse.json({ staff })
}
