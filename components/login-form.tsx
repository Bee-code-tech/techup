"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        toast.error(payload.error || "Invalid email or password.")
        return
      }

      toast.success("Welcome back")
      router.push(searchParams.get("next") || "/admin")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-2xl border-border/70 py-8 shadow-none">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Login to your account
          </CardTitle>
          <CardDescription className="text-base">
            Enter your admin email below to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              <Field>
                <FieldLabel htmlFor="email" className="text-[15px]">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@techupacademyng.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 px-3.5 text-base md:text-base"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-[15px]">
                  Password
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 px-3.5 text-base md:text-base"
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="h-12 w-full text-base"
                  disabled={pending}
                >
                  {pending ? "Signing in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
