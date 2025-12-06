"use client"

import { useState, useEffect } from "react"
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
import { getIconSize } from "@/lib/utils/icon-sizes"

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
import { supabase } from "@/lib/supabase"
import { fetcher, CACHE_KEYS } from "@/lib/swr/config"
import { useFeatureFlag } from "@/lib/swr/hooks"

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
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const { data: currentUser, error, mutate: mutateUser } = useSWR<User>(CACHE_KEYS.USER, fetcher)
  const { enabled: billingEnabled } = useFeatureFlag('BILLING_ENABLED');
  const { enabled: notificationsEnabled } = useFeatureFlag('NOTIFICATIONS_ENABLED');

  // Check Supabase session on client side
  useEffect(() => {
    const checkSupabaseSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseUser(session.user);
        // Don't mutate - SWR will handle caching and deduplication
        // Only mutate if we need to force a refresh
      }
    };

    checkSupabaseSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        // Only mutate on sign in/out, not on every auth state change
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
          mutateUser();
        }
      } else {
        setSupabaseUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mutateUser]);

  async function handleSignOut() {
    // Sign out from Supabase if logged in via OAuth
    if (supabaseUser) {
      await supabase.auth.signOut();
    }
    await signOut()
    mutateUser()
    router.push('/')
  }

  // Check if user is authenticated (either from API or Supabase)
  const isAuthenticated = !!(currentUser && !error) || !!supabaseUser
  
  // Determine which user to display
  const displayUser = isAuthenticated && currentUser 
    ? currentUser 
    : supabaseUser 
      ? {
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                supabaseUser.email?.split('@')[0] || 
                "User",
          email: supabaseUser.email || user.email,
          avatar: supabaseUser.user_metadata?.avatar_url || user.avatar,
        }
      : user
  
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
                <AvatarImage src={'avatar' in displayUser ? displayUser.avatar : undefined} alt={displayUser.name || displayUser.email} />
                <AvatarFallback className="rounded-lg">
                  {isGuest ? 'G' : displayUser.email
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{displayUser.name || displayUser.email}</span>
                  {isAuthenticated && 'role' in displayUser && displayUser.role === 'admin' && (
                    <Shield className={`${getIconSize('sm')} text-green-500`} />
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
                  <AvatarImage src={'avatar' in displayUser ? displayUser.avatar : undefined} alt={displayUser.name || displayUser.email} />
                  <AvatarFallback className="rounded-lg">
                    {isGuest ? 'G' : displayUser.email
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{displayUser.name || displayUser.email}</span>
                    {isAuthenticated && 'role' in displayUser && displayUser.role === 'admin' && (
                      <Shield className={`${getIconSize('sm')} text-green-500`} />
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
                  <DropdownMenuItem onClick={() => router.push('/account')}>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  {billingEnabled && (
                    <DropdownMenuItem>
                      <CreditCard />
                      Billing
                    </DropdownMenuItem>
                  )}
                  {notificationsEnabled && (
                    <DropdownMenuItem>
                      <Bell />
                      Notifications
                    </DropdownMenuItem>
                  )}
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
