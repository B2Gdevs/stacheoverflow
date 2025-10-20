#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Verifying Supabase setup...');
console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

// Extract project reference from URL
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const projectRef = url.hostname.split('.')[0];
console.log('Project reference:', projectRef);

// Test different possible database hostnames
const possibleHostnames = [
  `db.${projectRef}.supabase.co`,
  `${projectRef}.supabase.co`,
  `aws-0-us-west-1.pooler.supabase.com`,
  `aws-0-us-east-1.pooler.supabase.com`
];

console.log('\n🧪 Testing possible database hostnames...');

for (const hostname of possibleHostnames) {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync(`nslookup ${hostname}`);
    if (stdout.includes('Address:')) {
      console.log(`✅ ${hostname} - DNS resolves`);
    } else {
      console.log(`❌ ${hostname} - DNS does not resolve`);
    }
  } catch (error) {
    console.log(`❌ ${hostname} - DNS lookup failed`);
  }
}

console.log('\n📋 Next steps:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to Settings → Database');
console.log('3. Look for "Connection string" or "Connection pooling"');
console.log('4. Copy the correct hostname and update your SUPABASE_DATABASE_URL');
