"use client"

import { useState } from "react"
import DirectorateTable from "@/components/admin/DirectorateTable"
import StaffTable from "@/components/admin/StaffTable"
import RoleManager from "@/components/admin/RoleManager"
import EsrFlagsTab from "@/components/admin/EsrFlagsTab"
import ReconciliationTab from "@/components/admin/ReconciliationTab"

interface DirectorateRow {
  directorate: string
  eligible: number
  vaccinated: number
}

interface StaffTableRow {
  id: string
  firstName: string
  lastName: string
  directorate: string | null
  team: string | null
  vaccinationRecord: { status: string; updatedAt: string } | null
}

interface StaffRoleRow {
  id: string
  firstName: string
  lastName: string
  email: string
  directorate: string | null
  role: string
}

interface EsrFlagRow {
  directorate: string | null
  team: string | null
  esrFlaggedAt: string | null
  esrConfirmed: boolean
}

interface ReconSummary {
  total: number
  matched: number
  probable: number
  possible: number
  unmatched: number
  confirmed: number
  tier1: number
  tier2: number
  tier3: number
}

interface AdminTabsProps {
  directorateRows: DirectorateRow[]
  staffTableData: StaffTableRow[]
  allRolesStaff: StaffRoleRow[]
  esrFlagRows: EsrFlagRow[]
  ravsUnmatchedCount: number
  reconSummary: ReconSummary | null
  possibleByDirectorate: Array<{ directorate: string | null; count: number }>
  unmatchedByDirectorate: Array<{ directorate: string | null; count: number }>
  esrFlaggedCount: number
  currentSeason: string
}

const tabs = ["By Directorate", "All Staff", "Manage Roles", "ESR Flags", "Reconciliation"] as const
type Tab = (typeof tabs)[number]

export default function AdminTabs({
  directorateRows,
  staffTableData,
  allRolesStaff,
  esrFlagRows,
  ravsUnmatchedCount,
  reconSummary,
  possibleByDirectorate,
  unmatchedByDirectorate,
  esrFlaggedCount,
  currentSeason,
}: AdminTabsProps) {
  const [active, setActive] = useState<Tab>("By Directorate")

  return (
    <div>
      <div
        className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            aria-controls={`tab-panel-${tab.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => setActive(tab)}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              active === tab
                ? "border-nhs-blue text-nhs-blue bg-white"
                : "border-transparent text-nhs-mid-grey hover:text-nhs-dark-grey"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {active === "By Directorate" && (
          <div id="tab-panel-by-directorate" role="tabpanel" aria-label="Uptake by directorate">
            <DirectorateTable rows={directorateRows} />
          </div>
        )}

        {active === "All Staff" && (
          <div id="tab-panel-all-staff" role="tabpanel" aria-label="All staff vaccination records">
            <StaffTable staff={staffTableData} />
          </div>
        )}

        {active === "Manage Roles" && (
          <div id="tab-panel-manage-roles" role="tabpanel" aria-label="Manage staff roles">
            <RoleManager staff={allRolesStaff} />
          </div>
        )}

        {active === "ESR Flags" && (
          <div id="tab-panel-esr-flags" role="tabpanel" aria-label="ESR flagged staff">
            <EsrFlagsTab rows={esrFlagRows} ravsUnmatchedCount={ravsUnmatchedCount} />
          </div>
        )}

        {active === "Reconciliation" && (
          <div id="tab-panel-reconciliation" role="tabpanel" aria-label="RAVS reconciliation">
            <ReconciliationTab
              summary={reconSummary}
              possibleByDirectorate={possibleByDirectorate}
              unmatchedByDirectorate={unmatchedByDirectorate}
              esrFlaggedCount={esrFlaggedCount}
              currentSeason={currentSeason}
            />
          </div>
        )}
      </div>
    </div>
  )
}
