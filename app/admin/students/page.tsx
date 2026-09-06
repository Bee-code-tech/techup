import { redirect } from "next/navigation"

export default function AdminStudentsRedirect() {
  redirect("/dashboard/students")
}
