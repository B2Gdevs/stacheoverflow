const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  // Check for required environment variable
  if (!process.env.SUPABASE_DATABASE_URL) {
    console.error('❌ SUPABASE_DATABASE_URL is not set in .env.local');
    console.log('Please make sure you have SUPABASE_DATABASE_URL in your .env.local file');
    process.exit(1);
  }

  console.log('🔍 Connecting to database...');
  console.log('Database URL format:', process.env.SUPABASE_DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: process.env.SUPABASE_DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read and execute the migration
    const migrationPath = path.join(__dirname, '../lib/db/migrations/0010_add_social_connections.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing migration: 0010_add_social_connections.sql');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully');

    // Verify the table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'social_connections'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: social_connections table exists');
      
      // Check columns
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'social_connections'
        ORDER BY ordinal_position
      `);
      console.log(`✅ Table has ${columns.rows.length} columns`);
    } else {
      console.log('⚠️  Warning: social_connections table not found after migration');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`Details: ${error.detail}`);
    }
    console.log('\n💡 If you see connection errors, please check:');
    console.log('   1. SUPABASE_DATABASE_URL is correct in .env.local');
    console.log('   2. Your database is accessible');
    console.log('   3. You can manually run the SQL from lib/db/migrations/0010_add_social_connections.sql');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

