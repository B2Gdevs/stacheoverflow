"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Shield,
  LogIn,
  UserPlus,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/app/(login)/actions"
import useSWR, { mutate } from "swr"
import { User } from "@/lib/db/schema"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { data: currentUser, error } = useSWR<User>('/api/user', fetcher)

  async function handleSignOut() {
    await signOut()
    mutate('/api/user')
    router.push('/')
  }

  // Check if user is authenticated
  const isAuthenticated = currentUser && !error
  const displayUser = isAuthenticated ? currentUser : user
  const isGuest = !isAuthenticated

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                <AvatarFallback className="rounded-lg">
                  {isGuest ? 'G' : displayUser.email
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{displayUser.name}</span>
                  {isAuthenticated && displayUser.role === 'admin' && (
                    <Shield className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <span className="truncate text-xs">{displayUser.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                  <AvatarFallback className="rounded-lg">
                    {isGuest ? 'G' : displayUser.email
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{displayUser.name}</span>
                    {isAuthenticated && displayUser.role === 'admin' && (
                      <Shield className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <span className="truncate text-xs">{displayUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isGuest ? (
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/sign-in')}>
                  <LogIn />
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/sign-up')}>
                  <UserPlus />
                  Sign Up
                </DropdownMenuItem>
              </DropdownMenuGroup>
            ) : (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <form action={handleSignOut} className="w-full">
                  <button type="submit" className="flex w-full">
                    <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </button>
                </form>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
