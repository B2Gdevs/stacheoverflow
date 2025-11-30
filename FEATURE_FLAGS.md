# Feature Flags Guide

## Overview

The application uses a centralized feature flag system to enable/disable features without code changes.

## Configuration

Feature flags are configured in `lib/feature-flags.ts` and can be controlled via environment variables.

## Available Flags

### `SUBSCRIPTIONS_ENABLED`
- **Default**: `false` (disabled)
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_SUBSCRIPTIONS`
- **Description**: Controls subscription system visibility and functionality
- **When Disabled**:
  - Subscription nav item is hidden
  - Subscription page redirects to marketplace
  - Subscription-based downloads are disabled
  - Only purchase-based downloads work

### `PROMO_CODES_ENABLED`
- **Default**: `true` (enabled)
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_PROMO_CODES`
- **Description**: Controls promo code system
- **When Disabled**:
  - Promo code icon is hidden
  - Promo code API endpoints return errors

### `NEWS_ENABLED`
- **Default**: `false` (disabled)
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_NEWS`
- **Description**: Controls news/announcements banner
- **When Disabled**:
  - News banner is hidden

### `NOTIFICATIONS_ENABLED`
- **Default**: `false` (disabled)
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_NOTIFICATIONS`
- **Description**: Controls notification system
- **When Disabled**:
  - Notification bell is hidden

## How to Enable/Disable Features

### Via Environment Variables (Recommended)

Add to your `.env.local` or deployment environment:

```bash
# Enable subscriptions
NEXT_PUBLIC_FEATURE_SUBSCRIPTIONS=true

# Disable promo codes
NEXT_PUBLIC_FEATURE_PROMO_CODES=false
```

### Via Code (Not Recommended)

Edit `lib/feature-flags.ts` directly:

```typescript
export const FEATURE_FLAGS = {
  SUBSCRIPTIONS_ENABLED: true, // Change default
  // ...
}
```

## Current Configuration

- ✅ **Promo Codes**: Enabled (users can redeem codes for free assets)
- ❌ **Subscriptions**: Disabled (purchase-only model)
- ❌ **News**: Disabled
- ❌ **Notifications**: Disabled

## Purchase & Download System

When subscriptions are disabled, the system works as follows:

1. **Purchases**: Users purchase individual beats via Stripe
2. **Promo Codes**: Users can redeem codes to get free assets (creates $0 purchase record)
3. **Download Access**: Users have permanent access to purchased assets
4. **Purchase History**: All purchases (paid and promo) are tracked in the `purchases` table

## Notes

- Feature flags are checked at runtime
- Client-side flags use `NEXT_PUBLIC_` prefix
- Server-side code can check flags via `isFeatureEnabled()`
- When a feature is disabled, related UI elements are hidden
- Disabled features should not break the application

