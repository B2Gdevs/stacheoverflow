/**
 * API Cache Middleware
 * 
 * Standard wrapper for caching GET requests.
 * 
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await getCurrentUser();
 *   
 *   return withCache(request, async () => {
 *     // Your database query here
 *     const data = await db.select().from(beats);
 *     return NextResponse.json({ beats: data });
 *   }, {
 *     userId: user?.id,
 *     isAdmin: user?.role === 'admin',
 *   });
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiCache, getCacheKey } from './api-cache';
import { getCacheConfig, getCacheTTL } from './config';

export interface CacheOptions {
  userId?: number;
  isAdmin?: boolean;
  skipCache?: boolean; // Force skip cache (e.g., for testing)
}

/**
 * Middleware to cache GET requests and return cached responses
 * 
 * @param request - Next.js request object
 * @param handler - Function that returns the API response
 * @param options - Cache options (userId, isAdmin, skipCache)
 * @returns Cached response if available, otherwise executes handler and caches result
 */
export async function withCache<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>,
  options: CacheOptions = {}
): Promise<NextResponse<T>> {
  // Only cache GET requests
  if (request.method !== 'GET' || options.skipCache) {
    return handler();
  }

  const url = new URL(request.url);
  const endpoint = url.pathname + url.search; // Include query parameters
  
  // Get cache configuration
  const config = getCacheConfig(endpoint);
  
  // Generate cache key
  const cacheKey = getCacheKey(endpoint, options.userId, options.isAdmin);
  
  // Try to get from cache
  const cached = apiCache.get<NextResponse<T>>(cacheKey);
  
  if (cached) {
    // Return cached response with cache headers
    const response = NextResponse.json(cached);
    response.headers.set('X-Cache', 'HIT');
    response.headers.set('X-Cache-Key', cacheKey);
    response.headers.set('X-Cache-TTL', config.ttl.toString());
    return response;
  }
  
  // Cache miss - execute handler
  const response = await handler();
  
  // Only cache successful responses
  if (response.status === 200) {
    try {
      const responseData = await response.clone().json().catch(() => null);
      
      if (responseData) {
        // Store in cache with configured TTL
        const ttl = getCacheTTL(endpoint);
        apiCache.set(cacheKey, responseData, ttl);
        
        // Add cache headers
        response.headers.set('X-Cache', 'MISS');
        response.headers.set('X-Cache-Key', cacheKey);
        response.headers.set('X-Cache-TTL', ttl.toString());
      }
    } catch (error) {
      // If response is not JSON, don't cache
      console.warn('Cannot cache non-JSON response:', endpoint);
    }
  }
  
  return response;
}
