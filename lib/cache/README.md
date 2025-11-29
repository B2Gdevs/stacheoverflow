# API Caching System

**Standard server-side API response caching** (similar to Redis) that reduces database load and improves response times.

## Quick Start

### 1. Add Caching to a GET Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/cache/cache-middleware';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  return withCache(request, async () => {
    // Your database query
    const data = await db.select().from(beats);
    return NextResponse.json({ beats: data });
  }, {
    userId: user?.id,
    isAdmin: user?.role === 'admin',
  });
}
```

### 2. Invalidate Cache on Mutations

```typescript
import { cacheInvalidation } from '@/lib/cache/api-cache';

export async function POST(request: Request) {
  // Create/update/delete logic...
  const newBeat = await db.insert(beats).values(data);
  
  // Invalidate cache
  cacheInvalidation.beats();
  
  return NextResponse.json({ success: true, beat: newBeat });
}
```

## Configuration

All cache TTLs are configured in `lib/cache/config.ts`:

```typescript
export const CACHE_CONFIG = {
  '/api/beats': {
    ttl: 4 * 60 * 60 * 1000, // 4 hours
    description: 'Beat listings - can be stale for hours',
    invalidateOn: ['POST /api/beats', 'PUT /api/beats/:id', 'DELETE /api/beats'],
  },
  // ... more routes
};
```

### Adding a New Route to Cache

1. **Add to config** (`lib/cache/config.ts`):
   ```typescript
   '/api/my-route': {
     ttl: 30 * 60 * 1000, // 30 minutes
     description: 'My route description',
     invalidateOn: ['POST /api/my-route'],
     userSpecific: false, // Set to true if different per user
   },
   ```

2. **Wrap GET handler** with `withCache`:
   ```typescript
   export async function GET(request: NextRequest) {
     return withCache(request, async () => {
       // Your handler
     });
   }
   ```

3. **Invalidate on mutations**:
   ```typescript
   export async function POST(request: Request) {
     // Mutation logic...
     cacheInvalidation.myRoute(); // Add to cacheInvalidation if needed
   }
   ```

## Cache TTLs by Category

| Category | TTL | Example Routes |
|----------|-----|----------------|
| **Listings** | 4 hours | `/api/beats`, `/api/beat-packs` |
| **Individual Items** | 1 hour | `/api/beats/:id`, `/api/beat-packs/:id` |
| **Subscriptions** | 2 hours | `/api/subscriptions` |
| **User Data** | 15 minutes | `/api/user`, `/api/user/subscription` |
| **Admin Data** | 5 minutes | `/api/admin/logs`, `/api/admin/subscriptions` |
| **Reference Data** | 6 hours | `/api/tags` |
| **Default** | 30 minutes | Unmapped routes |

## Cache Invalidation

### Automatic Patterns

The cache automatically invalidates based on patterns defined in `CACHE_CONFIG`:

```typescript
'/api/beats': {
  invalidateOn: ['POST /api/beats', 'PUT /api/beats/:id', 'DELETE /api/beats'],
}
```

### Manual Invalidation

```typescript
import { cacheInvalidation } from '@/lib/cache/api-cache';

// Invalidate all beats
cacheInvalidation.beats();

// Invalidate specific beat
cacheInvalidation.beat(beatId);

// Invalidate user cache
cacheInvalidation.user(userId);

// Invalidate all cache
apiCache.clear();
```

## How It Works

1. **GET Request Flow**:
   ```
   Request → Check Cache → Cache Hit? → Return Cached
                              ↓ No
                         Execute Handler → Cache Result → Return Response
   ```

2. **POST/PUT/DELETE Flow**:
   ```
   Request → Execute Mutation → Invalidate Cache → Return Response
   ```

3. **Cache Keys**:
   - Include endpoint path
   - Include user ID (for user-specific endpoints)
   - Include admin flag (admins see different data)

## Response Headers

Cached responses include these headers:

- `X-Cache: HIT` or `X-Cache: MISS`
- `X-Cache-Key: /api/beats:admin:false`
- `X-Cache-TTL: 14400000` (in milliseconds)

## Benefits

✅ **Reduced Database Load** - Cached responses don't hit the database  
✅ **Faster Response Times** - Cached responses return instantly  
✅ **Configurable TTLs** - Different endpoints have different freshness needs  
✅ **Automatic Invalidation** - Cache stays fresh when data changes  
✅ **Standard Pattern** - Easy to understand and maintain  
✅ **Upgradeable** - Can switch to Redis later without changing API

## Monitoring

Get cache statistics:

```typescript
import { apiCache } from '@/lib/cache/api-cache';

const stats = apiCache.getStats();
console.log(stats);
// { size: 42, maxSize: 1000, keys: [...] }
```

## Future: Redis Integration

This can be upgraded to Redis by replacing the `ApiCache` class with a Redis client. The API remains the same.

```typescript
// Future Redis implementation
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

class RedisCache {
  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set(key: string, data: any, ttl: number) {
    await redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(data));
  }
  // ... rest of implementation
}
```
