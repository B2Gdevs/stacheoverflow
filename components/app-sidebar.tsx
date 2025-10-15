"use client"

import * as React from "react"
import {
  Music,
  Home,
  User,
  Heart,
  Search,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Beats marketplace data
const data = {
  user: {
    name: "StachO",
    email: "stacho@example.com",
    avatar: "/avatars/stacho.jpg",
  },
  navMain: [
    {
      title: "Beats",
      url: "/dashboard",
      icon: Music,
      isActive: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Music className="h-6 w-6 text-green-500" />
          <span className="text-lg font-semibold text-white">StachO</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
