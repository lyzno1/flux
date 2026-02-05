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

pnpm db:push            # push drizzle schema to database (dev only)
pnpm db:generate -- --name=xxx_xxx  # generate migration files (always use --name)
pnpm db:migrate         # run migrations
pnpm db:studio          # open drizzle studio
```

**Adding dependencies:** This monorepo uses pnpm named catalogs (`dev`, `frontend`, `prod`). Use `--save-catalog-name=<name>` to add to the correct catalog group:

```bash
pnpm add -D <pkg> --save-catalog-name=dev        # dev tools (biome, typescript, vite, vitest…)
pnpm add <pkg> --save-catalog-name=prod           # production deps (orpc, drizzle, zod, better-auth…)
pnpm add <pkg> --save-catalog-name=frontend       # frontend libs (react, tanstack, zustand…)
```

Run in the target package directory. This adds the version to `pnpm-workspace.yaml` catalogs and writes `"catalog:<name>"` in `package.json`.

## Architecture

Turborepo monorepo with two apps and six shared packages. All packages use ESM (`"type": "module"`).

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
```

### Key patterns

**ORPC end-to-end typing:** `@flux/api` defines `appRouter` in `packages/api/src/routers/index.ts`. The server mounts it via `RPCHandler`. The web client creates a typed `ContractRouterClient` in `apps/web/src/utils/orpc.ts` and wraps it with `createTanstackQueryUtils` for React Query integration. Context is created from request headers in `packages/api/src/context.ts`.

**TanStack Router:** File-based routes under `apps/web/src/routes/`. The root route injects `orpc` and `queryClient` into router context via `RouterAppContext`. Route tree is auto-generated (`routeTree.gen.ts` — do not edit). When navigating between pages that share search params (e.g. auth pages sharing `redirect`), use `<Link search={true}>` to preserve all current search params, or `navigate({ search: (prev) => ({ ...prev, newKey }) })` to merge new params. Never omit the `search` prop on cross-page `<Link>` — the router defaults to `{}` which drops existing params and lets `validateSearch` defaults overwrite them.

**Auth flow:** Better-Auth handles sessions. The ORPC context extracts the session from request headers. `protectedProcedure` middleware enforces authentication. Client uses `better-auth/react`'s `createAuthClient`.

**Environment variables:** Validated via `@flux/env` using T3 Env + Zod. Server env requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`. Web env uses `VITE_` prefixed vars. When adding a new environment variable, always update both `packages/env/src/server.ts` (or `web.ts`) and the corresponding `.env.example` file (`apps/server/.env.example` or `apps/web/.env.example`).

**ORPC mutations:** When implementing mutations, place cache invalidation in the mutation's `onSuccess` callback using ORPC's `.key()` helper:
```typescript
const mutation = useMutation(orpc.resource.create.mutationOptions({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: orpc.resource.key() })
  }
}))
```
Use `.key()` for partial matching (invalidate all), `.key({ input: {...} })` for specific entries.

## Code Style

- **Formatter/Linter:** Biome (not ESLint/Prettier). Tab indentation, double quotes. Run `pnpm check` to auto-fix.
- **Pre-commit hook:** `check-types` + `lint-staged` (biome check) via simple-git-hooks.
- **Key Biome rules:** No barrel files (`noBarrelFile`), no re-export all (`noReExportAll`), no `console.*` (error, allows `console.error`/`console.warn`), `noNonNullAssertion`, `useNodejsImportProtocol` for node builtins, sorted Tailwind classes (`useSortedClasses` with `cn`/`clsx`/`cva`).
- **Export conventions:** Prefer named exports (`export function Foo`) over default exports (`export default function Foo`). This enables consistent import names and better refactoring support.
- **Import conventions:** Use namespace imports for modules without a real default export. Write `import * as z from "zod"` (not `import z from "zod"` or `import { z } from "zod"`). For React, use named imports (`import { useState } from "react"`) and `import type * as React from "react"` when the `React` namespace type is needed.
- **Design system:** When modifying design tokens (`apps/web/src/index.css`), component border-radius, color tokens, spacing, or any visual design pattern, also update the `flux-design-system` skill at `.agents/skills/flux-design-system/` to keep the specification in sync.
