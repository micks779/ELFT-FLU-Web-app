import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { parse } from "csv-parse/sync"
import Fuse from "fuse.js"
import crypto from "crypto"

function currentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startYear = now.getMonth() + 1 >= 4 ? year : year - 1
  return `${startYear}/${(startYear + 1).toString().slice(2)}`
}

function normalize(s: string): string {
  return s.replace(/-/g, "").trim().toLowerCase()
}

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex")
}

function confidenceFromFuseScore(score: number | undefined): number {
  if (score === undefined) return 0
  return Math.round((1 - score) * 100)
}

interface RavsRow {
  nhsNumber: string
  firstName: string
  lastName: string
  postcode: string
  vaccineDate: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "FLU_LEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let file: File | null = null
  try {
    const formData = await req.formData()
    file = formData.get("file") as File | null
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const csvText = await file.text()

  let rows: RavsRow[]
  try {
    const raw: Record<string, string>[] = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
    rows = raw.map((r) => ({
      nhsNumber: r["NHS Number"] ?? r["nhs_number"] ?? r["NHSNumber"] ?? "",
      firstName: r["First Name"] ?? r["first_name"] ?? r["FirstName"] ?? "",
      lastName: r["Last Name"] ?? r["last_name"] ?? r["LastName"] ?? "",
      postcode: r["Postcode"] ?? r["postcode"] ?? "",
      vaccineDate: r["Vaccine Date"] ?? r["vaccine_date"] ?? r["VaccineDate"] ?? "",
    }))
  } catch {
    return NextResponse.json({ error: "Failed to parse CSV — check column headers" }, { status: 400 })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV file contains no records" }, { status: 400 })
  }

  const season = currentSeason()

  // ── Load reference data ──────────────────────────────────────────────
  const [allStaff, nhsHistory] = await Promise.all([
    prisma.staff.findMany({
      where: { active: true },
      select: { id: true, firstName: true, lastName: true, assignmentNumber: true },
    }),
    prisma.staffNHSHistory.findMany({
      select: { nhsNumberHash: true, assignmentNumber: true, firstName: true, lastName: true, postcode: true },
    }),
  ])

  // TIER 1 map: NHS hash → assignmentNumber
  const hashToAssignment = new Map<string, string>()
  // TIER 2 map: normalizedFirstName|normalizedLastName|POSTCODE → assignmentNumber
  const namePostcodeToAssignment = new Map<string, string>()

  for (const h of nhsHistory) {
    if (h.nhsNumberHash) hashToAssignment.set(h.nhsNumberHash, h.assignmentNumber)
    const key = `${normalize(h.firstName)}|${normalize(h.lastName)}|${h.postcode.replace(/\s+/g, "").toUpperCase()}`
    namePostcodeToAssignment.set(key, h.assignmentNumber)
  }

  // assignmentNumber → staffId
  const assignmentToStaffId = new Map<string, string>()
  for (const s of allStaff) {
    if (s.assignmentNumber) assignmentToStaffId.set(s.assignmentNumber, s.id)
  }

  // TIER 3-4: Fuse.js indices on Staff table
  const fuseItems = allStaff.map((s) => ({
    id: s.id,
    fullName: `${normalize(s.firstName)} ${normalize(s.lastName)}`,
    lastName: normalize(s.lastName),
  }))

  const fuseFullName = new Fuse(fuseItems, {
    keys: ["fullName"],
    threshold: 0.3,
    includeScore: true,
  })

  const fuseLastName = new Fuse(fuseItems, {
    keys: ["lastName"],
    threshold: 0.3,
    includeScore: true,
  })

  // ── Process each row ─────────────────────────────────────────────────
  type RecordData = {
    season: string
    ravsNHSHash: string
    ravsSurname: string
    ravsFirstName: string
    ravsPostcode: string
    vaccineDate: string | null
    matchedStaffId: string | null
    matchTier: number | null
    confidenceScore: number | null
    status: string
  }

  const records: RecordData[] = []
  let matched = 0, probable = 0, possible = 0, unmatched = 0

  for (const row of rows) {
    const cleanNhs = row.nhsNumber.replace(/\s+/g, "")
    const nhsHash = sha256(cleanNhs)
    const ravsPostcode = row.postcode.replace(/\s+/g, "").toUpperCase()
    const ravsNormFirst = normalize(row.firstName)
    const ravsNormLast = normalize(row.lastName)
    const ravsFullName = `${ravsNormFirst} ${ravsNormLast}`

    let status = "UNMATCHED"
    let matchedStaffId: string | null = null
    let matchTier: number | null = null
    let confidenceScore: number | null = null

    // TIER 1 — NHS number hash
    if (cleanNhs) {
      const assignNum = hashToAssignment.get(nhsHash)
      if (assignNum) {
        const staffId = assignmentToStaffId.get(assignNum)
        if (staffId) {
          status = "MATCHED"; matchedStaffId = staffId; matchTier = 1; confidenceScore = 100
        }
      }
    }

    // TIER 2 — Exact name + postcode (via StaffNHSHistory)
    if (status === "UNMATCHED") {
      const key = `${ravsNormFirst}|${ravsNormLast}|${ravsPostcode}`
      const assignNum = namePostcodeToAssignment.get(key)
      if (assignNum) {
        const staffId = assignmentToStaffId.get(assignNum)
        if (staffId) {
          status = "MATCHED"; matchedStaffId = staffId; matchTier = 2; confidenceScore = 95
        }
      }
    }

    // TIER 3 — Fuzzy full name (Staff table)
    if (status === "UNMATCHED") {
      const results = fuseFullName.search(ravsFullName)
      if (results.length > 0) {
        const conf = confidenceFromFuseScore(results[0].score)
        if (conf >= 85) {
          status = "PROBABLE"; matchedStaffId = results[0].item.id; matchTier = 3; confidenceScore = conf
        }
      }
    }

    // TIER 4 — Fuzzy surname only (Staff table)
    if (status === "UNMATCHED") {
      const results = fuseLastName.search(ravsNormLast)
      if (results.length > 0) {
        const conf = confidenceFromFuseScore(results[0].score)
        if (conf >= 85) {
          status = "POSSIBLE"; matchedStaffId = results[0].item.id; matchTier = 4; confidenceScore = conf
        }
      }
    }

    if (status === "MATCHED" || status === "PROBABLE") matched++
    else if (status === "POSSIBLE") probable++
    else possible++

    if (status === "UNMATCHED") { unmatched++; matched-- || probable-- || possible-- }

    records.push({
      season,
      ravsNHSHash: nhsHash,
      ravsSurname: row.lastName.trim(),
      ravsFirstName: row.firstName.trim(),
      ravsPostcode,
      vaccineDate: row.vaccineDate || null,
      matchedStaffId,
      matchTier,
      confidenceScore,
      status,
    })
  }

  // Recount cleanly
  const counts = { matched: 0, probable: 0, possible: 0, unmatched: 0 }
  for (const r of records) {
    if (r.status === "MATCHED") counts.matched++
    else if (r.status === "PROBABLE") counts.probable++
    else if (r.status === "POSSIBLE") counts.possible++
    else counts.unmatched++
  }

  // Replace existing season records then insert
  await prisma.rAVSReconciliation.deleteMany({ where: { season } })
  await prisma.rAVSReconciliation.createMany({ data: records })

  return NextResponse.json({
    total: records.length,
    matched: counts.matched,
    probable: counts.probable,
    possible: counts.possible,
    unmatched: counts.unmatched,
    season,
  })
}
