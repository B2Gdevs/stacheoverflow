#!/usr/bin/env node

import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function checkLogs() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check API logs
    const apiLogsResult = await client.query('SELECT COUNT(*) as count FROM api_logs');
    console.log('\n📋 API Logs Count:', apiLogsResult.rows[0].count);

    if (apiLogsResult.rows[0].count > 0) {
      const recentApiLogs = await client.query(`
        SELECT method, endpoint, response_status, timestamp, request_payload, response_payload
        FROM api_logs 
        ORDER BY timestamp DESC 
        LIMIT 3
      `);
      
      console.log('\n🕒 Recent API Logs:');
      recentApiLogs.rows.forEach((log, i) => {
        console.log(`${i + 1}. ${log.method} ${log.endpoint} (${log.response_status})`);
        console.log(`   Time: ${new Date(log.timestamp).toLocaleString()}`);
        console.log(`   Request: ${JSON.stringify(log.request_payload, null, 2)}`);
        console.log(`   Response: ${JSON.stringify(log.response_payload, null, 2)}`);
        console.log('');
      });
    }

    // Check Stripe logs
    const stripeLogsResult = await client.query('SELECT COUNT(*) as count FROM stripe_logs');
    console.log('\n💳 Stripe Logs Count:', stripeLogsResult.rows[0].count);

    if (stripeLogsResult.rows[0].count > 0) {
      const recentStripeLogs = await client.query(`
        SELECT request_type, success, timestamp, request_payload, response_payload, error_message
        FROM stripe_logs 
        ORDER BY timestamp DESC 
        LIMIT 3
      `);
      
      console.log('\n🕒 Recent Stripe Logs:');
      recentStripeLogs.rows.forEach((log, i) => {
        console.log(`${i + 1}. ${log.request_type} (${log.success === 1 ? 'Success' : 'Failed'})`);
        console.log(`   Time: ${new Date(log.timestamp).toLocaleString()}`);
        if (log.error_message) {
          console.log(`   Error: ${log.error_message}`);
        }
        console.log(`   Request: ${JSON.stringify(log.request_payload, null, 2)}`);
        console.log(`   Response: ${JSON.stringify(log.response_payload, null, 2)}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkLogs();
