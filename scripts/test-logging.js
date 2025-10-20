#!/usr/bin/env node

import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function testLogging() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check API logs
    const apiLogsResult = await client.query('SELECT COUNT(*) as count FROM api_logs');
    console.log('\n📋 API Logs:');
    console.log('Total API logs:', apiLogsResult.rows[0].count);

    // Check Stripe logs
    const stripeLogsResult = await client.query('SELECT COUNT(*) as count FROM stripe_logs');
    console.log('\n💳 Stripe Logs:');
    console.log('Total Stripe logs:', stripeLogsResult.rows[0].count);

    // Show recent API logs
    const recentApiLogs = await client.query(`
      SELECT method, endpoint, response_status, timestamp 
      FROM api_logs 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);
    
    console.log('\n🕒 Recent API Logs:');
    recentApiLogs.rows.forEach(log => {
      console.log(`- ${log.method} ${log.endpoint} (${log.response_status}) - ${new Date(log.timestamp).toLocaleString()}`);
    });

    // Show recent Stripe logs
    const recentStripeLogs = await client.query(`
      SELECT request_type, success, timestamp 
      FROM stripe_logs 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);
    
    console.log('\n🕒 Recent Stripe Logs:');
    recentStripeLogs.rows.forEach(log => {
      console.log(`- ${log.request_type} (${log.success === 1 ? 'Success' : 'Failed'}) - ${new Date(log.timestamp).toLocaleString()}`);
    });

    // Check subscription plans with Stripe IDs
    const plansResult = await client.query(`
      SELECT name, stripe_product_id, stripe_price_id 
      FROM subscription_plans 
      ORDER BY created_at DESC
    `);
    
    console.log('\n📦 Subscription Plans:');
    plansResult.rows.forEach(plan => {
      console.log(`- ${plan.name}: Product ID: ${plan.stripe_product_id || 'None'}, Price ID: ${plan.stripe_price_id || 'None'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

testLogging();
