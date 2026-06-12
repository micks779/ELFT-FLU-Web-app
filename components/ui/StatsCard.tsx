interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

export default function StatsCard({ label, value, sub, highlight }: StatsCardProps) {
  return (
    <div className={`card text-center ${highlight ? "border-nhs-green border-2" : ""}`}>
      <p className="text-sm text-nhs-mid-grey font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-4xl font-bold mt-2 ${highlight ? "text-nhs-green" : "text-nhs-black"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
