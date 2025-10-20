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
    console.log('Connected to database');

    // Read the migration file
    const migrationPath = join(process.cwd(), 'lib/db/migrations/0004_add_logging.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await client.query(migrationSQL);
    console.log('✅ Logging migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
