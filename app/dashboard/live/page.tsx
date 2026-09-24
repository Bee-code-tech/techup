import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"

/** Students join from Overview. Tutors and admins manage classes here. */
export default async function LiveIndexPage() {
  const session = await getSession()
  if (!session) redirect("/auth")
  if (session.role === "student") redirect("/dashboard")
  redirect("/dashboard/live/manage")
}
