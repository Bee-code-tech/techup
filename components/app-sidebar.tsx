"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandLogo } from "@/components/admin/brand-logo"
import { WhatsappGroupNav } from "@/components/admin/whatsapp-group-nav"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  MailIcon,
  UsersIcon,
} from "lucide-react"

type AdminUser = {
  name: string
  email: string
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: AdminUser | null }) {
  const pathname = usePathname()

  const navMain = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
      isActive: pathname === "/admin",
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: <UsersIcon />,
      isActive: pathname.startsWith("/admin/students"),
    },
    {
      title: "Broadcast",
      url: "/admin/broadcast",
      icon: <MailIcon />,
      isActive: pathname.startsWith("/admin/broadcast"),
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-3 px-2"
              render={<Link href="/admin" />}
            >
              <BrandLogo size={36} />
              <span className="text-base font-semibold">TechUp Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="gap-2">
        <WhatsappGroupNav />
        <NavUser
          user={{
            name: user?.name || "Admin",
            email: user?.email || "admin@techupacademyng.com",
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
