'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ImpersonationStatus {
  isImpersonating: boolean;
  user?: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
  environment?: 'dev' | 'prod';
}

export function ImpersonationBanner() {
  const router = useRouter();
  const [status, setStatus] = useState<ImpersonationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        credentials: 'include',
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking impersonation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonation = async () => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        // Refresh the page to update all user-dependent data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error);
    }
  };

  if (loading || !status?.isImpersonating) {
    return null;
  }

  return (
    <div className="bg-yellow-500/20 border-b border-yellow-500/50 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertCircle className={cn(getIconSize('md'), "text-yellow-400 flex-shrink-0")} />
          <div className="flex-1 min-w-0">
            <p className="text-yellow-400 font-semibold text-sm sm:text-base truncate">
              Impersonating: {status.user?.email}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Database className={cn(getIconSize('xs'), "text-yellow-300")} />
              <p className="text-yellow-300 text-xs">
                Environment: <span className="font-bold">{status.environment || 'prod'}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/impersonate')}
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs sm:text-sm min-h-[32px] sm:min-h-0"
          >
            Manage
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={stopImpersonation}
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs sm:text-sm min-h-[32px] sm:min-h-0"
          >
            <X className={cn(getIconSize('sm'), "mr-1")} />
            <span className="hidden sm:inline">Stop</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

