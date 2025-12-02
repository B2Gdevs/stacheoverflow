'use client';

import { useState, useEffect } from 'react';
import { Search, User, X, AlertCircle, Loader2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { useUser } from '@/lib/swr/hooks';

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

export default function ImpersonatePage() {
  const { user: currentUser } = useUser();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [impersonationStatus, setImpersonationStatus] = useState<ImpersonationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] = useState<'dev' | 'prod'>('prod');

  // Check impersonation status on mount
  useEffect(() => {
    checkImpersonationStatus();
  }, []);

  const checkImpersonationStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        credentials: 'include',
      });
      const data = await response.json();
      setImpersonationStatus(data);
    } catch (error) {
      console.error('Error checking impersonation status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to search users',
        });
      }
    } catch (error) {
      console.error('Error searching users:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to search users',
      });
    } finally {
      setSearching(false);
    }
  };

  const startImpersonation = async (userId: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          environment: selectedEnvironment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Impersonation Started',
          description: `Now impersonating: ${data.user.email} (${data.environment})`,
        });
        await checkImpersonationStatus();
        // Refresh the page to update all user-dependent data
        window.location.reload();
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          description: data.error || 'Failed to start impersonation',
        });
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to start impersonation',
      });
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Impersonation Stopped',
          description: 'Returned to your admin account',
        });
        await checkImpersonationStatus();
        // Refresh the page to update all user-dependent data
        window.location.reload();
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          description: data.error || 'Failed to stop impersonation',
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
      setLoading(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <AlertCircle className={cn(getIconSize('xl'), "text-red-500 mb-4")} />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Impersonation</h1>
        <p className="text-gray-400">Impersonate users for testing and support</p>
      </div>

      {/* Current Impersonation Status */}
      {loadingStatus ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className={cn(getIconSize('lg'), "animate-spin text-green-400")} />
            </div>
          </CardContent>
        </Card>
      ) : impersonationStatus?.isImpersonating ? (
        <Card className="bg-yellow-900/20 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <AlertCircle className={getIconSize('md')} />
              Currently Impersonating
            </CardTitle>
            <CardDescription className="text-yellow-300">
              You are viewing the application as another user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className={getIconSize('sm')} />
                <span className="text-white font-medium">{impersonationStatus.user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className={getIconSize('sm')} />
                <span className="text-gray-300">
                  Environment: <span className="font-bold">{impersonationStatus.environment || 'prod'}</span>
                </span>
              </div>
            </div>
            <Button
              onClick={stopImpersonation}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white min-h-[44px] sm:min-h-0"
            >
              {loading ? (
                <>
                  <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
                  Stopping...
                </>
              ) : (
                <>
                  <X className={cn(getIconSize('sm'), "mr-2")} />
                  Stop Impersonating
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <p className="text-gray-400 text-center">Not currently impersonating any user</p>
          </CardContent>
        </Card>
      )}

      {/* Search Users */}
      {!impersonationStatus?.isImpersonating && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Search Users</CardTitle>
            <CardDescription className="text-gray-400">
              Search by email or name to find a user to impersonate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Environment Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Database Environment</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedEnvironment === 'dev' ? 'default' : 'outline'}
                  onClick={() => setSelectedEnvironment('dev')}
                  className={cn(
                    "flex-1",
                    selectedEnvironment === 'dev'
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "border-gray-600 text-gray-300"
                  )}
                >
                  <Database className={cn(getIconSize('sm'), "mr-2")} />
                  Dev
                </Button>
                <Button
                  variant={selectedEnvironment === 'prod' ? 'default' : 'outline'}
                  onClick={() => setSelectedEnvironment('prod')}
                  className={cn(
                    "flex-1",
                    selectedEnvironment === 'prod'
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "border-gray-600 text-gray-300"
                  )}
                >
                  <Database className={cn(getIconSize('sm'), "mr-2")} />
                  Production
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Select which database environment to use while impersonating
              </p>
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", getIconSize('sm'))} />
                <Input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchUsers();
                    }
                  }}
                  className="pl-10 bg-black border-gray-600 text-white placeholder-gray-400 min-h-[44px] sm:min-h-0"
                />
              </div>
              <Button
                onClick={searchUsers}
                disabled={searching || !searchTerm.trim()}
                className="bg-green-500 hover:bg-green-600 text-white min-h-[44px] sm:min-h-0"
              >
                {searching ? (
                  <Loader2 className={cn(getIconSize('sm'), "animate-spin")} />
                ) : (
                  <Search className={getIconSize('sm')} />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {users.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.email}</p>
                      {user.name && (
                        <p className="text-gray-400 text-sm truncate">{user.name}</p>
                      )}
                      <p className="text-gray-500 text-xs">Role: {user.role}</p>
                    </div>
                    <Button
                      onClick={() => startImpersonation(user.id)}
                      disabled={loading}
                      className="ml-4 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm min-h-[36px] sm:min-h-0"
                    >
                      {loading ? (
                        <Loader2 className={cn(getIconSize('sm'), "animate-spin")} />
                      ) : (
                        'Impersonate'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && !searching && users.length === 0 && (
              <p className="text-gray-400 text-center text-sm">No users found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

