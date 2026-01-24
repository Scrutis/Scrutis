# @scrutis/db

Shared package for database schema and migrations.

## Setup

1. Create a `.env` file in this directory with your database connection string:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Database Migrations

### Option 1: Using Drizzle Kit Push (Recommended for Development)

This will sync your schema directly to the database:
```bash
pnpm db:push
```

### Option 2: Run SQL Migration Manually

If you have network issues or prefer to run migrations manually:

1. Connect to your PostgreSQL database using your preferred client (psql, pgAdmin, etc.)
2. Run the SQL file:
```bash
psql $DATABASE_URL -f migrations/create_tables.sql
```

Or copy and paste the contents of `migrations/create_tables.sql` into your database client.

### Option 3: Generate and Run Migrations

Generate a new migration:
```bash
pnpm db:generate
```

Then run the migration:
```bash
pnpm db:migrate
```

## Available Scripts

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:push` - Push schema changes directly to database (development)
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:run-migrations` - Run custom migration script

## Schema

The schema includes:
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens
- `project` - User projects for organizing scans
- `scan` - File and URL scans
- `scan_result` - Detailed results from scanning engines
