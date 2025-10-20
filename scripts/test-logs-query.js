#!/usr/bin/env node

import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function testLogsQuery() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Test the exact query from getLogsWithStripe
    const query = `
      SELECT 
        api_logs.id as api_id,
        api_logs.method,
        api_logs.endpoint,
        api_logs.response_status,
        api_logs.timestamp as api_timestamp,
        stripe_logs.id as stripe_id,
        stripe_logs.request_type,
        stripe_logs.success,
        stripe_logs.timestamp as stripe_timestamp
      FROM api_logs
      LEFT JOIN stripe_logs ON api_logs.id = stripe_logs.api_log_id
      ORDER BY api_logs.timestamp DESC
      LIMIT 10
    `;

    console.log('\n🔍 Testing logs query...');
    const result = await client.query(query);
    
    console.log(`Found ${result.rows.length} log entries:`);
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. API: ${row.method} ${row.endpoint} (${row.response_status}) - ${new Date(row.api_timestamp).toLocaleString()}`);
      if (row.stripe_id) {
        console.log(`   Stripe: ${row.request_type} (${row.success === 1 ? 'Success' : 'Failed'}) - ${new Date(row.stripe_timestamp).toLocaleString()}`);
      }
    });

    // Test individual table counts
    const apiCount = await client.query('SELECT COUNT(*) as count FROM api_logs');
    const stripeCount = await client.query('SELECT COUNT(*) as count FROM stripe_logs');
    
    console.log(`\n📊 Table counts:`);
    console.log(`API logs: ${apiCount.rows[0].count}`);
    console.log(`Stripe logs: ${stripeCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

testLogsQuery();
