import useSWR from 'swr';
import { fetcher } from './config';

interface FeatureFlag {
  id: number;
  flagKey: string;
  flagValue: number;
  description: string | null;
  updatedBy: number | null;
  updatedAt: string;
}

/**
 * Hook to get all feature flags (admin only - returns full objects)
 */
export function useFeatureFlags() {
  const { data, error, isLoading, mutate } = useSWR<FeatureFlag[]>(
    '/api/admin/feature-flags',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    flags: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to check if a specific feature is enabled (client-side)
 * Converts feature flags array to object for easy lookup
 */
export function useFeatureFlag(flagKey: string) {
  const { data, error, isLoading } = useSWR<FeatureFlag[]>(
    '/api/admin/feature-flags',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  // Convert array to object for lookup
  const flagsObj: Record<string, boolean> = {};
  if (data) {
    data.forEach(flag => {
      flagsObj[flag.flagKey] = flag.flagValue === 1;
    });
  }
  
  return {
    enabled: flagsObj[flagKey] ?? false,
    isLoading,
    error,
  };
}

