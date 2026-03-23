import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // safer for Supabase pooled connections
});

export const db = drizzle(client);
