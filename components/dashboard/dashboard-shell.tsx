"use client"

/**
 * @deprecated Prefer rendering page content directly under DashboardChrome
 * (layout). Kept as a thin pass-through for gradual migration.
 */
export function DashboardShell({
  children,
}: {
  title?: string
  children:
    | React.ReactNode
    | ((args: {
        user: unknown
        loading: boolean
        error: string
        reload: () => Promise<void>
      }) => React.ReactNode)
}) {
  // Session + chrome live in the dashboard layout now.
  if (typeof children === "function") {
    // Pages that used the render-prop no longer need session from shell.
    return <>{children({ user: null, loading: false, error: "", reload: async () => {} })}</>
  }
  return <>{children}</>
}
