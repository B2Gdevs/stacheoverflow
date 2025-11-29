import { SWRConfiguration, Cache } from 'swr';
import { supabase } from '@/lib/supabase';

// Persistent cache using localStorage with per-endpoint TTLs
const createCacheProvider = (): Cache<any> => {
  const map = new Map<string, any>();
  
  // Load from localStorage on init
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('swr-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          // Check if cached data is still valid based on TTL
          if (value && value.timestamp && value.ttl) {
            const age = now - value.timestamp;
            if (age < value.ttl) {
              // Data is still valid, restore it
              map.set(key, value.data);
            }
            // If expired, don't restore (will be fetched fresh)
          } else if (value && value.timestamp) {
            // Legacy format - use default TTL
            const ttl = getCacheTTL(key);
            if ((now - value.timestamp) < ttl) {
              map.set(key, value.data);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading SWR cache from localStorage:', error);
    }
  }
  
  const persistCache = () => {
    if (typeof window !== 'undefined') {
      try {
        const cacheObj: Record<string, { data: any; timestamp: number; ttl: number }> = {};
        map.forEach((value, key) => {
          const ttl = getCacheTTL(key);
          cacheObj[key] = {
            data: value,
            timestamp: Date.now(),
            ttl,
          };
        });
        localStorage.setItem('swr-cache', JSON.stringify(cacheObj));
      } catch (error) {
        console.error('Error saving SWR cache to localStorage:', error);
      }
    }
  };
  
  // Throttle localStorage writes
  let persistTimeout: NodeJS.Timeout | null = null;
  const throttledPersist = () => {
    if (persistTimeout) clearTimeout(persistTimeout);
    persistTimeout = setTimeout(persistCache, 1000);
  };
  
  return {
    get: (key: string) => {
      const cached = map.get(key);
      if (cached) {
        // Return cached data immediately (SWR will revalidate in background if stale)
        return cached;
      }
      return undefined;
    },
    set: (key: string, value: any) => {
      map.set(key, value);
      throttledPersist();
    },
    delete: (key: string) => {
      map.delete(key);
      throttledPersist();
    },
    keys: () => {
      return Array.from(map.keys());
    }
  };
};

// Shared fetcher with authentication
export const fetcher = async (url: string) => {
  // Get the Supabase session token to send to the server
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  const res = await fetch(url, { 
    headers,
    credentials: 'include', // Include cookies with requests
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // @ts-ignore
    error.info = await res.json().catch(() => ({}));
    // @ts-ignore
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

// SWR configuration with persistent cache and selective revalidation
export const swrConfig: SWRConfiguration = {
  fetcher,
  provider: typeof window !== 'undefined' ? createCacheProvider : undefined,
  revalidateOnFocus: false, // Don't revalidate on focus - use cache TTL instead
  revalidateOnReconnect: false, // Don't revalidate on reconnect - use cache TTL instead
  revalidateIfStale: (key: string) => {
    // Only revalidate if data is actually stale based on TTL
    // For listings (beats, beat packs), they're cached for 4 hours
    // So we don't need to revalidate immediately
    const ttl = getCacheTTL(key);
    // For long-lived caches (listings), don't revalidate on mount
    if (ttl >= 4 * 60 * 60 * 1000) {
      return false; // Don't revalidate - use cached data
    }
    return true; // Revalidate shorter-lived caches
  },
  dedupingInterval: 60000, // Dedupe requests within 60 seconds (prevents duplicate user fetches)
  focusThrottleInterval: 5000, // Throttle focus revalidation to every 5 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  keepPreviousData: true, // Keep previous data while fetching new data
  // Return cached data immediately, revalidate in background only if stale
  fallbackData: undefined,
  onError: (error, key) => {
    console.error('SWR Error:', error, 'for key:', key);
  },
  onSuccess: (data, key) => {
    // Optional: Log successful fetches in development
    if (process.env.NODE_ENV === 'development') {
      console.log('SWR Success:', key);
    }
  },
};

// Cache keys for easy reference
export const CACHE_KEYS = {
  USER: '/api/user',
  BEATS: '/api/beats',
  BEAT_PACKS: '/api/beat-packs',
  BEAT: (id: string) => `/api/beats/${id}`,
  BEAT_PACK: (id: string) => `/api/beat-packs/${id}`,
  SUBSCRIPTIONS: '/api/subscriptions',
  USER_SUBSCRIPTION: '/api/user/subscription',
  ADMIN_LOGS: '/api/admin/logs',
  ADMIN_SUBSCRIPTIONS: '/api/admin/subscriptions',
  TAGS: '/api/tags',
  TEAM: '/api/team',
} as const;

// Cache TTL configuration (in milliseconds)
// Different endpoints have different cache durations
export const CACHE_TTL = {
  // Listings - cache for 3-4 hours (stale data is acceptable)
  [CACHE_KEYS.BEATS]: 4 * 60 * 60 * 1000, // 4 hours
  [CACHE_KEYS.BEAT_PACKS]: 4 * 60 * 60 * 1000, // 4 hours
  [CACHE_KEYS.SUBSCRIPTIONS]: 2 * 60 * 60 * 1000, // 2 hours
  
  // User data - shorter cache (15 minutes)
  [CACHE_KEYS.USER]: 15 * 60 * 1000, // 15 minutes
  [CACHE_KEYS.USER_SUBSCRIPTION]: 15 * 60 * 1000, // 15 minutes
  
  // Admin data - shorter cache (5 minutes)
  [CACHE_KEYS.ADMIN_LOGS]: 5 * 60 * 1000, // 5 minutes
  [CACHE_KEYS.ADMIN_SUBSCRIPTIONS]: 5 * 60 * 1000, // 5 minutes
  
  // Static/reference data - longer cache
  [CACHE_KEYS.TAGS]: 6 * 60 * 60 * 1000, // 6 hours
  [CACHE_KEYS.TEAM]: 30 * 60 * 1000, // 30 minutes
  
  // Individual items - medium cache (1 hour)
  BEAT_ITEM: 60 * 60 * 1000, // 1 hour
  BEAT_PACK_ITEM: 60 * 60 * 1000, // 1 hour
  
  // Default TTL for unknown endpoints
  DEFAULT: 30 * 60 * 1000, // 30 minutes
} as const;

// Get TTL for a specific cache key
export function getCacheTTL(key: string): number {
  // Check for exact match
  if (key in CACHE_TTL) {
    return CACHE_TTL[key as keyof typeof CACHE_TTL] as number;
  }
  
  // Check for dynamic routes (beats/[id], beat-packs/[id])
  if (key.startsWith('/api/beats/') && key !== CACHE_KEYS.BEATS) {
    return CACHE_TTL.BEAT_ITEM;
  }
  if (key.startsWith('/api/beat-packs/') && key !== CACHE_KEYS.BEAT_PACKS) {
    return CACHE_TTL.BEAT_PACK_ITEM;
  }
  
  // Default TTL
  return CACHE_TTL.DEFAULT;
}

