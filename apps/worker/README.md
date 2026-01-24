# Scrutis Worker API

The worker API is responsible for processing scans (file and URL scanning) in the background.

## Features

- **Automatic Polling**: Continuously polls the database for pending scans
- **Parallel Processing**: Can process multiple scans concurrently
- **REST API**: Provides endpoints to manually trigger scan processing
- **Error Handling**: Gracefully handles failures and marks scans as failed

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables:
- `DATABASE_URL`: PostgreSQL connection string (shared with web app)
- `PORT`: Worker API port (default: 3001)
- `WORKER_POLL_INTERVAL`: Polling interval in ms (default: 5000)
- `WORKER_BATCH_SIZE`: Max scans to process at once (default: 5)

## Development

```bash
pnpm dev
```

The worker will:
- Start the Express API server on port 3001
- Begin polling for pending scans every 5 seconds
- Process scans automatically as they are created

## Production

```bash
pnpm build
pnpm start
```

## API Endpoints

### `GET /health`
Health check endpoint.

### `POST /api/scans/process/:id`
Manually trigger processing of a specific scan.

### `GET /api/scans/status/:id`
Get the current status of a scan.

## Architecture

The worker uses a polling mechanism to check for pending scans. When a scan is created in the web app:

1. Scan is inserted into database with status `pending`
2. Worker polls database every 5 seconds
3. Worker picks up pending scans and processes them
4. Scan status is updated to `scanning`, then `completed` or `failed`
5. Results are stored in the `scan_result` table

## Future Enhancements

- Integration with actual scanning engines (ClamAV, VirusTotal, etc.)
- Message queue support (RabbitMQ, Redis, etc.)
- WebSocket updates for real-time status
- Rate limiting and throttling
- Scan result caching
- Distributed worker support
