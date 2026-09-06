import { redirect } from "next/navigation"

/** Live class for students now lives on Overview as a callout. */
export default function StudentLiveRedirectPage() {
  redirect("/dashboard")
}
