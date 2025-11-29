import { mutate, cache } from 'swr';
import { CACHE_KEYS } from './config';

/**
 * Cache utilities for invalidating and managing SWR cache
 */

// Invalidate specific cache key
export async function invalidateCache(key: string) {
  await mutate(key, undefined, { revalidate: true });
}

// Invalidate multiple cache keys
export async function invalidateCaches(keys: string[]) {
  await Promise.all(keys.map(key => invalidateCache(key)));
}

// Invalidate all user-related caches
export async function invalidateUserCache() {
  await invalidateCaches([
    CACHE_KEYS.USER,
    CACHE_KEYS.USER_SUBSCRIPTION,
  ]);
}

// Invalidate all beats-related caches
export async function invalidateBeatsCache() {
  await invalidateCaches([
    CACHE_KEYS.BEATS,
    CACHE_KEYS.BEAT_PACKS,
  ]);
}

// Invalidate all admin caches
export async function invalidateAdminCache() {
  await invalidateCaches([
    CACHE_KEYS.ADMIN_LOGS,
    CACHE_KEYS.ADMIN_SUBSCRIPTIONS,
  ]);
}

// Update cache data optimistically
export function updateCache<T>(key: string, data: T) {
  mutate(key, data, { revalidate: false });
}

// Prefetch data into cache
export async function prefetchCache(key: string) {
  await mutate(key);
}

// Clear all cache
export function clearAllCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('swr-cache');
    // Clear SWR's internal cache
    cache.clear();
  }
}

// Get cached data synchronously
export function getCachedData<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined;
}

