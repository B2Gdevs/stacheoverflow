#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Drizzle database connection...');
console.log('SUPABASE_DATABASE_URL:', process.env.SUPABASE_DATABASE_URL ? '✅ Set' : '❌ Missing');

if (!process.env.SUPABASE_DATABASE_URL) {
  console.error('❌ SUPABASE_DATABASE_URL is not set');
  process.exit(1);
}

async function testDrizzleConnection() {
  try {
    console.log('\n🧪 Testing Drizzle connection...');
    
    const client = postgres(process.env.SUPABASE_DATABASE_URL);
    const db = drizzle(client);

    // Test basic query
    const result = await client`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Drizzle connection successful!');
    console.log('Users count:', result[0].count);

    // Test if admin user exists
    const adminResult = await client`SELECT id, email, role FROM users WHERE email = 'stacho@example.com'`;
    if (adminResult.length > 0) {
      console.log('✅ Admin user found:', adminResult[0]);
    } else {
      console.log('❌ Admin user not found');
    }

    await client.end();
    
  } catch (error) {
    console.error('❌ Drizzle connection failed:', error.message);
  }
}

testDrizzleConnection();
