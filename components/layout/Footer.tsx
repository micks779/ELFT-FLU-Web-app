export default function Footer() {
  return (
    <footer className="bg-nhs-dark-grey text-white mt-auto" role="contentinfo">
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        <p className="text-gray-300">
          This service is provided by ELFT. Your data is processed in accordance with UK GDPR.
        </p>
        <p className="text-gray-400 shrink-0">ELFT Data &amp; Analytics</p>
      </div>
    </footer>
  )
}
