export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(date: Date | string | null | undefined, startTime?: string, endTime?: string): string {
  if (!date) return "—"
  const dateStr = formatShortDate(date)
  if (startTime && endTime) return `${dateStr} · ${startTime}–${endTime}`
  if (startTime) return `${dateStr} · ${startTime}`
  return dateStr
}

export function formatUptake(vaccinated: number, eligible: number): string {
  if (eligible === 0) return "0.0%"
  return ((vaccinated / eligible) * 100).toFixed(1) + "%"
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    VACCINATED_ELFT: "Vaccinated at ELFT",
    VACCINATED_ELSEWHERE: "Vaccinated elsewhere",
    DECLINED: "Declined",
    UNKNOWN: "Not yet recorded",
  }
  return labels[status] ?? status
}

export function toCSVRow(values: (string | number | null | undefined)[]): string {
  return values
    .map((v) => {
      const str = v == null ? "" : String(v)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    .join(",")
}
