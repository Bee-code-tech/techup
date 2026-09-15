"use client"

import { SolarIcon } from "@/components/icons/solar-icon"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandLogo } from "@/components/admin/brand-logo"
import { WhatsappGroupNav } from "@/components/admin/whatsapp-group-nav"
import { LearnModulesSidebar } from "@/components/dashboard/learn-modules-sidebar"
import { SidebarNavSkeleton } from "@/components/dashboard/page-skeletons"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { Role } from "@/lib/roles"
type DashUser = {
  name: string
  email: string
  role: string
  avatarUrl?: string | null
}

function settingsItem(pathname: string) {
  return {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <SolarIcon name="settings" />,
    isActive: pathname.startsWith("/dashboard/settings"),
  }
}

function navForRole(role: Role | string, pathname: string) {
  if (role === "admin") {
    return [
      {
        title: "Overview",
        url: "/dashboard",
        icon: <SolarIcon name="widget-5" />,
        isActive: pathname === "/dashboard",
      },
      {
        title: "Students",
        url: "/dashboard/students",
        icon: <SolarIcon name="users-group-rounded" />,
        isActive: pathname.startsWith("/dashboard/students"),
      },
      {
        title: "Tutors",
        url: "/dashboard/tutors",
        icon: <SolarIcon name="user-id" />,
        isActive: pathname.startsWith("/dashboard/tutors"),
      },
      {
        title: "Broadcast",
        url: "/dashboard/broadcast",
        icon: <SolarIcon name="letter" />,
        isActive: pathname.startsWith("/dashboard/broadcast"),
      },
      {
        title: "Payments",
        url: "/dashboard/payments",
        icon: <SolarIcon name="card" />,
        isActive: pathname.startsWith("/dashboard/payments"),
      },
      {
        title: "Scholarships",
        url: "/dashboard/scholarships",
        icon: <SolarIcon name="square-academic-cap" />,
        isActive: pathname.startsWith("/dashboard/scholarships"),
      },
      settingsItem(pathname),
    ]
  }

  if (role === "tutor") {
    return [
      {
        title: "Overview",
        url: "/dashboard",
        icon: <SolarIcon name="widget-5" />,
        isActive: pathname === "/dashboard",
      },
      {
        title: "My courses",
        url: "/dashboard/courses/manage",
        icon: <SolarIcon name="book" />,
        isActive: pathname.startsWith("/dashboard/courses/manage"),
      },
      {
        title: "Messages",
        url: "/dashboard/messages",
        icon: <SolarIcon name="chat-round-dots" />,
        isActive: pathname.startsWith("/dashboard/messages"),
      },
      {
        title: "Assignments",
        url: "/dashboard/assignments/review",
        icon: <SolarIcon name="clipboard-check" />,
        isActive: pathname.startsWith("/dashboard/assignments/review"),
      },
      settingsItem(pathname),
    ]
  }

  return [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <SolarIcon name="widget-5" />,
      isActive: pathname === "/dashboard",
    },
    {
      title: "My learning",
      url: "/dashboard/learn",
      icon: <SolarIcon name="square-academic-cap" />,
      isActive: pathname.startsWith("/dashboard/learn"),
    },
    {
      title: "Assignments",
      url: "/dashboard/assignments",
      icon: <SolarIcon name="clipboard-list" />,
      isActive:
        pathname.startsWith("/dashboard/assignments") &&
        !pathname.startsWith("/dashboard/assignments/review"),
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: <SolarIcon name="chat-round-dots" />,
      isActive: pathname.startsWith("/dashboard/messages"),
    },
    {
      title: "Leaderboard",
      url: "/dashboard/leaderboard",
      icon: <SolarIcon name="cup-star" />,
      isActive: pathname.startsWith("/dashboard/leaderboard"),
    },
    {
      title: "Certificates",
      url: "/dashboard/certificates",
      icon: <SolarIcon name="diploma" />,
      isActive: pathname.startsWith("/dashboard/certificates"),
    },
    settingsItem(pathname),
  ]
}

function brandLabel(role: string) {
  if (role === "admin") return "TechUp Admin"
  if (role === "tutor") return "Tutor studio"
  return "Student hub"
}

export function DashboardSidebar({
  user,
  sessionLoading = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: DashUser | null
  sessionLoading?: boolean
}) {
  const pathname = usePathname()
  const role = user?.role
  const navMain = role ? navForRole(role, pathname) : []
  const inCoursePlayer = pathname.startsWith("/dashboard/learn/course/")

  if (inCoursePlayer && user && role === "student") {
    return <LearnModulesSidebar user={user} {...props} />
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-3 px-2"
              render={<Link href="/dashboard" />}
            >
              <BrandLogo size={36} />
              {sessionLoading || !role ? (
                <Skeleton className="h-5 w-28 rounded-md" />
              ) : (
                <span className="text-base font-semibold">
                  {brandLabel(role)}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sessionLoading || !role ? (
          <SidebarNavSkeleton count={4} />
        ) : (
          <NavMain items={navMain} />
        )}
      </SidebarContent>
      <SidebarFooter className="gap-2">
        {role === "admin" ? <WhatsappGroupNav /> : null}
        {sessionLoading || !user ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
        ) : (
          <NavUser
            user={{
              name: user.name,
              email: user.email,
              avatar: user.avatarUrl || "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
