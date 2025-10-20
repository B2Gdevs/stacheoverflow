import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Use Supabase database URL if available, otherwise fall back to local PostgreSQL
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('SUPABASE_DATABASE_URL or POSTGRES_URL environment variable is not set');
}

export const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });
