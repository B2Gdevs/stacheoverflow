---
name: Avatar Upload - 400 Bad Request
about: Issue when avatar images return 400 Bad Request even after successful upload
title: '[BUG] Avatar images return 400 Bad Request - RLS policies missing'
labels: bug, storage, avatar, rls
assignees: ''
---

## Description

Avatar uploads succeed and the URL is saved to the database, but the images don't display because requests to the Supabase storage URL return `400 Bad Request`.

## Symptoms

- Avatar upload succeeds (no errors during upload)
- Avatar URL is saved to database correctly
- Image doesn't display in UI
- Network request shows `400 Bad Request` when loading the image URL
- Console shows: `⚠️ Avatar URL not accessible: { status: 400, statusText: 'Bad Request' }`
- URL format: `https://[project].supabase.co/storage/v1/object/public/avatars/[filename]`

## Root Cause

Even though the `avatars` bucket is marked as "public" in Supabase, **Row Level Security (RLS) policies** are required to allow public read access to storage objects. Without these policies, Supabase blocks all access to the bucket, even if it's marked as public.

## Solution

### Step 1: Create RLS Policies

Go to **Supabase Dashboard → SQL Editor** and run the following SQL:

```sql
-- Allow public read access to avatars bucket
CREATE POLICY "Public avatar read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```

### Step 2: Verify Policies

1. Go to **Supabase Dashboard → Storage → Policies**
2. Select the `avatars` bucket
3. Verify the policies are listed:
   - "Public avatar read access" (SELECT)
   - "Authenticated users can upload avatars" (INSERT)
   - "Users can update their own avatars" (UPDATE)
   - "Users can delete their own avatars" (DELETE)

### Alternative: Use Provided SQL File

You can also use the provided SQL file:
```bash
# Copy the SQL from scripts/setup-avatars-policy.sql
# and run it in Supabase SQL Editor
```

## Verification

After creating the policies:
1. Upload a new avatar
2. Check that the image displays correctly in the UI
3. Verify the URL is accessible in browser (should return 200 OK)
4. Check browser Network tab - image request should return 200 status

## Why This Happens

Supabase uses Row Level Security (RLS) to control access to storage objects. Even if a bucket is marked as "public", RLS policies must explicitly allow operations. This is a security feature to prevent accidental public exposure of private data.

## Related Files

- `scripts/setup-avatars-policy.sql` - SQL file with all required policies
- `scripts/setup-avatars-policies.js` - Helper script (shows SQL to run)
- `app/api/user/avatar/route.ts` - Avatar upload API endpoint
- `lib/storage.ts` - Storage utility functions

## Additional Notes

- The `SELECT` policy is the most important one - it allows public read access
- The `INSERT`, `UPDATE`, and `DELETE` policies restrict write operations to authenticated users
- If you want to allow anonymous uploads, you can modify the INSERT policy to remove the `auth.role() = 'authenticated'` check (not recommended for production)

## Related Issues

- See: Avatar Upload - Bucket Not Found (bucket creation issue)

## Documentation

See `docs/TROUBLESHOOTING.md` for more details on this and other common issues.

