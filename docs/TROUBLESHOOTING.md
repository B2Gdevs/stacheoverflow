# Troubleshooting Guide

This document covers common issues and their solutions for the Stacheoverflow application.

## Table of Contents

- [Avatar Upload Issues](#avatar-upload-issues)
- [Storage Bucket Configuration](#storage-bucket-configuration)
- [Authentication Issues](#authentication-issues)
- [Database Migration Issues](#database-migration-issues)

---

## Avatar Upload Issues

### Issue: "Bucket not found" Error

**Symptoms:**
- Error message: `Bucket not found` or `StorageApiError: 404`
- Avatar uploads fail with 400/404 status codes
- Files fall back to local storage instead of Supabase

**Root Cause:**
The `avatars` bucket doesn't exist in Supabase Storage.

**Solution:**
1. Run the storage setup script:
   ```bash
   node scripts/setup-supabase-storage.js
   ```
2. This will create the `avatars` bucket with public access enabled
3. Verify the bucket exists in Supabase Dashboard → Storage → Buckets

**Related Files:**
- `scripts/setup-supabase-storage.js`
- `app/api/user/avatar/route.ts`

---

### Issue: Avatar Images Return 400 Bad Request

**Symptoms:**
- Avatar upload succeeds
- Avatar URL is saved to database
- Image doesn't display in UI
- Network request shows `400 Bad Request` when loading the image URL
- Console shows: `⚠️ Avatar URL not accessible: { status: 400 }`

**Root Cause:**
Even though the bucket is marked as "public" in Supabase, Row Level Security (RLS) policies are required to allow public read access to storage objects.

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the following SQL to create the necessary policies:

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

3. Alternatively, you can use the provided SQL file:
   ```bash
   # Copy the SQL from scripts/setup-avatars-policy.sql
   # and run it in Supabase SQL Editor
   ```

4. Verify policies are created in Supabase Dashboard → Storage → Policies → avatars

**Verification:**
- Upload a new avatar
- Check that the image displays correctly
- Verify the URL is accessible in browser (should return 200 OK)

**Related Files:**
- `scripts/setup-avatars-policy.sql`
- `app/api/user/avatar/route.ts`
- `lib/storage.ts`

**Related Issues:**
- See GitHub issue: [Avatar upload fails with 400 Bad Request](#) (link to be added)

---

## Storage Bucket Configuration

### Required Buckets

The application requires the following Supabase Storage buckets:

1. **`avatars`** - Public bucket for user profile pictures
   - Public: `true`
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
   - Requires RLS policies for public read access

2. **`cover-images`** - Private bucket for album/beat cover images
   - Public: `false`
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

3. **`audio-files`** - Private bucket for audio files
   - Public: `false`
   - File size limit: 50MB
   - Allowed MIME types: `audio/mpeg`, `audio/wav`, `audio/mp3`

**Setup:**
```bash
node scripts/setup-supabase-storage.js
```

---

## Authentication Issues

### Issue: 401 Unauthorized on API Routes

**Symptoms:**
- API requests return `401 Unauthorized`
- User appears to be logged in but API calls fail
- Console shows authentication errors

**Common Causes:**

1. **Missing Authorization Header**
   - Client-side requests need to include the Supabase access token
   - Check that `credentials: 'include'` is set in fetch requests
   - Verify `Authorization: Bearer <token>` header is included

2. **Session Expired**
   - Supabase sessions expire after a period of inactivity
   - User needs to refresh or re-authenticate

3. **Cookie Issues**
   - Cookies may not be sent with cross-origin requests
   - Ensure `credentials: 'include'` is set
   - Check CORS configuration in Supabase

**Solution:**
- Check browser console for specific error messages
- Verify session is valid: `supabase.auth.getSession()`
- Ensure API routes properly handle both Supabase and legacy authentication

**Related Files:**
- `app/api/user/avatar/route.ts`
- `lib/auth/session.ts`
- `utils/supabase/server.ts`

---

## Database Migration Issues

### Issue: Migration Fails or Column Already Exists

**Symptoms:**
- Migration script fails with "column already exists" error
- Database schema out of sync with code

**Solution:**
1. Check if migration has already been run:
   ```bash
   # Check migration status in database
   psql $SUPABASE_DATABASE_URL -c "SELECT * FROM drizzle.__drizzle_migrations;"
   ```

2. If column exists but migration fails, use `IF NOT EXISTS`:
   ```sql
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;
   ```

3. Run migration manually if needed:
   ```bash
   node scripts/run-avatar-migration.js
   ```

**Related Files:**
- `lib/db/migrations/0014_add_avatar_url.sql`
- `scripts/run-avatar-migration.js`

---

## Getting Help

If you encounter an issue not covered here:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review application logs in the terminal
3. Check browser console for client-side errors
4. Verify environment variables are set correctly in `.env.local`
5. Create a GitHub issue with:
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant log output

---

## Quick Reference

### Common Commands

```bash
# Setup storage buckets
node scripts/setup-supabase-storage.js

# Run database migration
node scripts/run-avatar-migration.js

# Check Supabase connection
node scripts/test-supabase-connection.js
```

### Important Files

- Storage configuration: `lib/storage.ts`
- Avatar upload API: `app/api/user/avatar/route.ts`
- Storage setup: `scripts/setup-supabase-storage.js`
- RLS policies: `scripts/setup-avatars-policy.sql`
- Database schema: `lib/db/schema.ts`

