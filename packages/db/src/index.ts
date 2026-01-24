import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as schema from './schema';

// Try to load environment variables from multiple possible locations
// This ensures DATABASE_URL is available regardless of where the package is imported from
if (!process.env.DATABASE_URL) {
  // Try current working directory first (most common case)
  dotenv.config();
  
  // Try db package's .env
  try {
    const dbPackageEnv = resolve(process.cwd(), 'packages/db/.env');
    dotenv.config({ path: dbPackageEnv, override: false });
  } catch (e) {
    // Ignore if file doesn't exist
  }
  
  // Try worker's .env
  try {
    const workerEnv = resolve(process.cwd(), 'apps/worker/.env');
    dotenv.config({ path: workerEnv, override: false });
  } catch (e) {
    // Ignore if file doesn't exist
  }
  
  // Try web's .env
  try {
    const webEnv = resolve(process.cwd(), 'apps/web/.env');
    dotenv.config({ path: webEnv, override: false });
  } catch (e) {
    // Ignore if file doesn't exist
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Please set it in your .env file or environment variables.\n' +
    'Expected locations: packages/db/.env, apps/worker/.env, or apps/web/.env'
  );
}

export const db = drizzle(databaseUrl, { schema });

export * from './schema';
