import { signOut } from "@/auth"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function NotFoundStaffPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12" id="main-content">
        <div className="w-full max-w-lg">
          <div className="card text-center space-y-6">
            <div
              className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto"
              aria-hidden="true"
            >
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-nhs-black">
                We couldn&apos;t find your staff record
              </h1>
              <p className="text-nhs-dark-grey mt-3">
                Your NHS account was recognised, but we couldn&apos;t match it to an eligible staff
                record on our system.
              </p>
              <p className="text-nhs-dark-grey mt-2">
                This may be because your record is still being set up, or your email address differs
                from your ESR record.
              </p>
            </div>

            <div className="bg-nhs-pale-grey rounded-md px-4 py-4 text-sm text-nhs-dark-grey text-left space-y-1">
              <p className="font-semibold">What to do next:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Contact your Flu Lead or line manager</li>
                <li>Email the infection control team at your site</li>
                <li>Check your NHS email is the same as your ESR record</li>
              </ul>
            </div>

            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <button type="submit" className="btn-primary">
                Sign Out and Try Again
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
