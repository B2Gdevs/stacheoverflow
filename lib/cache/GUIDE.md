# API Caching Guide

**Standardized server-side API response caching** - This guide shows you exactly how to add caching to any API route.

## Quick Reference

### 1. Add Route to Config (`lib/cache/config.ts`)

```typescript
export const CACHE_CONFIG = {
  '/api/my-route': {
    ttl: 30 * 60 * 1000, // 30 minutes (in milliseconds)
    description: 'My route description',
    invalidateOn: ['POST /api/my-route', 'PUT /api/my-route/:id'],
    userSpecific: false, // Set to true if different per user
  },
};
```

### 2. Wrap GET Handler with `withCache`

```typescript
import { withCache } from '@/lib/cache/cache-middleware';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(); // Optional: for user-specific caching
  
  return withCache(request, async () => {
    // Your database query
    const data = await db.select().from(myTable);
    return NextResponse.json({ data });
  }, {
    userId: user?.id,        // Optional: for user-specific caching
    isAdmin: user?.role === 'admin', // Optional: for admin-specific caching
  });
}
```

### 3. Invalidate Cache on Mutations

```typescript
import { cacheInvalidation } from '@/lib/cache/api-cache';

export async function POST(request: Request) {
  // Create/update/delete logic...
  await db.insert(myTable).values(data);
  
  // Invalidate cache
  cacheInvalidation.myRoute(); // Add to cacheInvalidation if needed
  
  return NextResponse.json({ success: true });
}
```

## Step-by-Step Examples

### Example 1: Simple List Route (No User Context)

**Route:** `/api/products`

1. **Add to config:**
```typescript
'/api/products': {
  ttl: 2 * 60 * 60 * 1000, // 2 hours
  description: 'Product listings',
  invalidateOn: ['POST /api/products', 'PUT /api/products/:id'],
},
```

2. **Update GET handler:**
```typescript
export async function GET(request: NextRequest) {
  return withCache(request, async () => {
    const products = await db.select().from(products);
    return NextResponse.json({ products });
  });
}
```

3. **Invalidate on mutations:**
```typescript
export async function POST(request: Request) {
  await db.insert(products).values(data);
  cacheInvalidation.products(); // Add this function to cacheInvalidation
  return NextResponse.json({ success: true });
}
```

### Example 2: User-Specific Route

**Route:** `/api/user/settings`

1. **Add to config:**
```typescript
'/api/user/settings': {
  ttl: 15 * 60 * 1000, // 15 minutes
  description: 'User settings - user-specific',
  invalidateOn: ['PUT /api/user/settings'],
  userSpecific: true, // Important!
},
```

2. **Update GET handler:**
```typescript
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  return withCache(request, async () => {
    const settings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id));
    return NextResponse.json({ settings });
  }, {
    userId: user.id, // Required for user-specific caching
  });
}
```

3. **Invalidate on mutations:**
```typescript
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  await db.update(userSettings).set(data).where(eq(userSettings.userId, user.id));
  cacheInvalidation.user(user.id); // Invalidate user-specific cache
  return NextResponse.json({ success: true });
}
```

### Example 3: Route with Query Parameters

**Route:** `/api/products?category=electronics&page=1`

The cache automatically handles query parameters - no special configuration needed!

```typescript
export async function GET(request: NextRequest) {
  return withCache(request, async () => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    
    // Query with filters
    const products = await db.select()
      .from(products)
      .where(category ? eq(products.category, category) : undefined);
    
    return NextResponse.json({ products });
  });
}
```

Each unique combination of query parameters gets its own cache entry.

### Example 4: Admin vs Regular User

**Route:** `/api/orders` (admins see all, users see only their own)

1. **Add to config:**
```typescript
'/api/orders': {
  ttl: 5 * 60 * 1000, // 5 minutes
  description: 'Orders - different for admin vs user',
  invalidateOn: ['POST /api/orders', 'PUT /api/orders/:id'],
},
```

2. **Update GET handler:**
```typescript
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';
  
  return withCache(request, async () => {
    const orders = await db.select()
      .from(orders)
      .where(isAdmin ? undefined : eq(orders.userId, user.id));
    
    return NextResponse.json({ orders });
  }, {
    userId: user?.id,
    isAdmin, // Important: different cache for admin vs user
  });
}
```

## TTL Guidelines

Choose TTL based on how often data changes:

| Data Type | Recommended TTL | Example Routes |
|-----------|----------------|----------------|
| **Listings** (rarely change) | 3-4 hours | `/api/beats`, `/api/products` |
| **Reference Data** (very rarely changes) | 6+ hours | `/api/tags`, `/api/categories` |
| **Individual Items** | 1 hour | `/api/beats/:id`, `/api/products/:id` |
| **User Data** | 15 minutes | `/api/user`, `/api/user/settings` |
| **Admin Data** | 5 minutes | `/api/admin/logs`, `/api/admin/stats` |
| **Real-time Data** | No cache | `/api/live-updates`, `/api/notifications` |

## Cache Invalidation Patterns

### Pattern 1: Invalidate List When Item Changes

```typescript
// When updating a beat
cacheInvalidation.beat(beatId); // Invalidates both the item AND the list
```

### Pattern 2: Invalidate Related Caches

```typescript
// When creating a subscription
cacheInvalidation.subscriptions(); // Invalidates /api/subscriptions
cacheInvalidation.user(userId);    // Invalidates /api/user/subscription
```

### Pattern 3: Invalidate All Related

```typescript
// When updating a beat pack
cacheInvalidation.beatPack(packId); // Invalidates pack AND list
cacheInvalidation.beats();          // Also invalidate beats (if packs contain beats)
```

## Adding New Invalidation Functions

If you need a new invalidation function, add it to `lib/cache/api-cache.ts`:

```typescript
export const cacheInvalidation = {
  // ... existing functions
  
  // Add your new function
  myRoute: () => {
    apiCache.delete('/api/my-route');
    // Also invalidate related routes if needed
    apiCache.deletePattern('^/api/my-route');
  },
  
  myRouteItem: (id: number) => {
    apiCache.delete(`/api/my-route/${id}`);
    cacheInvalidation.myRoute(); // Also invalidate list
  },
};
```

## Testing Cache

### Check Cache Headers

Cached responses include:
- `X-Cache: HIT` - Response came from cache
- `X-Cache: MISS` - Response was fetched and cached
- `X-Cache-Key` - The cache key used
- `X-Cache-TTL` - TTL in milliseconds

### Monitor Cache Stats

```typescript
import { apiCache } from '@/lib/cache/api-cache';

const stats = apiCache.getStats();
console.log('Cache size:', stats.size);
console.log('Cached keys:', stats.keys);
```

## Common Patterns

### Pattern: Skip Cache for Testing

```typescript
export async function GET(request: NextRequest) {
  return withCache(request, async () => {
    // Handler
  }, {
    skipCache: process.env.NODE_ENV === 'test', // Skip in tests
  });
}
```

### Pattern: Different TTL for Different Users

```typescript
// In your handler, you can check user role and adjust behavior
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';
  
  // Admins might want fresher data
  return withCache(request, async () => {
    // Handler
  }, {
    userId: user?.id,
    isAdmin,
    // Cache will use different keys for admin vs user
  });
}
```

## Troubleshooting

### Cache Not Working?

1. **Check config** - Is your route in `CACHE_CONFIG`?
2. **Check TTL** - Is TTL set correctly?
3. **Check cache key** - Are query params included? User context?
4. **Check invalidation** - Are you invalidating on mutations?

### Cache Too Stale?

- Reduce TTL in config
- Invalidate more aggressively on mutations

### Cache Not Invalidating?

- Check invalidation function is called
- Check cache key matches between GET and invalidation
- Use `apiCache.getStats()` to see what's cached

## Migration Checklist

When adding caching to an existing route:

- [ ] Add route to `CACHE_CONFIG` with appropriate TTL
- [ ] Wrap GET handler with `withCache`
- [ ] Add user/admin context if needed
- [ ] Add cache invalidation to POST/PUT/DELETE handlers
- [ ] Test cache hit/miss with headers
- [ ] Test cache invalidation works
- [ ] Update documentation if needed

