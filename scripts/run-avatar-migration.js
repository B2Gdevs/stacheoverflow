const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  // Check for required environment variable
  const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    console.error('❌ SUPABASE_DATABASE_URL or POSTGRES_URL is not set in .env.local');
    process.exit(1);
  }

  console.log('🔍 Connecting to database...');

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read and execute the migration
    const migrationPath = path.join(__dirname, '../lib/db/migrations/0014_add_avatar_url.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing migration: 0014_add_avatar_url.sql');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully');

    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'avatar_url'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: avatar_url column exists in users table');
      console.log('   Column type:', result.rows[0].data_type);
    } else {
      console.warn('⚠️  Warning: Could not verify avatar_url column exists');
    }

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Column already exists, skipping migration');
    } else {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

runMigration();

