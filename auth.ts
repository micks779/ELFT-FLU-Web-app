import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"

// Email-only login for local development
const devProvider =
  process.env.NODE_ENV === "development"
    ? [
        Credentials({
          id: "dev-credentials",
          name: "Dev Login",
          credentials: {
            email: { label: "Email", type: "email" },
          },
          async authorize(credentials) {
            const email = credentials?.email as string | undefined
            if (!email) return null
            const staff = await prisma.staff.findUnique({
              where: { email },
              select: { id: true, email: true, firstName: true, lastName: true, active: true },
            })
            if (!staff || !staff.active) return null
            return {
              id: staff.id,
              email: staff.email,
              name: `${staff.firstName} ${staff.lastName}`,
            }
          },
        }),
      ]
    : []

// Password-protected demo login — enabled only when DEMO_PASSWORD env var is set
const demoProvider =
  process.env.DEMO_PASSWORD
    ? [
        Credentials({
          id: "demo-credentials",
          name: "Demo Login",
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          async authorize(credentials) {
            if (!credentials?.password || credentials.password !== process.env.DEMO_PASSWORD) return null
            const email = credentials?.email as string | undefined
            if (!email) return null
            const staff = await prisma.staff.findUnique({
              where: { email },
              select: { id: true, email: true, firstName: true, lastName: true, active: true },
            })
            if (!staff || !staff.active) return null
            return {
              id: staff.id,
              email: staff.email,
              name: `${staff.firstName} ${staff.lastName}`,
            }
          },
        }),
      ]
    : []

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...devProvider, ...demoProvider],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, user }) {
      if (account) {
        const email = token.email ?? user?.email
        if (!email) return token
        const staff = await prisma.staff.findUnique({
          where: { email },
          select: { id: true, role: true, firstName: true, active: true },
        })
        if (staff && staff.active) {
          token.role = staff.role
          token.staffId = staff.id
          token.firstName = staff.firstName
        } else {
          token.notFound = true
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.staffId = token.staffId as string
        session.user.firstName = token.firstName as string
        session.user.notFound = token.notFound as boolean
      }
      return session
    },
  },
})
