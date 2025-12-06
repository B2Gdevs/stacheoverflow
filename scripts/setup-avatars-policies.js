#!/usr/bin/env node

/**
 * Setup RLS policies for avatars bucket
 * This allows public read access to avatars while keeping upload restricted
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

async function setupPolicies() {
  console.log('🔐 Setting up RLS policies for avatars bucket...\n');

  const policies = [
    {
      name: 'Public avatar read access',
      operation: 'SELECT',
      definition: "bucket_id = 'avatars'",
      description: 'Allow anyone to read avatars (public access)'
    },
    {
      name: 'Authenticated users can upload avatars',
      operation: 'INSERT',
      definition: "bucket_id = 'avatars' AND auth.role() = 'authenticated'",
      description: 'Allow authenticated users to upload avatars'
    },
    {
      name: 'Users can update their own avatars',
      operation: 'UPDATE',
      definition: "bucket_id = 'avatars' AND auth.role() = 'authenticated'",
      description: 'Allow authenticated users to update avatars'
    },
    {
      name: 'Users can delete their own avatars',
      operation: 'DELETE',
      definition: "bucket_id = 'avatars' AND auth.role() = 'authenticated'",
      description: 'Allow authenticated users to delete avatars'
    }
  ];

  for (const policy of policies) {
    try {
      console.log(`📝 Creating policy: ${policy.name}`);
      
      // Note: Supabase doesn't have a direct JS API for creating storage policies
      // You need to run SQL. This script provides the SQL you need to run.
      console.log(`   SQL to run:`);
      console.log(`   CREATE POLICY "${policy.name}"`);
      console.log(`   ON storage.objects`);
      console.log(`   FOR ${policy.operation}`);
      console.log(`   ${policy.operation === 'SELECT' ? 'USING' : 'WITH CHECK'} (${policy.definition});`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error with policy ${policy.name}:`, error);
    }
  }

  console.log('⚠️  IMPORTANT: Supabase Storage policies must be created via SQL.');
  console.log('Please run the SQL commands shown above in the Supabase SQL Editor.');
  console.log('\nOr copy the SQL from: scripts/setup-avatars-policy.sql');
  console.log('\nSteps:');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Copy and paste the SQL from scripts/setup-avatars-policy.sql');
  console.log('3. Run the SQL');
  console.log('4. Verify in Storage → Policies that the policies are created');
}

setupPolicies().catch(console.error);

