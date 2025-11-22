const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read and execute the migration
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../lib/db/migrations/0001_add_tags_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();