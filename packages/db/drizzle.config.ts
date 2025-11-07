import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file in the current directory (packages/db)
dotenv.config({
  path: '.env',
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in packages/db/.env');
}

export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  // This tells Drizzle Kit where to find your schema
  out: './drizzle', 
});
