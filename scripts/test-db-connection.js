#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing database connection...');

if (!process.env.SUPABASE_DATABASE_URL) {
  console.error('❌ SUPABASE_DATABASE_URL is not set');
  process.exit(1);
}

console.log('Database URL:', process.env.SUPABASE_DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

async function testConnection() {
  let client;
  try {
    console.log('\n🧪 Attempting connection...');
    client = postgres(process.env.SUPABASE_DATABASE_URL);
    
    // Test basic query
    const result = await client`SELECT 1 as test`;
    console.log('✅ Connection successful!');
    console.log('Test query result:', result[0]);
    
    // Test users table
    const users = await client`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Users table accessible!');
    console.log('Users count:', users[0].count);
    
    // Test admin user
    const admin = await client`SELECT id, email, role FROM users WHERE email = 'stacho@example.com'`;
    if (admin.length > 0) {
      console.log('✅ Admin user found:', admin[0]);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

testConnection();