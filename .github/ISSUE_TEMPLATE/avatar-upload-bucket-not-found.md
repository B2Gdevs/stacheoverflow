---
name: Avatar Upload - Bucket Not Found
about: Issue when avatar upload fails because avatars bucket doesn't exist
title: '[BUG] Avatar upload fails with "Bucket not found" error'
labels: bug, storage, avatar
assignees: ''
---

## Description

When attempting to upload a user avatar, the upload fails with a "Bucket not found" error (404/400 status code).

## Symptoms

- Error message: `Bucket not found` or `StorageApiError: 404`
- Avatar uploads fail with 400/404 status codes
- Files fall back to local storage instead of Supabase
- Console logs show: `❌ Supabase upload error: Error [StorageApiError]: Bucket not found`

## Root Cause

The `avatars` bucket doesn't exist in Supabase Storage. The application expects a dedicated public bucket for user profile pictures, but it hasn't been created yet.

## Solution

1. Run the storage setup script:
   ```bash
   node scripts/setup-supabase-storage.js
   ```

2. This will create the `avatars` bucket with:
   - Public access enabled
   - 5MB file size limit
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

3. Verify the bucket exists in Supabase Dashboard → Storage → Buckets

## Verification

After running the setup script:
- Check Supabase Dashboard → Storage → Buckets for `avatars` bucket
- Try uploading an avatar again
- Verify upload succeeds and file is stored in Supabase

## Related Files

- `scripts/setup-supabase-storage.js` - Storage bucket setup script
- `app/api/user/avatar/route.ts` - Avatar upload API endpoint
- `lib/storage.ts` - Storage utility functions

## Additional Notes

- The `avatars` bucket must be created as **public** for images to be accessible
- After creating the bucket, you may also need to set up RLS policies (see related issue)

## Related Issues

- See: Avatar Upload - 400 Bad Request (RLS policies issue)

