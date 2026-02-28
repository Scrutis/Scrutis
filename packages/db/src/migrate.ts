import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as schema from './schema.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Load environment variables
dotenv.config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in packages/db/.env');
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read the latest migration file
    const migrationFile = readFileSync(
      join(__dirname, '../drizzle/0000_good_azazel.sql'),
      'utf-8'
    );
    
    // Split by statement breakpoints and execute each statement
    const statements = migrationFile
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
        console.log('✅ Executed migration statement');
      }
    }
    
    // Check if we need to add the missing tables (scan, scan_result, project)
    // These might not be in the migration file yet
    const checkTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('scan', 'scan_result', 'project')
    `;
    
    const existingTables = checkTables.map((row: any) => row.table_name);
    
    if (!existingTables.includes('project')) {
      console.log('📦 Creating project table...');
      await sql`
        CREATE TABLE "project" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "description" text,
          "user_id" text NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `;
      await sql`
        ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
      `;
    }
    
    if (!existingTables.includes('scan')) {
      console.log('📦 Creating scan table...');
      await sql`
        CREATE TABLE "scan" (
          "id" text PRIMARY KEY NOT NULL,
          "project_id" text,
          "user_id" text NOT NULL,
          "type" text NOT NULL,
          "target" text NOT NULL,
          "status" text NOT NULL DEFAULT 'pending',
          "severity" text,
          "result" text,
          "file_hash" text,
          "file_size" integer,
          "metadata" jsonb,
          "error_message" text,
          "completed_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `;
      await sql`
        ALTER TABLE "scan" ADD CONSTRAINT "scan_project_id_project_id_fk" 
        FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;
      `;
      await sql`
        ALTER TABLE "scan" ADD CONSTRAINT "scan_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
      `;
    }
    
    if (!existingTables.includes('scan_result')) {
      console.log('📦 Creating scan_result table...');
      await sql`
        CREATE TABLE "scan_result" (
          "id" text PRIMARY KEY NOT NULL,
          "scan_id" text NOT NULL,
          "engine" text NOT NULL,
          "detected" boolean DEFAULT false NOT NULL,
          "threat_name" text,
          "severity" text,
          "details" jsonb,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `;
      await sql`
        ALTER TABLE "scan_result" ADD CONSTRAINT "scan_result_scan_id_scan_id_fk" 
        FOREIGN KEY ("scan_id") REFERENCES "public"."scan"("id") ON DELETE cascade ON UPDATE no action;
      `;
    }
    
    console.log('✅ Database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
