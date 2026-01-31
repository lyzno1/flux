# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                # start all apps via turbo
pnpm dev:web            # web only (port 3001)
pnpm dev:server         # server only (port 3000)
pnpm build              # build all
pnpm check              # biome check --write
pnpm check-types        # typescript type-check all packages

pnpm db:push            # push drizzle schema to database
pnpm db:generate        # generate migration files
pnpm db:migrate         # run migrations
pnpm db:studio          # open drizzle studio
```

**Adding dependencies:** This monorepo uses pnpm catalog. Use `pnpm add -D <pkg> --save-catalog` in the target package directory — this automatically adds the version to `pnpm-workspace.yaml` catalog and writes `"catalog:"` in `package.json`.

## Architecture

Turborepo monorepo with two apps and seven shared packages. All packages use ESM (`"type": "module"`).

### Apps

- **web** — React 19 SPA with TanStack Router (file-based routing in `apps/web/src/routes/`) and TanStack Query. UI via shadcn/ui + TailwindCSS v4.
- **server** — Fastify HTTP server. Handles ORPC at `/rpc`, OpenAPI reference at `/api-reference`, and Better-Auth at `/api/auth/*`. Uses a custom `serverFactory` to route between ORPC and Fastify handlers.

### Packages (dependency order: bottom → top)

```
@flux/config    — shared tsconfig bases
@flux/utils     — runtime helpers (e.g. isClient detection)
@flux/env       — T3 Env validated environment variables (server.ts / web.ts)
@flux/db        — Drizzle ORM schema + PostgreSQL connection
@flux/auth      — Better-Auth config with Drizzle adapter
@flux/api       — ORPC router definitions, publicProcedure / protectedProcedure
@flux/store     — Zustand store factory with devtools (debug via ?debug=storeName)
```

### Key patterns

**ORPC end-to-end typing:** `@flux/api` defines `appRouter` in `packages/api/src/routers/index.ts`. The server mounts it via `RPCHandler`. The web client creates a typed `AppRouterClient` in `apps/web/src/utils/orpc.ts` and wraps it with `createTanstackQueryUtils` for React Query integration. Context is created from request headers in `packages/api/src/context.ts`.

**TanStack Router:** File-based routes under `apps/web/src/routes/`. The root route injects `orpc` and `queryClient` into router context via `RouterAppContext`. Route tree is auto-generated (`routeTree.gen.ts` — do not edit).

**Auth flow:** Better-Auth handles sessions. The ORPC context extracts the session from request headers. `protectedProcedure` middleware enforces authentication. Client uses `better-auth/react`'s `createAuthClient`.

**Environment variables:** Validated via `@flux/env` using T3 Env + Zod. Server env requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`. Web env uses `VITE_` prefixed vars.

## Code Style

- **Formatter/Linter:** Biome (not ESLint/Prettier). Tab indentation, double quotes. Run `pnpm check` to auto-fix.
- **Pre-commit hook:** `check-types` + `lint-staged` (biome check) via simple-git-hooks.
- **Key Biome rules:** No barrel files (`noBarrelFile`), no re-export all (`noReExportAll`), no `console.*` (warn), `noNonNullAssertion`, `useNodejsImportProtocol` for node builtins, sorted Tailwind classes (`useSortedClasses` with `cn`/`clsx`/`cva`).
- **Import conventions:** Use namespace imports for modules without a real default export. Write `import * as z from "zod"` (not `import z from "zod"` or `import { z } from "zod"`). For React, use named imports (`import { useState } from "react"`) and `import type * as React from "react"` when the `React` namespace type is needed.
