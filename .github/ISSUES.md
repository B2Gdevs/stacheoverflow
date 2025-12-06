# Known Issues and Solutions

This document tracks common issues encountered during development and their solutions. For detailed troubleshooting steps, see [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md).

## Avatar Upload Issues

### Issue #1: "Bucket not found" Error

**Status:** ✅ Resolved  
**Date:** 2025-01-XX  
**Severity:** High

**Problem:**
Avatar uploads failed with "Bucket not found" error because the `avatars` bucket didn't exist in Supabase Storage.

**Solution:**
Created storage setup script that automatically creates the `avatars` bucket with proper configuration:
- Public access enabled
- 5MB file size limit
- Allowed MIME types configured

**Files Changed:**
- `scripts/setup-supabase-storage.js` - Added avatars bucket configuration
- `lib/constants.ts` - Added AVATARS bucket constant
- `lib/storage.ts` - Added support for avatars bucket

**Prevention:**
- Run `node scripts/setup-supabase-storage.js` during initial setup
- Document bucket requirements in setup guide

---

### Issue #2: Avatar Images Return 400 Bad Request

**Status:** ✅ Resolved  
**Date:** 2025-01-XX  
**Severity:** High

**Problem:**
Avatar uploads succeeded, but images didn't display because Supabase storage URLs returned `400 Bad Request`. Even though the bucket was marked as "public", Row Level Security (RLS) policies were required.

**Solution:**
Created SQL script to set up required RLS policies:
1. Public read access policy (SELECT)
2. Authenticated user upload policy (INSERT)
3. User update policy (UPDATE)
4. User delete policy (DELETE)

**Files Changed:**
- `scripts/setup-avatars-policy.sql` - SQL script with all required policies
- `scripts/setup-avatars-policies.js` - Helper script that shows SQL to run
- `docs/TROUBLESHOOTING.md` - Added detailed troubleshooting guide

**Prevention:**
- Include RLS policy setup in deployment checklist
- Add verification step in setup script
- Document in setup guide

---

## Lessons Learned

1. **Supabase Storage Buckets:**
   - Buckets must be explicitly created (not auto-created)
   - "Public" bucket setting doesn't automatically enable public access
   - RLS policies are always required, even for public buckets

2. **Storage Setup:**
   - Always create buckets via script during setup
   - Document all required buckets and their configurations
   - Include RLS policy setup in deployment process

3. **Error Handling:**
   - 400 Bad Request from storage usually means RLS policy issue
   - 404 Not Found usually means bucket doesn't exist
   - Always check Supabase Dashboard for bucket and policy status

---

## Creating New Issues

When encountering a new issue:

1. Check `docs/TROUBLESHOOTING.md` first
2. Search existing GitHub issues
3. If new issue, create with:
   - Clear description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs
   - Environment details

4. After resolution:
   - Update this document
   - Add to `docs/TROUBLESHOOTING.md`
   - Close the GitHub issue with solution summary

