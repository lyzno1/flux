# Development Setup Guide

This guide walks you through setting up the Flux monorepo for local development after cloning.

## Prerequisites

| Tool       | Version    | Notes                          |
| ---------- | ---------- | ------------------------------ |
| Node.js    | `24.13.0`  | See `.nvmrc`; use nvm or fnm   |
| pnpm       | `10.28.2+` | Enforced via `packageManager`  |
| PostgreSQL | 15+        | Any recent version works       |

### Install Node.js

```bash
# Using nvm
nvm install
nvm use

# Or using fnm
fnm install
fnm use
```

### Install pnpm

```bash
corepack enable
corepack install
```

### Install PostgreSQL

**macOS (Homebrew):**

```bash
brew install postgresql@17
brew services start postgresql@17
```

**Linux (Debian/Ubuntu):**

```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

Create the database:

```bash
createdb flux
```

## Step 1 — Install Dependencies

```bash
pnpm install
```

This also triggers `postinstall` hooks.

## Step 2 — Configure Environment Variables

Copy the example files:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

### Server (`apps/server/.env`)

| Variable              | Required | Description                                   |
| --------------------- | -------- | --------------------------------------------- |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string                   |
| `BETTER_AUTH_SECRET`  | Yes      | Random string, **at least 32 characters**      |
| `BETTER_AUTH_URL`     | Yes      | Server URL (default `http://localhost:3000`)    |
| `CORS_ORIGIN`         | Yes      | Web app URL (default `http://localhost:3001`)   |
| `DB_POOL_MAX`         | No       | Max pool connections (default `10`)             |
| `DB_POOL_IDLE_TIMEOUT`| No       | Pool idle timeout in ms (default `30000`)       |

Example:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/flux
BETTER_AUTH_SECRET=replace-with-a-random-string-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
```

Generate a secret:

```bash
openssl rand -base64 32
```

### Web (`apps/web/.env`)

| Variable          | Required | Description                        |
| ----------------- | -------- | ---------------------------------- |
| `VITE_SERVER_URL` | Yes      | Server URL (`http://localhost:3000`) |

The defaults in `.env.example` work out of the box for local development.

## Step 3 — Push Database Schema

For development, use `db:push` to sync the Drizzle schema directly to your database (no migration files needed):

```bash
pnpm db:push
```

This creates all required tables (`user`, `session`, `account`, `verification`).

> For production deployments, use migrations instead:
>
> ```bash
> pnpm db:generate   # generate migration files
> pnpm db:migrate    # apply migrations
> ```

## Step 4 — Set Up Git Hooks

```bash
pnpm prepare
```

This installs `simple-git-hooks`, which runs Biome lint and TypeScript type checking on pre-commit.

## Step 5 — Start Development Servers

Start all services:

```bash
pnpm dev
```

Or start individually:

```bash
pnpm dev:server   # Fastify API server  → http://localhost:3000
pnpm dev:web      # Vite dev server     → http://localhost:3001
```

## Verifying the Setup

| Check                 | URL / Command                        | Expected Result          |
| --------------------- | ------------------------------------ | ------------------------ |
| Server health         | `http://localhost:3000`              | Returns `OK`             |
| API reference         | `http://localhost:3000/api-reference`| OpenAPI docs page        |
| Web app               | `http://localhost:3001`              | React SPA loads          |
| Database browser      | `pnpm db:studio`                    | Drizzle Studio opens     |

## Available Scripts

| Script             | Description                                 |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Start web + server via Turbo                |
| `pnpm dev:web`     | Start web app only (port 3001)              |
| `pnpm dev:server`  | Start API server only (port 3000)           |
| `pnpm build`       | Build all apps and packages                 |
| `pnpm check`       | Run Biome linter/formatter with auto-fix    |
| `pnpm check-types` | TypeScript type-check across all packages   |
| `pnpm test`        | Run Vitest tests                            |
| `pnpm db:push`     | Push Drizzle schema to database             |
| `pnpm db:generate` | Generate Drizzle migration files            |
| `pnpm db:migrate`  | Run database migrations                     |
| `pnpm db:studio`   | Open Drizzle Studio (database GUI)          |

## Adding Dependencies

This monorepo uses pnpm catalogs for version management. Always use `--save-catalog` when adding packages:

```bash
cd apps/web
pnpm add <package> --save-catalog

cd packages/db
pnpm add -D <package> --save-catalog
```

This registers the version in `pnpm-workspace.yaml` and writes `"catalog:"` as the version in `package.json`.

## Troubleshooting

**`pnpm install` fails with engine mismatch**
Check your Node.js version matches `.nvmrc` (`24.13.0`).

**Server crashes on startup with env validation error**
Ensure all required environment variables in `apps/server/.env` are set. `BETTER_AUTH_SECRET` must be at least 32 characters and `BETTER_AUTH_URL` / `CORS_ORIGIN` must be valid URLs.

**Database connection refused**
Verify PostgreSQL is running and `DATABASE_URL` is correct. Test with:
```bash
psql postgresql://your_user:your_password@localhost:5432/flux
```

**`db:push` fails**
The Drizzle config reads `.env` from `apps/server/.env`. Make sure that file exists and `DATABASE_URL` is set correctly.

**Port already in use**
Default ports are 3000 (server) and 3001 (web). Kill any conflicting processes or change ports in the respective config files.
