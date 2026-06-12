import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    "/my-record/:path*",
    "/vaccinator/:path*",
    "/admin/:path*",
    "/dashboard",
    "/clinics/add",
  ],
}
