/**
 * Server-Side API Response Cache
 * 
 * Standard in-memory cache implementation (similar to Redis).
 * Stores API responses with TTL (Time To Live) support.
 * 
 * This is a standard pattern that can be upgraded to Redis later.
 */

import { CACHE_CONFIG, getCacheConfig } from './config';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000; // Maximum number of cached entries

  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const age = Date.now() - entry.timestamp;
    
    if (age > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    // Evict oldest entries if cache is full (FIFO)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete cached entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all entries matching a pattern (regex)
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics (for monitoring/debugging)
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const apiCache = new ApiCache();

/**
 * Generate cache key from request
 * Includes user context for user-specific endpoints
 * Includes query parameters for routes that use them
 */
export function getCacheKey(
  endpoint: string, 
  userId?: number, 
  isAdmin?: boolean
): string {
  // Split endpoint and query params
  const [baseEndpoint, queryString] = endpoint.split('?');
  const query = queryString ? `?${queryString}` : '';
  
  const config = getCacheConfig(endpoint);
  
  // User-specific endpoints get user ID in key
  if (config.userSpecific) {
    return `${baseEndpoint}${query}:user:${userId || 'anonymous'}`;
  }
  
  // Admin vs regular user see different data
  if (baseEndpoint === '/api/beats' || baseEndpoint === '/api/beat-packs') {
    return `${baseEndpoint}${query}:admin:${isAdmin ? 'true' : 'false'}`;
  }
  
  // For other endpoints, use endpoint with query params as key
  return `${baseEndpoint}${query}`;
}

/**
 * Cache invalidation helpers
 * These follow the patterns defined in CACHE_CONFIG
 */
export const cacheInvalidation = {
  // Beats
  beats: () => apiCache.deletePattern('^/api/beats'),
  beat: (id: number) => {
    apiCache.delete(`/api/beats/${id}`);
    apiCache.deletePattern('^/api/beats:admin:'); // Also invalidate lists
  },
  
  // Beat Packs
  beatPacks: () => apiCache.deletePattern('^/api/beat-packs'),
  beatPack: (id: number) => {
    apiCache.delete(`/api/beat-packs/${id}`);
    apiCache.deletePattern('^/api/beat-packs:admin:'); // Also invalidate lists
  },
  
  // User
  user: (userId?: number) => {
    if (userId) {
      apiCache.delete(`/api/user:user:${userId}`);
      apiCache.delete(`/api/user/subscription:user:${userId}`);
    } else {
      apiCache.deletePattern('^/api/user');
    }
  },
  
  // Subscriptions
  subscriptions: () => {
    apiCache.delete('/api/subscriptions');
    apiCache.deletePattern('^/api/user/subscription'); // Also invalidate user subscriptions
  },
  
  // Tags
  tags: () => apiCache.delete('/api/tags'),
  
  // Team
  team: () => apiCache.delete('/api/team'),
  
  // Admin
  adminSubscriptions: () => apiCache.delete('/api/admin/subscriptions'),
};

// Legacy function names for backward compatibility
export const invalidateBeatsCache = cacheInvalidation.beats;
export const invalidateBeatCache = cacheInvalidation.beat;
export const invalidateBeatPacksCache = cacheInvalidation.beatPacks;
export const invalidateBeatPackCache = cacheInvalidation.beatPack;
export const invalidateUserCache = cacheInvalidation.user;
export const invalidateTagsCache = cacheInvalidation.tags;
