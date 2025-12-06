#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * 
 * This script helps you set up the required storage buckets in Supabase.
 * Run this after you've configured your Supabase project and environment variables.
 * 
 * Usage: node scripts/setup-supabase-storage.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const buckets = [
  {
    name: 'audio-files',
    public: false, // Private bucket for audio files
    fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3']
  },
  {
    name: 'cover-images',
    public: false, // Private bucket for cover images
    fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    name: 'avatars',
    public: true, // Public bucket for user profile pictures
    fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }
];

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage buckets...\n');

  for (const bucket of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}`);
      
      // Check if bucket already exists
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`❌ Error listing buckets:`, listError);
        continue;
      }

      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (bucketExists) {
        console.log(`✅ Bucket ${bucket.name} already exists`);
        continue;
      }

      // Create the bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        console.error(`❌ Error creating bucket ${bucket.name}:`, error);
      } else {
        console.log(`✅ Successfully created bucket: ${bucket.name}`);
        console.log(`   - Public: ${bucket.public}`);
        console.log(`   - File size limit: ${bucket.fileSizeLimit / (1024 * 1024)}MB`);
        console.log(`   - Allowed MIME types: ${bucket.allowedMimeTypes.join(', ')}`);
        
        // For public buckets, we need to ensure RLS policies allow public access
        if (bucket.public && bucket.name === 'avatars') {
          console.log(`\n   ⚠️  IMPORTANT: For the avatars bucket to work, you need to:`);
          console.log(`   1. Go to Supabase Dashboard → Storage → Policies`);
          console.log(`   2. Select the 'avatars' bucket`);
          console.log(`   3. Create a policy that allows public SELECT access:`);
          console.log(`      Policy name: "Public avatar access"`);
          console.log(`      Allowed operation: SELECT`);
          console.log(`      Policy definition: true (allow all)`);
          console.log(`   4. Or disable RLS on the storage.objects table for this bucket`);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error with bucket ${bucket.name}:`, error);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎉 Storage setup complete!');
  console.log('\nNext steps:');
  console.log('1. Make sure your .env.local has the correct Supabase credentials');
  console.log('2. For the avatars bucket, ensure RLS policies allow public read access');
  console.log('3. Test file uploads through your application');
  console.log('4. Verify files are accessible through the /api/files endpoint');
}

// Run the setup
setupStorage().catch(console.error);
