/**
 * API Cache Configuration
 * 
 * This file centralizes all cache TTL (Time To Live) configurations.
 * To add caching to a new route, simply add it here.
 * 
 * TTL values are in milliseconds.
 */

export const CACHE_CONFIG = {
  // ============================================
  // LISTINGS (Long cache - can be stale)
  // ============================================
  '/api/beats': {
    ttl: 4 * 60 * 60 * 1000, // 4 hours
    description: 'Beat listings - can be stale for hours',
    invalidateOn: ['POST /api/beats', 'PUT /api/beats/:id', 'DELETE /api/beats'],
  },
  '/api/beat-packs': {
    ttl: 4 * 60 * 60 * 1000, // 4 hours
    description: 'Beat pack listings - can be stale for hours',
    invalidateOn: ['POST /api/beat-packs', 'PUT /api/beat-packs/:id', 'DELETE /api/beat-packs'],
  },
  '/api/beat-packs?': {
    ttl: 4 * 60 * 60 * 1000, // 4 hours (with query params)
    description: 'Beat pack listings with query params',
    invalidateOn: ['POST /api/beat-packs', 'PUT /api/beat-packs/:id', 'DELETE /api/beat-packs'],
  },
  
  // ============================================
  // INDIVIDUAL ITEMS (Medium cache)
  // ============================================
  '/api/beats/:id': {
    ttl: 60 * 60 * 1000, // 1 hour
    description: 'Individual beat - medium cache',
    invalidateOn: ['PUT /api/beats/:id', 'DELETE /api/beats/:id'],
  },
  '/api/beat-packs/:id': {
    ttl: 60 * 60 * 1000, // 1 hour
    description: 'Individual beat pack - medium cache',
    invalidateOn: ['PUT /api/beat-packs/:id', 'DELETE /api/beat-packs/:id'],
  },
  
  // ============================================
  // SUBSCRIPTIONS (Medium cache)
  // ============================================
  '/api/subscriptions': {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    description: 'Subscription plans - rarely change',
    invalidateOn: ['POST /api/subscriptions', 'PUT /api/admin/subscriptions/:id'],
  },
  
  // ============================================
  // USER DATA (Short cache - needs freshness)
  // ============================================
  '/api/user': {
    ttl: 15 * 60 * 1000, // 15 minutes
    description: 'User data - needs freshness',
    invalidateOn: ['PUT /api/user'],
    userSpecific: true, // Different cache per user
  },
  '/api/user/subscription': {
    ttl: 15 * 60 * 1000, // 15 minutes
    description: 'User subscription - needs freshness',
    invalidateOn: ['POST /api/subscriptions', 'PUT /api/user/subscription'],
    userSpecific: true,
  },
  
  // ============================================
  // ADMIN DATA (Very short cache)
  // ============================================
  '/api/admin/logs': {
    ttl: 5 * 60 * 1000, // 5 minutes
    description: 'Admin logs - needs freshness',
    invalidateOn: [], // Logs are append-only, no invalidation needed
  },
  '/api/admin/subscriptions': {
    ttl: 5 * 60 * 1000, // 5 minutes
    description: 'Admin subscription management - needs freshness',
    invalidateOn: ['POST /api/admin/subscriptions', 'PUT /api/admin/subscriptions/:id'],
  },
  
  // ============================================
  // REFERENCE DATA (Long cache - rarely changes)
  // ============================================
  '/api/tags': {
    ttl: 6 * 60 * 60 * 1000, // 6 hours
    description: 'Tags - reference data, rarely changes',
    invalidateOn: ['POST /api/tags'],
  },
  '/api/team': {
    ttl: 30 * 60 * 1000, // 30 minutes
    description: 'Team data - medium cache',
    invalidateOn: ['PUT /api/team'],
  },
  
  // ============================================
  // DEFAULT (Fallback)
  // ============================================
  default: {
    ttl: 30 * 60 * 1000, // 30 minutes
    description: 'Default cache TTL for unmapped routes',
  },
} as const;

/**
 * Get cache configuration for an endpoint
 * Supports both exact matches and dynamic routes (e.g., /api/beats/:id)
 */
export function getCacheConfig(endpoint: string): {
  ttl: number;
  description: string;
  userSpecific?: boolean;
  invalidateOn?: string[];
} {
  // Remove query parameters for matching
  const baseEndpoint = endpoint.split('?')[0];
  
  // Try exact match first (with and without query params)
  if (endpoint in CACHE_CONFIG) {
    return CACHE_CONFIG[endpoint as keyof typeof CACHE_CONFIG] as any;
  }
  if (baseEndpoint in CACHE_CONFIG) {
    return CACHE_CONFIG[baseEndpoint as keyof typeof CACHE_CONFIG] as any;
  }
  
  // Try dynamic route patterns
  const patterns = [
    { pattern: /^\/api\/beats\/\d+$/, config: CACHE_CONFIG['/api/beats/:id'] },
    { pattern: /^\/api\/beat-packs\/\d+$/, config: CACHE_CONFIG['/api/beat-packs/:id'] },
    { pattern: /^\/api\/admin\/subscriptions\/\d+$/, config: CACHE_CONFIG['/api/admin/subscriptions'] },
  ];
  
  for (const { pattern, config } of patterns) {
    if (pattern.test(baseEndpoint)) {
      return config as any;
    }
  }
  
  // Try prefix matches for routes with query params
  if (baseEndpoint === '/api/beats' || baseEndpoint.startsWith('/api/beats?')) {
    return CACHE_CONFIG['/api/beats'] as any;
  }
  if (baseEndpoint === '/api/beat-packs' || baseEndpoint.startsWith('/api/beat-packs?')) {
    return CACHE_CONFIG['/api/beat-packs'] as any;
  }
  if (baseEndpoint.startsWith('/api/admin/logs')) {
    return CACHE_CONFIG['/api/admin/logs'] as any;
  }
  
  // Return default
  return CACHE_CONFIG.default;
}

/**
 * Get TTL for an endpoint (shorthand)
 */
export function getCacheTTL(endpoint: string): number {
  return getCacheConfig(endpoint).ttl;
}

/**
 * Check if endpoint should have user-specific caching
 */
export function isUserSpecific(endpoint: string): boolean {
  return getCacheConfig(endpoint).userSpecific === true;
}

