import { Suspense } from "react"
import { AuthShell } from "@/components/admin/auth-shell"
import { LoginForm } from "@/components/login-form"

export default function AdminLoginPage() {
  return (
    <AuthShell title="Sign in to manage the academy.">
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
