const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  VACCINATED_ELFT: {
    bg: "bg-nhs-green",
    text: "text-white",
    label: "✓ Vaccinated at ELFT",
  },
  VACCINATED_ELSEWHERE: {
    bg: "bg-nhs-bright-blue",
    text: "text-white",
    label: "✓ Vaccinated elsewhere",
  },
  DECLINED: {
    bg: "bg-yellow-400",
    text: "text-gray-900",
    label: "Declined this year",
  },
  UNKNOWN: {
    bg: "bg-gray-300",
    text: "text-gray-700",
    label: "Status not yet recorded",
  },
}

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md"
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.UNKNOWN
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${cfg.bg} ${cfg.text} ${sizeClass}`}
      role="status"
      aria-label={`Vaccination status: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  )
}
