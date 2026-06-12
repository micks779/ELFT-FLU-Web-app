import type { Metadata } from "next"
import "./globals.css"
import SessionWrapper from "@/components/layout/SessionWrapper"

export const metadata: Metadata = {
  title: "ELFT Flu Vaccination 2026/27",
  description: "ELFT staff flu vaccination recording and management platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-nhs-black min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}
