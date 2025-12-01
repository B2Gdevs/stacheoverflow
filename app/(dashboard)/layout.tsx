'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { supabase } from '@/lib/supabase';
import { Loader2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { PromoCodeModal } from '@/components/dashboard/promo/promo-code-modal';
import { useSearchParams } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);

  // Generate breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Stacheoverflow', href: '/marketplace' }
    ];

    if (paths.length === 0) {
      breadcrumbs.push({ label: 'Marketplace', href: null });
    } else {
      let currentPath = '';
      paths.forEach((path, index) => {
        currentPath += `/${path}`;
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        breadcrumbs.push({
          label,
          href: index === paths.length - 1 ? null : currentPath
        });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

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

  // Check for promo-code URL parameter
  useEffect(() => {
    const promoCode = searchParams.get('promo-code');
    if (promoCode && isAuthenticated) {
      setPromoModalOpen(true);
    }
  }, [searchParams, isAuthenticated]);

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
            <Breadcrumb className="hidden md:flex flex-1">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href} className="text-white hover:text-green-500">
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-white">{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="text-gray-600" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            {/* Promo Code Button - Top Right */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPromoModalOpen(true)}
              className="ml-auto text-white hover:text-green-400 hover:bg-gray-800 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              title="Redeem Promo Code"
            >
              <Gift className={getIconSize('md')} />
            </Button>
          </div>
        </header>

        {/* Promo Code Modal */}
        <PromoCodeModal 
          open={promoModalOpen} 
          onOpenChange={setPromoModalOpen}
          initialCode={searchParams.get('promo-code') || undefined}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
