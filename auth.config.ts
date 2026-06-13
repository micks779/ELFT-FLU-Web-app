import type { NextAuthConfig } from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const authConfig: NextAuthConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      // Restrict to single NHS tenant. Omit issuer to allow any Microsoft account.
      issuer: process.env.AZURE_AD_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0/`
        : undefined,
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.staffId = token.staffId as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const protectedPaths = ["/my-record", "/vaccinator", "/admin", "/dashboard", "/clinics/add"]
      const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl))
      }

      const role = auth?.user?.role as string | undefined

      if (pathname.startsWith("/admin") && role !== "FLU_LEAD") {
        return Response.redirect(new URL("/my-record", nextUrl))
      }

      if (
        (pathname.startsWith("/vaccinator") || pathname === "/clinics/add") &&
        !["VACCINATOR", "FLU_LEAD"].includes(role ?? "")
      ) {
        return Response.redirect(new URL("/my-record", nextUrl))
      }

      return true
    },
  },
}
