import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

async function seedFromCSV(csvPath: string) {
  const content = fs.readFileSync(csvPath, "utf-8")
  const lines = content.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => (row[h] = values[idx] || ""))

    const email = row["email"] || row["email address"]
    if (!email) continue

    await prisma.staff.upsert({
      where: { email },
      update: {
        firstName: row["firstname"] || row["first name"] || "",
        lastName: row["lastname"] || row["last name"] || row["surname"] || "",
        assignmentNumber: row["assignment number"] || row["assignmentnumber"] || null,
        directorate: row["directorate"] || null,
        team: row["team"] || null,
        jobTitle: row["job title"] || row["jobtitle"] || null,
        frontline: row["frontline"]?.toLowerCase() !== "false",
        active: true,
      },
      create: {
        email,
        firstName: row["firstname"] || row["first name"] || "",
        lastName: row["lastname"] || row["last name"] || row["surname"] || "",
        assignmentNumber: row["assignment number"] || row["assignmentnumber"] || null,
        directorate: row["directorate"] || null,
        team: row["team"] || null,
        jobTitle: row["job title"] || row["jobtitle"] || null,
        frontline: row["frontline"]?.toLowerCase() !== "false",
        active: true,
        role: "STAFF",
        vaccinationRecord: { create: { status: "UNKNOWN" } },
      },
    })
  }

  console.log(`Imported staff from ${csvPath}`)
}

async function main() {
  const args = process.argv.slice(2)
  const csvFlagIndex = args.indexOf("--csv")

  if (csvFlagIndex !== -1 && args[csvFlagIndex + 1]) {
    const csvPath = path.resolve(args[csvFlagIndex + 1])
    await seedFromCSV(csvPath)
    return
  }

  console.log("Seeding development data...")

  await prisma.auditLog.deleteMany()
  await prisma.vaccineStock.deleteMany()
  await prisma.vaccinationRecord.deleteMany()
  await prisma.rAVSReconciliation.deleteMany()
  await prisma.clinic.deleteMany()
  await prisma.staff.deleteMany()

  const fluLead = await prisma.staff.create({
    data: {
      email: "sarah.johnson@nhs.net",
      assignmentNumber: "EMP001",
      firstName: "Sarah",
      lastName: "Johnson",
      directorate: "Corporate",
      team: "Infection Prevention & Control",
      jobTitle: "Infection Control Nurse",
      frontline: true,
      active: true,
      role: "FLU_LEAD",
      vaccinationRecord: {
        create: {
          status: "VACCINATED_ELFT",
          vaccinatedAt: new Date("2026-10-15"),
          vaccinatedBy: "self-recorded",
          site: "Mile End Hospital",
          batchNumber: "FLU-2026-A1",
        },
      },
    },
  })

  const vaccinator = await prisma.staff.create({
    data: {
      email: "james.okafor@nhs.net",
      assignmentNumber: "EMP002",
      firstName: "James",
      lastName: "Okafor",
      directorate: "Mental Health",
      team: "Community Mental Health East",
      jobTitle: "Senior Nurse",
      frontline: true,
      active: true,
      role: "VACCINATOR",
      vaccinationRecord: {
        create: {
          status: "VACCINATED_ELFT",
          vaccinatedAt: new Date("2026-10-16"),
          vaccinatedBy: fluLead.email,
          site: "Newham Centre for Mental Health",
          batchNumber: "FLU-2026-A2",
        },
      },
    },
  })

  await prisma.staff.create({
    data: {
      email: "priya.sharma@nhs.net",
      assignmentNumber: "EMP003",
      firstName: "Priya",
      lastName: "Sharma",
      directorate: "Community",
      team: "Tower Hamlets Community Nursing",
      jobTitle: "District Nurse",
      frontline: true,
      active: true,
      role: "STAFF",
      vaccinationRecord: {
        create: {
          status: "VACCINATED_ELSEWHERE",
          vaccinatedAt: new Date("2026-10-10"),
          vaccinatedBy: "self-recorded",
          notes: "Received at GP surgery",
        },
      },
    },
  })

  await prisma.staff.create({
    data: {
      email: "david.chen@nhs.net",
      assignmentNumber: "EMP004",
      firstName: "David",
      lastName: "Chen",
      directorate: "Mental Health",
      team: "Forensic Services",
      jobTitle: "Occupational Therapist",
      frontline: true,
      active: true,
      role: "STAFF",
      vaccinationRecord: {
        create: {
          status: "DECLINED",
          notes: "Declined — documented",
        },
      },
    },
  })

  await prisma.staff.create({
    data: {
      email: "amara.diallo@nhs.net",
      assignmentNumber: "EMP005",
      firstName: "Amara",
      lastName: "Diallo",
      directorate: "Corporate",
      team: "HR & Workforce",
      jobTitle: "HR Business Partner",
      frontline: false,
      active: true,
      role: "STAFF",
      vaccinationRecord: {
        create: { status: "UNKNOWN" },
      },
    },
  })

  await prisma.clinic.createMany({
    data: [
      {
        name: "Drop-in Flu Clinic",
        site: "Mile End Hospital",
        date: new Date("2026-11-05"),
        startTime: "09:00",
        endTime: "17:00",
        lead: "Sarah Johnson",
        notes: "No appointment needed. Enter via main entrance, follow green signs.",
        active: true,
      },
      {
        name: "Flu Jab Session",
        site: "Newham Centre for Mental Health",
        date: new Date("2026-11-12"),
        startTime: "10:00",
        endTime: "14:00",
        lead: "James Okafor",
        notes: "Staff only. Bring your ID badge.",
        active: true,
      },
      {
        name: "Community Hub Clinic",
        site: "Hackney Community Base",
        date: new Date("2026-11-19"),
        startTime: "08:30",
        endTime: "16:30",
        lead: "Sarah Johnson",
        active: true,
      },
    ],
  })

  // Demo vaccine stock entries
  await prisma.vaccineStock.createMany({
    data: [
      {
        location: "Mile End Hospital",
        stockCount: 48,
        notes: "New delivery received",
        recordedAt: new Date("2026-10-14T09:00:00"),
        recordedByStaffId: fluLead.id,
      },
      {
        location: "Newham Centre for Mental Health",
        stockCount: 30,
        recordedAt: new Date("2026-10-14T09:15:00"),
        recordedByStaffId: fluLead.id,
      },
      {
        location: "Goodmayes Hospital",
        stockCount: 20,
        recordedAt: new Date("2026-10-14T09:20:00"),
        recordedByStaffId: fluLead.id,
      },
      {
        location: "Mile End Hospital",
        stockCount: 31,
        notes: "After morning clinic",
        recordedAt: new Date("2026-10-20T13:00:00"),
        recordedByStaffId: fluLead.id,
      },
      {
        location: "Newham Centre for Mental Health",
        stockCount: 8,
        notes: "Running low — reorder requested",
        recordedAt: new Date("2026-10-20T13:10:00"),
        recordedByStaffId: fluLead.id,
      },
      {
        location: "Goodmayes Hospital",
        stockCount: 5,
        recordedAt: new Date("2026-10-20T13:20:00"),
        recordedByStaffId: fluLead.id,
      },
    ],
  })

  console.log("✓ Seed complete")
  console.log(`  Flu Lead:    ${fluLead.email}`)
  console.log(`  Vaccinator:  ${vaccinator.email}`)
  console.log("  Staff:       priya.sharma@nhs.net, david.chen@nhs.net, amara.diallo@nhs.net")
  console.log("  Clinics:     3 upcoming")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
