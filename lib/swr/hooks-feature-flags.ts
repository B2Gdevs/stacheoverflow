import useSWR from 'swr';
import { fetcher } from './config';

/**
 * Hook to get all feature flags
 */
export function useFeatureFlags() {
  const { data, error, isLoading, mutate } = useSWR<Record<string, boolean>>(
    '/api/admin/feature-flags',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    flags: data || {},
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(flagKey: string) {
  const { flags, isLoading } = useFeatureFlags();
  
  return {
    enabled: flags[flagKey] ?? false,
    isLoading,
  };
}

