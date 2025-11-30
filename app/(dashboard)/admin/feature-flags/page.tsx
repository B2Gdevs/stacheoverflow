'use client';

import { useState, useEffect } from 'react';
import { Settings, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { useFeatureFlags } from '@/lib/swr/hooks-feature-flags';

interface FeatureFlag {
  flagKey: string;
  enabled: boolean;
  description?: string;
}

const FLAG_DESCRIPTIONS: Record<string, string> = {
  SUBSCRIPTIONS_ENABLED: 'Enable subscription system for monthly downloads',
  PROMO_CODES_ENABLED: 'Enable promo code system for free assets',
  NEWS_ENABLED: 'Enable news/announcements banner',
  NOTIFICATIONS_ENABLED: 'Enable notification system with bell icon',
};

export default function FeatureFlagsPage() {
  const { flags, error, isLoading, refresh } = useFeatureFlags();
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  const handleToggle = async (flagKey: string, currentValue: boolean) => {
    setUpdating(prev => ({ ...prev, [flagKey]: true }));

    try {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        // Refresh flags
        refresh();
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

  const flagEntries = flags ? Object.entries(flags) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Feature Flags</h1>
        <p className="text-gray-400">Enable or disable features without code changes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flagEntries.map(([flagKey, enabled]) => (
          <Card key={flagKey} className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className={cn(getIconSize('md'), "text-green-400")} />
                  <div>
                    <CardTitle className="text-white font-mono text-sm">{flagKey}</CardTitle>
                    <CardDescription className="text-gray-400 text-xs mt-1">
                      {FLAG_DESCRIPTIONS[flagKey] || 'No description'}
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
                <Button
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle(flagKey, enabled)}
                  disabled={updating[flagKey]}
                  className={cn(
                    "min-w-[100px]",
                    enabled 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  )}
                >
                  {updating[flagKey] ? (
                    <>
                      <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
                      Updating...
                    </>
                  ) : (
                    enabled ? 'Disable' : 'Enable'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {flagEntries.length === 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <p className="text-gray-400 text-center">No feature flags found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

