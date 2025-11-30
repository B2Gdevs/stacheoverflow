/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag system to enable/disable features without code changes.
 * Set flags via environment variables or hardcode defaults here.
 */

export const FEATURE_FLAGS = {
  /**
   * Subscription System
   * When disabled, hides all subscription-related UI and functionality
   */
  SUBSCRIPTIONS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_SUBSCRIPTIONS === 'true' || false,

  /**
   * Promo Codes
   * When disabled, hides promo code input and related features
   */
  PROMO_CODES_ENABLED: process.env.NEXT_PUBLIC_FEATURE_PROMO_CODES === 'true' || true,

  /**
   * News/Announcements
   * When disabled, hides news banner and announcements
   */
  NEWS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_NEWS === 'true' || false,

  /**
   * Notifications
   * When disabled, hides notification bell and dropdown
   */
  NOTIFICATIONS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true' || false,
} as const;

/**
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Get all feature flags (useful for debugging)
 */
export function getAllFeatureFlags() {
  return { ...FEATURE_FLAGS };
}

