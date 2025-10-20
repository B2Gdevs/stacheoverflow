#!/usr/bin/env node

import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check subscription_plans table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 subscription_plans table structure:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check if there are any data issues
    const dataResult = await client.query('SELECT * FROM subscription_plans LIMIT 1');
    if (dataResult.rows.length > 0) {
      console.log('\n📊 Sample data:');
      console.log(JSON.stringify(dataResult.rows[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkSchema();
