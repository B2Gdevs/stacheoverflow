"use client"

import * as React from "react"
import { useEffect, useState } from "react"
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
  Crown,
  FileText,
  Gift,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import useSWR from "swr"
import { User as UserType } from "@/lib/db/schema"
import { supabase } from "@/lib/supabase"
import { fetcher, CACHE_KEYS } from "@/lib/swr/config"
import { isFeatureEnabledSync } from "@/lib/feature-flags"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const { data: currentUser, error, mutate } = useSWR<UserType>(CACHE_KEYS.USER, fetcher);

  // Check Supabase session on client side
  useEffect(() => {
    const checkSupabaseSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          // Don't mutate - SWR will handle caching and deduplication
        } else {
          setSupabaseUser(null);
        }
      } catch (err) {
        console.error('🔐 Sidebar: Error checking session:', err);
        setSupabaseUser(null);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSupabaseSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        // Only mutate on sign in/out, not on every auth state change
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
          mutate();
        }
      } else {
        setSupabaseUser(null);
      }
      setIsLoadingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mutate]);

  // Check if user is authenticated (either from API or Supabase)
  // If we have a supabaseUser, we're authenticated immediately
  // Otherwise, wait for session loading to complete before checking
  const isAuthenticated = !!supabaseUser || (!isLoadingSession && !!(currentUser && !error))

  // Base navigation items for authenticated users
  const baseNavItems = [
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: Music,
      isActive: true,
    },
    // Only show subscription if feature is enabled
    ...(isFeatureEnabledSync('SUBSCRIPTIONS_ENABLED') ? [{
      title: "Subscription",
      url: "/marketplace/subscription",
      icon: Crown,
    }] : []),
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
      title: "Feature Flags",
      url: "/admin/feature-flags",
      icon: Settings,
    },
    {
      title: "Promo Codes",
      url: "/admin/promos",
      icon: Gift,
    },
    {
      title: "Subscriptions",
      url: "/admin/subscriptions",
      icon: Settings,
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
    // Wait for user data to load before determining role
    const userRole = currentUser?.role || 'member';
    navItems = userRole === 'admin' 
      ? [...baseNavItems, ...adminNavItems]
      : baseNavItems
  } else {
    navItems = authNavItems
  }

  // Get user info from either API user or Supabase user
  const getUserInfo = () => {
    if (currentUser && !error) {
      return {
        name: currentUser.name || "User",
        email: currentUser.email,
        avatar: "/avatars/stacho.jpg",
      };
    }
    if (supabaseUser) {
      return {
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.user_metadata?.name || 
              supabaseUser.email?.split('@')[0] || 
              "User",
        email: supabaseUser.email || "Not logged in",
        avatar: supabaseUser.user_metadata?.avatar_url || "/avatars/stacho.jpg",
      };
    }
    return {
      name: "Guest",
      email: "Not logged in",
      avatar: "/avatars/guest.jpg",
    };
  };

  const data = {
    user: getUserInfo(),
    navMain: navItems,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex items-center">
            <img src="/images/stacheoverflow-logo.png" alt="" className="h-8 w-8" />
            <span className="ml-2 text-xl font-semibold text-white">
              stache<span className="text-green-500">overflow</span>
            </span>
          </div>
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
