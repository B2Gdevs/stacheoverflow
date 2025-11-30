/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag system to enable/disable features without code changes.
 * Checks database first, then falls back to environment variables.
 */

// Default flags (used as fallback)
const DEFAULT_FLAGS = {
  SUBSCRIPTIONS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_SUBSCRIPTIONS === 'true' || false,
  PROMO_CODES_ENABLED: process.env.NEXT_PUBLIC_FEATURE_PROMO_CODES === 'true' || true,
  NEWS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_NEWS === 'true' || false,
  NOTIFICATIONS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true' || false,
} as const;

export type FeatureFlagKey = keyof typeof DEFAULT_FLAGS;

/**
 * Get feature flag value from database (server-side only)
 * Falls back to environment variable or default
 */
export async function getFeatureFlagFromDB(flagKey: FeatureFlagKey): Promise<boolean> {
  try {
    const { db } = await import('@/lib/db/drizzle');
    const { featureFlags } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.flagKey, flagKey))
      .limit(1);
    
    if (flag) {
      return flag.flagValue === 1;
    }
  } catch (error) {
    // Silently fail and use default
  }
  
  // Fallback to default
  return DEFAULT_FLAGS[flagKey];
}

/**
 * Synchronous version for client-side components
 * Uses default values (client will fetch from API via SWR)
 * For server-side, use getFeatureFlagFromDB()
 */
export function isFeatureEnabledSync(feature: FeatureFlagKey): boolean {
  return DEFAULT_FLAGS[feature];
}

/**
 * Get all feature flags (useful for debugging)
 */
export function getAllFeatureFlags() {
  return { ...FEATURE_FLAGS };
}

