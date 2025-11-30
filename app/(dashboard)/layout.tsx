'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.log('🔐 Dashboard: No session, redirecting to sign-in');
          router.replace('/sign-in');
          return;
        }
        
        console.log('🔐 Dashboard: Session valid, user:', session.user.email);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('🔐 Dashboard: Auth check error:', err);
        router.replace('/sign-in');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-8 w-8 text-green-400 mx-auto" />
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-black border-b border-gray-800">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="md:hidden flex-shrink-0" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-700 hidden md:block" />
            
            {/* Mobile: Show logo and brand name */}
            <div className="flex items-center gap-2 md:hidden flex-1 min-w-0">
              <div className="relative w-8 h-8 flex-shrink-0">
                <img 
                  src="/images/stacheoverflow-logo.png" 
                  alt="StacheOverflow" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white leading-tight truncate">
                  stache<span className="text-green-500">overflow</span>
                </div>
                <div className="text-xs text-gray-400 truncate">Music Marketplace</div>
              </div>
            </div>

            {/* Desktop: Breadcrumb */}
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-white hover:text-green-500">
                    Stacheoverflow
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">Beats</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
