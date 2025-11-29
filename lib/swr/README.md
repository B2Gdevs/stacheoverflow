# SWR Caching System

This directory contains a centralized caching system for API data using SWR, similar to React Query functionality.

## Features

- **Persistent Cache**: Data is cached in localStorage and persists across page refreshes
- **Automatic Revalidation**: Data revalidates on focus, reconnect, and when stale
- **Shared Fetcher**: All API requests use a shared fetcher with authentication headers
- **Cache Utilities**: Easy-to-use functions for cache invalidation and management
- **Custom Hooks**: Pre-built hooks for common data fetching patterns

## Usage

### Basic Usage

```tsx
import useSWR from 'swr';
import { fetcher, CACHE_KEYS } from '@/lib/swr/config';

function MyComponent() {
  const { data, error, isLoading } = useSWR(CACHE_KEYS.USER, fetcher);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  
  return <div>{data.name}</div>;
}
```

### Using Custom Hooks

```tsx
import { useUser, useBeats } from '@/lib/swr/hooks';

function MyComponent() {
  const { user, isLoading, refresh } = useUser();
  const { beats } = useBeats();
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Cache Invalidation

```tsx
import { invalidateCache, invalidateUserCache, invalidateBeatsCache } from '@/lib/swr/cache';

// Invalidate specific cache
await invalidateCache('/api/user');

// Invalidate user-related caches
await invalidateUserCache();

// Invalidate beats-related caches
await invalidateBeatsCache();
```

### Cache Keys

Use the `CACHE_KEYS` constant for consistent cache key references:

```tsx
import { CACHE_KEYS } from '@/lib/swr/config';

CACHE_KEYS.USER              // '/api/user'
CACHE_KEYS.BEATS             // '/api/beats'
CACHE_KEYS.BEAT_PACKS        // '/api/beat-packs'
CACHE_KEYS.SUBSCRIPTIONS     // '/api/subscriptions'
CACHE_KEYS.USER_SUBSCRIPTION // '/api/user/subscription'
```

## Configuration

The SWR configuration is set up in `lib/swr/config.ts` with:

- **Persistent Cache**: Data persists in localStorage for 24 hours
- **Revalidation**: Automatic revalidation on focus, reconnect, and when stale
- **Deduplication**: Requests are deduplicated within 2 seconds
- **Error Retry**: 3 retries with 5-second intervals
- **Keep Previous Data**: Previous data is kept while fetching new data

## Cache Provider

The cache provider automatically:
- Loads cached data from localStorage on initialization
- Persists cache updates to localStorage (throttled to every 1 second)
- Expires cached data after 24 hours

## Migration Guide

To migrate existing components:

1. Replace custom fetchers with the shared `fetcher`:
   ```tsx
   // Before
   const fetcher = async (url: string) => {
     const res = await fetch(url);
     return res.json();
   };
   
   // After
   import { fetcher } from '@/lib/swr/config';
   ```

2. Use `CACHE_KEYS` for consistent cache keys:
   ```tsx
   // Before
   useSWR('/api/user', fetcher);
   
   // After
   import { CACHE_KEYS } from '@/lib/swr/config';
   useSWR(CACHE_KEYS.USER, fetcher);
   ```

3. Use cache utilities for invalidation:
   ```tsx
   // Before
   mutate('/api/user');
   
   // After
   import { invalidateUserCache } from '@/lib/swr/cache';
   await invalidateUserCache();
   ```

