#!/usr/bin/env node

/**
 * Create GitHub issues for avatar upload problems
 * Requires GITHUB_TOKEN environment variable
 * 
 * Usage: GITHUB_TOKEN=your_token node scripts/create-github-issues.js
 */

const https = require('https');
const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'B2Gdevs';
const REPO_NAME = 'stacheoverflow';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.error('   Get a token from: https://github.com/settings/tokens');
  console.error('   Then run: GITHUB_TOKEN=your_token node scripts/create-github-issues.js');
  process.exit(1);
}

// Get repository info
let repoOwner = REPO_OWNER;
let repoName = REPO_NAME;

try {
  const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
  const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (match) {
    repoOwner = match[1];
    repoName = match[2].replace('.git', '');
  }
} catch (error) {
  console.warn('⚠️  Could not determine repo from git, using defaults');
}

function createIssue(title, body, labels = []) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title,
      body,
      labels: ['bug', 'storage', 'avatar', ...labels]
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repoOwner}/${repoName}/issues`,
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const issue = JSON.parse(responseData);
          resolve(issue);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`🚀 Creating GitHub issues for ${repoOwner}/${repoName}...\n`);

  const issues = [
    {
      title: '[BUG] Avatar upload fails with "Bucket not found" error',
      body: `## Description

When attempting to upload a user avatar, the upload fails with a "Bucket not found" error (404/400 status code).

## Symptoms

- Error message: \`Bucket not found\` or \`StorageApiError: 404\`
- Avatar uploads fail with 400/404 status codes
- Files fall back to local storage instead of Supabase
- Console logs show: \`❌ Supabase upload error: Error [StorageApiError]: Bucket not found\`

## Root Cause

The \`avatars\` bucket doesn't exist in Supabase Storage. The application expects a dedicated public bucket for user profile pictures, but it hasn't been created yet.

## Solution

1. Run the storage setup script:
   \`\`\`bash
   node scripts/setup-supabase-storage.js
   \`\`\`

2. This will create the \`avatars\` bucket with:
   - Public access enabled
   - 5MB file size limit
   - Allowed MIME types: \`image/jpeg\`, \`image/png\`, \`image/gif\`, \`image/webp\`

3. Verify the bucket exists in Supabase Dashboard → Storage → Buckets

## Verification

After running the setup script:
- Check Supabase Dashboard → Storage → Buckets for \`avatars\` bucket
- Try uploading an avatar again
- Verify upload succeeds and file is stored in Supabase

## Related Files

- \`scripts/setup-supabase-storage.js\` - Storage bucket setup script
- \`app/api/user/avatar/route.ts\` - Avatar upload API endpoint
- \`lib/storage.ts\` - Storage utility functions

## Additional Notes

- The \`avatars\` bucket must be created as **public** for images to be accessible
- After creating the bucket, you may also need to set up RLS policies (see related issue)

## Related Issues

- See: Avatar Upload - 400 Bad Request (RLS policies issue)`,
      labels: []
    },
    {
      title: '[BUG] Avatar images return 400 Bad Request - RLS policies missing',
      body: `## Description

Avatar uploads succeed and the URL is saved to the database, but the images don't display because requests to the Supabase storage URL return \`400 Bad Request\`.

## Symptoms

- Avatar upload succeeds (no errors during upload)
- Avatar URL is saved to database correctly
- Image doesn't display in UI
- Network request shows \`400 Bad Request\` when loading the image URL
- Console shows: \`⚠️ Avatar URL not accessible: { status: 400, statusText: 'Bad Request' }\`
- URL format: \`https://[project].supabase.co/storage/v1/object/public/avatars/[filename]\`

## Root Cause

Even though the \`avatars\` bucket is marked as "public" in Supabase, **Row Level Security (RLS) policies** are required to allow public read access to storage objects. Without these policies, Supabase blocks all access to the bucket, even if it's marked as public.

## Solution

### Step 1: Create RLS Policies

Go to **Supabase Dashboard → SQL Editor** and run the following SQL:

\`\`\`sql
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
\`\`\`

### Step 2: Verify Policies

1. Go to **Supabase Dashboard → Storage → Policies**
2. Select the \`avatars\` bucket
3. Verify the policies are listed:
   - "Public avatar read access" (SELECT)
   - "Authenticated users can upload avatars" (INSERT)
   - "Users can update their own avatars" (UPDATE)
   - "Users can delete their own avatars" (DELETE)

### Alternative: Use Provided SQL File

You can also use the provided SQL file:
\`\`\`bash
# Copy the SQL from scripts/setup-avatars-policy.sql
# and run it in Supabase SQL Editor
\`\`\`

## Verification

After creating the policies:
1. Upload a new avatar
2. Check that the image displays correctly in the UI
3. Verify the URL is accessible in browser (should return 200 OK)
4. Check browser Network tab - image request should return 200 status

## Why This Happens

Supabase uses Row Level Security (RLS) to control access to storage objects. Even if a bucket is marked as "public", RLS policies must explicitly allow operations. This is a security feature to prevent accidental public exposure of private data.

## Related Files

- \`scripts/setup-avatars-policy.sql\` - SQL file with all required policies
- \`scripts/setup-avatars-policies.js\` - Helper script (shows SQL to run)
- \`app/api/user/avatar/route.ts\` - Avatar upload API endpoint
- \`lib/storage.ts\` - Storage utility functions

## Additional Notes

- The \`SELECT\` policy is the most important one - it allows public read access
- The \`INSERT\`, \`UPDATE\`, and \`DELETE\` policies restrict write operations to authenticated users
- If you want to allow anonymous uploads, you can modify the INSERT policy to remove the \`auth.role() = 'authenticated'\` check (not recommended for production)

## Related Issues

- See: Avatar Upload - Bucket Not Found (bucket creation issue)

## Documentation

See \`docs/TROUBLESHOOTING.md\` for more details on this and other common issues.`,
      labels: ['rls']
    }
  ];

  try {
    for (const issue of issues) {
      console.log(`📝 Creating issue: ${issue.title}`);
      const created = await createIssue(issue.title, issue.body, issue.labels);
      console.log(`✅ Created: ${created.html_url}\n`);
    }
    console.log('🎉 All issues created successfully!');
  } catch (error) {
    console.error('❌ Error creating issues:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n💡 Make sure your GITHUB_TOKEN has the "repo" scope');
      console.error('   Create a token at: https://github.com/settings/tokens');
    }
    process.exit(1);
  }
}

main();

