'use client';

import { useState } from 'react';
import { Settings, Loader2, CheckCircle, XCircle, Plus, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr/config';

interface FeatureFlag {
  id: number;
  flagKey: string;
  flagValue: number;
  description: string | null;
  updatedBy: number | null;
  updatedAt: string;
}

const FLAG_DESCRIPTIONS: Record<string, string> = {
  SUBSCRIPTIONS_ENABLED: 'Enable subscription system for monthly downloads',
  PROMO_CODES_ENABLED: 'Enable promo code system for free assets',
  NEWS_ENABLED: 'Enable news/announcements banner',
  NOTIFICATIONS_ENABLED: 'Enable notification system with bell icon',
};

export default function FeatureFlagsPage() {
  const { data: flagsData, error, isLoading, mutate } = useSWR<FeatureFlag[]>('/api/admin/feature-flags', fetcher);
  const flags = Array.isArray(flagsData) ? flagsData : [];
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState({
    flagKey: '',
    description: '',
    enabled: true,
  });
  const { addToast } = useToast();

  const handleToggle = async (flagKey: string, currentValue: boolean) => {
    setUpdating(prev => ({ ...prev, [flagKey]: true }));

    try {
      // Get Supabase session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers,
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          flagKey,
          enabled: !currentValue,
        }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Feature Flag Updated',
          description: `${flagKey} is now ${!currentValue ? 'enabled' : 'disabled'}`,
        });
        mutate();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          description: error.error || 'Failed to update feature flag',
        });
      }
    } catch (error) {
      console.error('Error updating feature flag:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update feature flag',
      });
    } finally {
      setUpdating(prev => ({ ...prev, [flagKey]: false }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(prev => ({ ...prev, create: true }));

    try {
      // Get Supabase session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers,
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          flagKey: formState.flagKey.toUpperCase(),
          enabled: formState.enabled,
          description: formState.description || null,
        }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Feature Flag Created',
          description: `${formState.flagKey} has been created`,
        });
        setIsCreateModalOpen(false);
        setFormState({ flagKey: '', description: '', enabled: true });
        mutate();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          description: error.error || 'Failed to create feature flag',
        });
      }
    } catch (error) {
      console.error('Error creating feature flag:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create feature flag',
      });
    } finally {
      setUpdating(prev => ({ ...prev, create: false }));
    }
  };

  const handleDelete = async (flagKey: string) => {
    if (!confirm(`Are you sure you want to delete the feature flag "${flagKey}"?`)) {
      return;
    }

    setIsDeleting(prev => ({ ...prev, [flagKey]: true }));

    try {
      const response = await fetch(`/api/admin/feature-flags/${flagKey}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Feature Flag Deleted',
          description: `${flagKey} has been deleted`,
        });
        mutate();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          description: error.error || 'Failed to delete feature flag',
        });
      }
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete feature flag',
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [flagKey]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className={cn(getIconSize('lg'), "animate-spin text-green-400")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-900 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-400">Error loading feature flags</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Feature Flags</h1>
          <p className="text-gray-400">Enable or disable features without code changes</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className={cn(getIconSize('sm'), "mr-2")} />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Create New Feature Flag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="flagKey" className="text-gray-300">Flag Key</Label>
                <Input
                  id="flagKey"
                  value={formState.flagKey}
                  onChange={(e) => setFormState(prev => ({ ...prev, flagKey: e.target.value }))}
                  placeholder="MY_NEW_FEATURE"
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Will be converted to UPPERCASE</p>
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What does this feature flag control?"
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formState.enabled}
                  onChange={(e) => setFormState(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="enabled" className="text-gray-300">Enabled by default</Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormState({ flagKey: '', description: '', enabled: true });
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updating.create}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {updating.create ? (
                    <>
                      <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(flags) && flags.map((flag) => {
          const enabled = flag.flagValue === 1;
          return (
            <Card key={flag.id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Settings className={cn(getIconSize('md'), "text-green-400")} />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white font-mono text-sm break-all">{flag.flagKey}</CardTitle>
                      <CardDescription className="text-gray-400 text-xs mt-1">
                        {flag.description || FLAG_DESCRIPTIONS[flag.flagKey] || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {enabled ? (
                      <CheckCircle className={cn(getIconSize('sm'), "text-green-400")} />
                    ) : (
                      <XCircle className={cn(getIconSize('sm'), "text-gray-500")} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm font-medium",
                    enabled ? "text-green-400" : "text-gray-400"
                  )}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggle(flag.flagKey, enabled)}
                      disabled={updating[flag.flagKey]}
                      className={cn(
                        "min-w-[100px]",
                        enabled 
                          ? "bg-green-500 hover:bg-green-600" 
                          : "border-gray-600 text-gray-300 hover:bg-gray-800"
                      )}
                    >
                      {updating[flag.flagKey] ? (
                        <>
                          <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
                          Updating...
                        </>
                      ) : (
                        enabled ? 'Disable' : 'Enable'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(flag.flagKey)}
                      disabled={isDeleting[flag.flagKey]}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    >
                      {isDeleting[flag.flagKey] ? (
                        <Loader2 className={cn(getIconSize('sm'), "animate-spin")} />
                      ) : (
                        <Trash2 className={getIconSize('sm')} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {flags && flags.length === 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <p className="text-gray-400 text-center">No feature flags found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

