#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the migration file
    const migrationPath = join(process.cwd(), 'lib/db/migrations/0013_add_feature_flags.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📝 Running feature flags migration...');

    // Execute the migration
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully');
    console.log('✅ Feature flags table created');
    console.log('✅ Default feature flags inserted');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

