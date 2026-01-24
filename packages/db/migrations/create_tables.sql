-- Migration to create scan, scan_result, and project tables
-- Run this SQL file against your database to create the missing tables

-- Create project table
CREATE TABLE IF NOT EXISTS "project" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "user_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create scan table
CREATE TABLE IF NOT EXISTS "scan" (
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

-- Create scan_result table
CREATE TABLE IF NOT EXISTS "scan_result" (
  "id" text PRIMARY KEY NOT NULL,
  "scan_id" text NOT NULL,
  "engine" text NOT NULL,
  "detected" boolean DEFAULT false NOT NULL,
  "threat_name" text,
  "severity" text,
  "details" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "project" 
    ADD CONSTRAINT "project_user_id_user_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") 
    ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'scan_project_id_project_id_fk'
  ) THEN
    ALTER TABLE "scan" 
    ADD CONSTRAINT "scan_project_id_project_id_fk" 
    FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") 
    ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'scan_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "scan" 
    ADD CONSTRAINT "scan_user_id_user_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") 
    ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'scan_result_scan_id_scan_id_fk'
  ) THEN
    ALTER TABLE "scan_result" 
    ADD CONSTRAINT "scan_result_scan_id_scan_id_fk" 
    FOREIGN KEY ("scan_id") REFERENCES "public"."scan"("id") 
    ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
