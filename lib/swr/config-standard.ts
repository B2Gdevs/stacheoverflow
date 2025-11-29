import { SWRConfiguration } from 'swr';
import { supabase } from '@/lib/supabase';

/**
 * Standard SWR configuration using built-in features
 * No custom persistence - uses SWR's standard in-memory cache
 * with configurable stale times per endpoint
 */

// Shared fetcher with authentication
export const fetcher = async (url: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  const res = await fetch(url, { headers });
  
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

// Cache keys
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

// Standard SWR configuration
// Uses SWR's built-in cache with configurable stale times
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false, // Don't revalidate on window focus
  revalidateOnReconnect: true, // Revalidate when network reconnects
  revalidateIfStale: true, // Revalidate if data is stale
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  focusThrottleInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  keepPreviousData: true,
  onError: (error, key) => {
    console.error('SWR Error:', error, 'for key:', key);
  },
};

/**
 * Get stale time for a cache key (in milliseconds)
 * This determines how long data is considered "fresh" before revalidation
 */
export function getStaleTime(key: string): number {
  // Listings - can be stale for 4 hours
  if (key === CACHE_KEYS.BEATS || key === CACHE_KEYS.BEAT_PACKS) {
    return 4 * 60 * 60 * 1000; // 4 hours
  }
  
  // Subscriptions - 2 hours
  if (key === CACHE_KEYS.SUBSCRIPTIONS) {
    return 2 * 60 * 60 * 1000; // 2 hours
  }
  
  // User data - 15 minutes
  if (key === CACHE_KEYS.USER || key === CACHE_KEYS.USER_SUBSCRIPTION) {
    return 15 * 60 * 1000; // 15 minutes
  }
  
  // Admin data - 5 minutes
  if (key === CACHE_KEYS.ADMIN_LOGS || key === CACHE_KEYS.ADMIN_SUBSCRIPTIONS) {
    return 5 * 60 * 1000; // 5 minutes
  }
  
  // Tags - 6 hours
  if (key === CACHE_KEYS.TAGS) {
    return 6 * 60 * 60 * 1000; // 6 hours
  }
  
  // Individual items - 1 hour
  if (key.startsWith('/api/beats/') || key.startsWith('/api/beat-packs/')) {
    return 60 * 60 * 1000; // 1 hour
  }
  
  // Default - 30 minutes
  return 30 * 60 * 1000;
}

