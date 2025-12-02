'use client';

import { useState, useEffect } from 'react';
import { User, X, Database, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

interface ImpersonationStatus {
  isImpersonating: boolean;
  user?: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
  environment?: 'dev' | 'prod';
  adminId?: number;
}

export function ImpersonationToolbar() {
  const router = useRouter();
  const { addToast } = useToast();
  const [status, setStatus] = useState<ImpersonationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stopping, setStopping] = useState(false);

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
      
      if (!response.ok) {
        // If 404 or other error, set status to not impersonating
        if (response.status === 404) {
          console.warn('Impersonation API endpoint not found - this is normal if route is not set up');
          setStatus({ isImpersonating: false });
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setStatus(data);
      // Auto-expand if impersonating
      if (data.isImpersonating) {
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Error checking impersonation status:', error);
      // Set default status on error
      setStatus({ isImpersonating: false });
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonation = async () => {
    setStopping(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Impersonation Stopped',
          description: 'Returned to your admin account',
        });
        setStatus({ isImpersonating: false });
        setIsExpanded(false);
        // Refresh the page to update all user-dependent data
        window.location.reload();
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to stop impersonation',
        });
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to stop impersonation',
      });
    } finally {
      setStopping(false);
    }
  };

  // Show in development mode even if not impersonating (for testing)
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Don't show if not impersonating (unless in development)
  if (loading) {
    return null;
  }
  
  if (!status?.isImpersonating && !isDevelopment) {
    return null;
  }

  const isImpersonating = status?.isImpersonating || false;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className={cn(
          "backdrop-blur-sm border-2 rounded-lg shadow-2xl p-4 min-w-[280px] sm:min-w-[320px]",
          isImpersonating 
            ? "bg-yellow-500/95 border-yellow-400" 
            : "bg-blue-500/95 border-blue-400"
        )}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User className={cn(
                getIconSize('md'),
                "flex-shrink-0",
                isImpersonating ? "text-yellow-900" : "text-blue-900"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-sm truncate",
                  isImpersonating ? "text-yellow-900" : "text-blue-900"
                )}>
                  {isImpersonating ? 'Impersonating User' : 'Impersonation Tool'}
                </p>
                {isImpersonating && status.user?.email ? (
                  <p className={cn(
                    "text-xs truncate mt-0.5",
                    isImpersonating ? "text-yellow-800" : "text-blue-800"
                  )}>
                    {status.user.email}
                  </p>
                ) : (
                  <p className={cn(
                    "text-xs truncate mt-0.5",
                    isImpersonating ? "text-yellow-800" : "text-blue-800"
                  )}>
                    Not impersonating
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className={cn(
                "h-6 w-6 flex-shrink-0",
                isImpersonating 
                  ? "text-yellow-900 hover:bg-yellow-400" 
                  : "text-blue-900 hover:bg-blue-400"
              )}
            >
              <X className={getIconSize('sm')} />
            </Button>
          </div>

          {isImpersonating && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs">
                <Database className={cn(
                  getIconSize('sm'),
                  isImpersonating ? "text-yellow-800" : "text-blue-800"
                )} />
                <span className={isImpersonating ? "text-yellow-800" : "text-blue-800"}>
                  Environment: <span className="font-bold">{status.environment || 'prod'}</span>
                </span>
              </div>
              {status.user?.name && (
                <div className="flex items-center gap-2 text-xs">
                  <User className={cn(
                    getIconSize('sm'),
                    isImpersonating ? "text-yellow-800" : "text-blue-800"
                  )} />
                  <span className={cn(
                    "truncate",
                    isImpersonating ? "text-yellow-800" : "text-blue-800"
                  )}>
                    {status.user.name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <span className={isImpersonating ? "text-yellow-800" : "text-blue-800"}>
                  Role: <span className="font-medium">{status.user?.role}</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/impersonate')}
              className={cn(
                "flex-1 text-xs min-h-[36px] sm:min-h-0",
                isImpersonating
                  ? "border-yellow-700 text-yellow-900 hover:bg-yellow-400"
                  : "border-blue-700 text-blue-900 hover:bg-blue-400"
              )}
            >
              <Settings className={cn(getIconSize('sm'), "mr-1")} />
              Manage
            </Button>
            {isImpersonating && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopImpersonation}
                disabled={stopping}
                className={cn(
                  "flex-1 text-xs min-h-[36px] sm:min-h-0",
                  "border-yellow-700 text-yellow-900 hover:bg-yellow-400"
                )}
              >
                {stopping ? (
                  <Loader2 className={cn(getIconSize('sm'), "mr-1 animate-spin")} />
                ) : (
                  <X className={cn(getIconSize('sm'), "mr-1")} />
                )}
                Stop
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "rounded-full shadow-lg min-h-[56px] min-w-[56px] p-0",
            isImpersonating
              ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
              : "bg-blue-500 hover:bg-blue-600 text-blue-900"
          )}
          title={isImpersonating ? "Impersonation Active" : "Impersonation Tool"}
        >
          <User className={getIconSize('lg')} />
        </Button>
      )}
    </div>
  );
}

