"use client"

import * as React from "react"
import {
  Music,
  Home,
  User,
  Heart,
  Search,
  Settings,
  Shield,
  Upload,
  Users,
  CreditCard,
  LogIn,
  UserPlus,
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
import useSWR from "swr"
import { User as UserType } from "@/lib/db/schema"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: currentUser, error } = useSWR<UserType>('/api/user', fetcher)

  // Check if user is authenticated
  const isAuthenticated = currentUser && !error

  // Base navigation items for authenticated users
  const baseNavItems = [
    {
      title: "Beats",
      url: "/dashboard",
      icon: Music,
      isActive: true,
    },
  ]

  // Admin navigation items
  const adminNavItems = [
    {
      title: "Admin",
      url: "/admin",
      icon: Shield,
    },
    {
      title: "Upload Beat",
      url: "/admin/upload",
      icon: Upload,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Payments",
      url: "/admin/payments",
      icon: CreditCard,
    },
  ]

  // Login/signup navigation items for unauthenticated users
  const authNavItems = [
    {
      title: "Sign In",
      url: "/sign-in",
      icon: LogIn,
    },
    {
      title: "Sign Up",
      url: "/sign-up",
      icon: UserPlus,
    },
  ]

  // Combine navigation items based on authentication and user role
  let navItems = []
  if (isAuthenticated) {
    navItems = currentUser.role === 'admin' 
      ? [...baseNavItems, ...adminNavItems]
      : baseNavItems
  } else {
    navItems = authNavItems
  }

  const data = {
    user: isAuthenticated ? {
      name: currentUser.name || "User",
      email: currentUser.email,
      avatar: "/avatars/stacho.jpg",
    } : {
      name: "Guest",
      email: "Not logged in",
      avatar: "/avatars/guest.jpg",
    },
    navMain: navItems,
  }

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
