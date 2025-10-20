#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabaseDatabase() {
  try {
    console.log('🚀 Setting up Supabase database...');
    console.log('📋 Note: You need to create these tables manually in your Supabase dashboard');
    console.log('Go to: https://supabase.com/dashboard/project/[your-project]/editor');
    console.log('\n📝 SQL to run in Supabase SQL Editor:');
    
    const sqlScript = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_product_id VARCHAR(255),
  plan_name VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  team_id INTEGER REFERENCES teams(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  invited_by INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Beats table
CREATE TABLE IF NOT EXISTS beats (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  price INTEGER NOT NULL,
  duration INTEGER,
  bpm INTEGER,
  key VARCHAR(10),
  description TEXT,
  audio_file_mp3 TEXT,
  audio_file_wav TEXT,
  audio_file_stems TEXT,
  image_file TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  monthly_downloads INTEGER NOT NULL,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  downloads_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  beat_id INTEGER REFERENCES beats(id),
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  beat_id INTEGER REFERENCES beats(id),
  file_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(36),
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_payload TEXT,
  response_status INTEGER,
  response_payload TEXT,
  duration INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Stripe logs table
CREATE TABLE IF NOT EXISTS stripe_logs (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(36),
  api_log_id INTEGER REFERENCES api_logs(id),
  stripe_request_id VARCHAR(100),
  stripe_event_type VARCHAR(50),
  stripe_object_type VARCHAR(50),
  stripe_object_id VARCHAR(100),
  request_type VARCHAR(50) NOT NULL,
  request_payload TEXT,
  response_payload TEXT,
  success INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_logs_event_id ON api_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_event_id ON stripe_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_timestamp ON stripe_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_beats_created_at ON beats(created_at DESC);

-- Create admin user
INSERT INTO users (email, password_hash, name, role) 
VALUES ('stacho@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
`;

    console.log(sqlScript);
    console.log('\n📋 After running the SQL above, test the connection:');
    
    // Test the connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      console.log('Make sure you have created the tables in Supabase first.');
    } else {
      console.log('✅ Connection test successful!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupSupabaseDatabase();
