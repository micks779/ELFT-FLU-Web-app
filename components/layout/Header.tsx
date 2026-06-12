import Link from "next/link"

interface HeaderProps {
  title?: string
  settingsHref?: string
}

export default function Header({ title = "Flu Vaccination 26/27", settingsHref }: HeaderProps) {
  return (
    <header className="nhs-header" role="banner">
      <Link href="/" className="text-white hover:text-nhs-pale-grey transition-colors">
        <span className="text-lg font-bold tracking-tight">{title}</span>
        <span className="block text-xs text-nhs-light-blue font-normal">
          East London NHS Foundation Trust
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {settingsHref && (
          <Link
            href={settingsHref}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Admin settings"
            title="Admin settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        )}
        <div
          aria-label="ELFT logo"
          className="h-10 w-20 bg-nhs-dark-blue flex items-center justify-center rounded text-white text-sm font-bold border border-white/30"
        >
          ELFT
        </div>
      </div>
    </header>
  )
}
