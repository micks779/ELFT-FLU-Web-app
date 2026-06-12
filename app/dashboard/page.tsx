import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  if (session.user.notFound) {
    redirect("/not-found-staff")
  }

  const role = session.user.role

  redirect("/my-record")
}
