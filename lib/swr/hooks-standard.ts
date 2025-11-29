import useSWR from 'swr';
import { fetcher, CACHE_KEYS, getStaleTime } from './config-standard';

/**
 * Standard SWR hooks with per-endpoint stale times
 * Uses SWR's built-in cache (in-memory, not persistent)
 */

// Hook for fetching current user
export function useUser() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.USER,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.USER),
    }
  );
  
  return {
    user: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching beats (4 hour stale time)
export function useBeats() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.BEATS,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.BEATS),
    }
  );
  
  return {
    beats: data?.beats || [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching beat packs (4 hour stale time)
export function useBeatPacks() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.BEAT_PACKS,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.BEAT_PACKS),
    }
  );
  
  return {
    packs: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching subscriptions
export function useSubscriptions() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.SUBSCRIPTIONS,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.SUBSCRIPTIONS),
    }
  );
  
  return {
    subscriptions: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching user subscription
export function useUserSubscription() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.USER_SUBSCRIPTION,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.USER_SUBSCRIPTION),
    }
  );
  
  return {
    subscription: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching a single beat
export function useBeat(id: string | null) {
  const key = id ? CACHE_KEYS.BEAT(id) : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    fetcher,
    key ? {
      dedupingInterval: getStaleTime(key),
    } : undefined
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
  const key = id ? CACHE_KEYS.BEAT_PACK(id) : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    fetcher,
    key ? {
      dedupingInterval: getStaleTime(key),
    } : undefined
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
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.ADMIN_LOGS),
    }
  );
  
  return {
    logs: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching admin subscriptions
export function useAdminSubscriptions() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.ADMIN_SUBSCRIPTIONS,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.ADMIN_SUBSCRIPTIONS),
    }
  );
  
  return {
    subscriptions: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching tags
export function useTags() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.TAGS,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.TAGS),
    }
  );
  
  return {
    tags: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Hook for fetching team
export function useTeam() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.TEAM,
    fetcher,
    {
      dedupingInterval: getStaleTime(CACHE_KEYS.TEAM),
    }
  );
  
  return {
    team: data,
    isLoading,
    isError: error,
    refresh: () => mutate(),
  };
}

// Export cache keys
export { CACHE_KEYS };

