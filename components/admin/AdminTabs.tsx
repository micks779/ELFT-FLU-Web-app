"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { label: "Manage Roles", href: "/admin" },
  { label: "Vaccine Tracker", href: "/admin/vaccine-tracker" },
]

export default function AdminTabs() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-0 border-b border-gray-200 mb-6" aria-label="Admin sections">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              active
                ? "border-nhs-blue text-nhs-blue"
                : "border-transparent text-nhs-dark-grey hover:text-nhs-black hover:border-gray-300"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
