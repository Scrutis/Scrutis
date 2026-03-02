# Scrutis

Scrutis is an open-source cybersecurity platform focused on automated file and URL threat scanning. It is built as a TypeScript monorepo with a web application, background worker, and shared packages for database access and UI.

## What Scrutis Does

- Accepts file uploads and URL submissions for security analysis
- Processes scans asynchronously through a worker service
- Stores scan metadata and results for retrieval and reporting
- Supports multi-engine URL and file analysis workflows
- Integrates with S3-compatible object storage for file handling

## Architecture

Scrutis uses a monorepo structure with Turbo and pnpm workspaces:

```text
apps/
  web/       Next.js application (UI + API routes)
  worker/    Express/TypeScript worker for scan processing
packages/
  db/        Shared Drizzle ORM schema and database utilities
  ui/        Shared React UI components
  eslint-config/
  typescript-config/
```

High-level flow:

1. A user submits a file or URL from the web app.
2. Submission metadata is stored in the database.
3. The worker picks up pending scans and executes scanners.
4. Results are persisted and surfaced back through the web app.

## Tech Stack

- **Frontend/API**: Next.js, React, TypeScript
- **Worker**: Node.js, Express, TypeScript
- **Database**: Drizzle ORM (shared schema in `packages/db`)
- **Storage**: AWS S3 SDK integration
- **Monorepo Tooling**: pnpm workspaces, Turbo, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js `>= 20`
- pnpm `>= 10`
- A PostgreSQL database
- S3-compatible storage (for file upload and retrieval)

### Installation

```bash
pnpm install
```

### Environment Configuration

Create environment files for the apps you run:

- `apps/web/.env`
- `apps/worker/.env`

Minimum variables typically required:

- `DATABASE_URL`
- `S3_BUCKET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (or equivalent runtime credentials)

Optional worker integrations (depending on enabled scanners):

- `SAFE_BROWSING_API_KEY`
- `URLSCAN_API_KEY`
- `VIRUSTOTAL_API_KEY`
- `PHISHTANK_API_KEY`
- `CLAMAV_*`, `YARA_*` scanner settings

## Development

Run all apps in development mode from the repository root:

```bash
pnpm dev
```

Useful root scripts:

- `pnpm dev` - Run all workspace dev tasks via Turbo
- `pnpm build` - Build all workspaces
- `pnpm lint` - Run linting across workspaces
- `pnpm format` - Format repository source files

## Package-Level Scripts

Examples:

- Web app: `pnpm --filter web dev`
- Worker: `pnpm --filter worker dev`
- Database package: `pnpm --filter @scrutis/db db:generate`

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Contact

For questions or collaboration:

- `elmqiddem@gmail.com`
- `chanounih@gmail.com`
- `amellahmehdiog@gmail.com`
