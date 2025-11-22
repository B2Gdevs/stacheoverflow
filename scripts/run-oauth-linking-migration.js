#!/usr/bin/env node

/**
 * Script to run the OAuth account linking migration
 * This creates a trigger that automatically links OAuth accounts to existing email/password accounts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationPath = join(__dirname, '../lib/db/migrations/0011_link_oauth_to_existing_users.sql');

async function runMigration() {
  try {
    console.log('🚀 Running OAuth account linking migration...\n');
    
    // Read the migration file
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Executing migration SQL...\n');
    
    // Execute the migration using Supabase's RPC or direct SQL execution
    // Note: Supabase doesn't have a direct SQL execution endpoint in the JS client
    // You'll need to run this in the Supabase SQL Editor or use the REST API
    
    console.log('⚠️  Note: This migration needs to be run in the Supabase SQL Editor');
    console.log('📋 Go to: https://supabase.com/dashboard/project/[your-project]/sql/new');
    console.log('\n📄 Migration SQL:\n');
    console.log('─'.repeat(80));
    console.log(migrationSQL);
    console.log('─'.repeat(80));
    
    console.log('\n✅ Migration SQL ready to execute');
    console.log('\n📝 Steps to apply:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to your Supabase Dashboard > SQL Editor');
    console.log('3. Paste and run the SQL');
    console.log('4. The trigger will automatically link OAuth accounts to existing users');
    
    // Test if we can query the users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email, supabase_auth_user_id')
      .limit(1);
    
    if (error) {
      console.log('\n⚠️  Warning: Could not query users table:', error.message);
      console.log('   Make sure the migration has been run in Supabase SQL Editor');
    } else {
      console.log('\n✅ Successfully connected to database');
      console.log('   Users table is accessible');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runMigration();

