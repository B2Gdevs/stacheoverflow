#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Supabase Storage connection...\n');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', url);
console.log('Service Key (first 20 chars):', serviceKey ? serviceKey.substring(0, 20) + '...' : 'NOT SET');
console.log('');

try {
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase client created successfully');
  
  // Test storage access
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.log('❌ Error listing buckets:', error);
  } else {
    console.log('✅ Successfully connected to Supabase Storage');
    console.log('Available buckets:', buckets.map(b => b.name));
  }
  
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
}
