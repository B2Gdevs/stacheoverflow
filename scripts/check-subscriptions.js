#!/usr/bin/env node

import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function checkSubscriptions() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check subscription plans
    const plansResult = await client.query('SELECT * FROM subscription_plans ORDER BY price');
    console.log('\n📋 Subscription Plans:');
    console.log('Found', plansResult.rows.length, 'plans');
    
    plansResult.rows.forEach(plan => {
      console.log(`- ${plan.name}: $${(plan.price / 100).toFixed(2)}/month, ${plan.monthly_downloads} downloads, Active: ${plan.is_active === 1 ? 'Yes' : 'No'}`);
    });

    // Check user subscriptions
    const subsResult = await client.query('SELECT * FROM user_subscriptions');
    console.log('\n👤 User Subscriptions:');
    console.log('Found', subsResult.rows.length, 'subscriptions');
    
    subsResult.rows.forEach(sub => {
      console.log(`- User ${sub.user_id}: Plan ${sub.plan_id}, Status: ${sub.status}, Downloads used: ${sub.downloads_used}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkSubscriptions();
