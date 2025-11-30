import useSWR from 'swr';
import { fetcher, CACHE_KEYS } from './config';
import { invalidateCache, invalidateCaches } from './cache';

/**
 * Custom hooks for common data fetching patterns with caching
 */

// Hook for fetching current user
export function useUser() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.USER, fetcher);
  
  return {
    user: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching beats
export { useFeatureFlags, useFeatureFlag } from './hooks-feature-flags';

export function useBeats() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.BEATS, fetcher);
  
  return {
    beats: data?.beats || [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching beat packs
export function useBeatPacks() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.BEAT_PACKS, fetcher);
  
  return {
    packs: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching subscriptions
export function useSubscriptions() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.SUBSCRIPTIONS, fetcher);
  
  return {
    subscriptions: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching user subscription
export function useUserSubscription() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.USER_SUBSCRIPTION, fetcher);
  
  return {
    subscription: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching a single beat
export function useBeat(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? CACHE_KEYS.BEAT(id) : null,
    fetcher
  );
  
  return {
    beat: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching a single beat pack
export function useBeatPack(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? CACHE_KEYS.BEAT_PACK(id) : null,
    fetcher
  );
  
  return {
    pack: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching admin logs
export function useAdminLogs(limit?: number, offset?: number) {
  const url = limit !== undefined && offset !== undefined
    ? `${CACHE_KEYS.ADMIN_LOGS}?limit=${limit}&offset=${offset}`
    : CACHE_KEYS.ADMIN_LOGS;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    logs: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching admin subscriptions
export function useAdminSubscriptions() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.ADMIN_SUBSCRIPTIONS, fetcher);
  
  return {
    subscriptions: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching tags
export function useTags() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.TAGS, fetcher);
  
  return {
    tags: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching team
export function useTeam() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.TEAM, fetcher);
  
  return {
    team: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Export cache utilities for use in components
export { invalidateCache, invalidateCaches, CACHE_KEYS };

