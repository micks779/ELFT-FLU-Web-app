import { signIn } from "@/auth"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

function FluIcon() {
  return (
    <svg
      className="w-16 h-16 text-nhs-light-blue mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <circle cx="32" cy="14" r="8" fill="currentColor" opacity="0.8" />
      <path d="M20 30 C20 22 44 22 44 30 L46 52 H18 Z" fill="currentColor" opacity="0.7" />
      <path d="M44 28 Q50 24 54 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <circle cx="55" cy="17" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="58" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="60" cy="20" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

interface PageProps {
  searchParams: Promise<{ site?: string; error?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const site = params.site
  const hasError = params.error

  const redirectTo = site ? `/my-record/update?site=${encodeURIComponent(site)}` : "/dashboard"
  const isDev = process.env.NODE_ENV === "development"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12" id="main-content">
        <div className="w-full max-w-md">
          <div className="card text-center space-y-6">
            <div>
              <FluIcon />
              <h1 className="text-2xl font-bold text-nhs-black mt-4">
                ELFT Flu Vaccination 2026/27
              </h1>
              <p className="text-nhs-dark-grey mt-2">
                Help protect your patients and colleagues this winter
              </p>
            </div>

            {site && (
              <div className="bg-nhs-pale-grey rounded-md px-4 py-3 text-sm text-nhs-dark-grey">
                <span className="font-semibold">Clinic site:</span>{" "}
                {decodeURIComponent(site).replace(/-/g, " ")}
              </div>
            )}

            {hasError && !isDev && (
              <div
                className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                There was a problem signing you in. Please try again or contact your Flu Lead.
              </div>
            )}

            <form
              action={async () => {
                "use server"
                await signIn("microsoft-entra-id", { redirectTo })
              }}
            >
              <button
                type="submit"
                className="btn-primary"
                aria-label="Sign in with your NHS Microsoft account"
              >
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="currentColor" aria-hidden="true">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Sign in with NHS Account
              </button>
            </form>

            <p className="text-xs text-gray-500">
              Use your ELFT Microsoft account (e.g. name@nhs.net)
            </p>

            {/* Dev-only login panel — never shown in production */}
            {isDev && (
              <div className="border-t border-dashed border-gray-300 pt-5 text-left">
                <p className="text-xs font-mono text-nhs-mid-grey mb-3 text-center">
                  🛠 DEV LOGIN — no Azure AD required
                </p>
                <form
                  action={async (formData: FormData) => {
                    "use server"
                    const email = formData.get("email") as string
                    await signIn("dev-credentials", { email, redirectTo: "/dashboard" })
                  }}
                >
                  <label htmlFor="dev-email" className="field-label text-xs">
                    Sign in as:
                  </label>
                  <select id="dev-email" name="email" className="field-input text-sm mb-3">
                    <option value="sarah.johnson@nhs.net">Sarah Johnson — Flu Lead</option>
                    <option value="james.okafor@nhs.net">James Okafor — Vaccinator</option>
                    <option value="priya.sharma@nhs.net">Priya Sharma — Staff (vaccinated elsewhere)</option>
                    <option value="david.chen@nhs.net">David Chen — Staff (declined)</option>
                    <option value="amara.diallo@nhs.net">Amara Diallo — Staff (not recorded)</option>
                  </select>
                  <button type="submit" className="btn-outline">
                    Sign in as selected user
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
