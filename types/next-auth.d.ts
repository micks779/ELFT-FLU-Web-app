import { DefaultSession, DefaultJWT } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
      staffId: string
      firstName: string
      notFound?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string
    staffId?: string
    firstName?: string
    notFound?: boolean
  }
}
