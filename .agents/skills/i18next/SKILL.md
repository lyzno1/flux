---
name: i18next
description: i18next internationalization patterns for the Flux project. Flat keys, type-safe namespaces, on-demand loading, Intl-based formatting, and i18next-cli toolchain. Use when adding translation keys, creating namespaces, using useTranslation, formatting numbers/dates/durations, working with pluralization, running i18n extraction/validation, or debugging CLI issues. Triggers on tasks involving i18n, translations, localization, language switching, locale files, or i18next-cli.
---

# i18next

Type-safe i18n with flat keys, on-demand namespace loading, Intl-based formatting, and i18next-cli for automated key management.

## Architecture

- **Shared Config**: `apps/web/src/i18n/config.ts` — `defaultNS`, `fallbackLng`, `keySeparator`, language list shared by runtime + CLI
- **Runtime Config**: `apps/web/src/i18n/index.ts` — i18next init, backend loader, language detector, custom formatters
- **CLI Config**: `apps/web/i18next.config.ts` — i18next-cli extraction and validation settings
- **Types**: `apps/web/src/i18n/i18next.d.ts` — module augmentation for type-safe `t()`; `defaultNS`/`keySeparator` inferred from shared config
- **Locales**: `apps/web/src/locales/{en-US,zh-CN}/{namespace}.json`
- **Loading**: `i18next-resources-to-backend` dynamic import. The `common` namespace is preloaded at init via `ns: ["common"]`. Route-scoped namespaces (e.g. `auth`) are preloaded via TanStack Router `loader` (e.g. `_auth.tsx`). Other namespaces are loaded on demand by `useTranslation("ns")` with `useSuspense: true` (caught by TanStack Router's per-route Suspense boundary from `defaultPendingComponent`)

```
apps/web/
├── i18next.config.ts   # CLI config (extraction, validation)
└── src/
    ├── i18n/
    │   ├── config.ts       # shared i18n constants (runtime + CLI + types)
    │   ├── index.ts        # runtime init + custom formatters
    │   └── i18next.d.ts    # type augmentation (update when adding namespace)
    └── locales/
        ├── en-US/          # source of truth for types
        │   ├── common.json # default namespace
        │   ├── auth.json
        │   ├── ai.json
        │   └── dify.json
        └── zh-CN/          # must have same keys as en-US (except plural variants)
```

## i18next-cli

Automated key extraction, unused key detection, and multi-language sync. See [references/cli.md](references/cli.md) for full configuration and command details.

### Commands

Run from `apps/web/`:

```bash
pnpm i18n          # extract keys from code, remove unused keys, sync languages
pnpm i18n:ci       # CI mode — fails if translation files need updating
pnpm i18n:status   # translation health report by namespace/language
pnpm i18n:sync     # sync secondary languages against primary (en-US)
pnpm i18n:lint     # detect hardcoded strings that should be translated
```

### CLI-Compatible Code Patterns

**CRITICAL — the CLI uses SWC static AST analysis.** It can only extract `t()` calls with **string literals**. Violating these rules causes keys to be misidentified or deleted.

```typescript
// ✅ CLI extracts correctly — string literal
t("nav.home")

// ❌ CLI CANNOT extract — variable
t(someVariable)

// ❌ CLI CANNOT trace namespace — t passed as function parameter
const helper = (t: TFunction) => t("key")
```

**Rules to keep CLI happy:**

1. **Always use string literals in `t()` calls** — never `t(variable)` or `t(computedKey)`
2. **Keep `t()` calls inside `useTranslation()` scope** — the CLI traces `useTranslation("ns")` to determine which namespace a key belongs to. If `t` is passed as a parameter to a utility function outside the component, the CLI loses namespace tracking and assigns keys to `common` (default)
3. **When a utility function needs translated strings, pass the strings not the `t` function:**

```typescript
// ❌ WRONG — CLI cannot trace t's namespace
const getLabel = (t: TFunction) => t("my.key");

// ✅ RIGHT — t() called inside component scope, plain strings passed out
const { t } = useTranslation("ai");
const label = getLabel({ myKey: t("my.key") });
```

## Key Naming Rules

**CRITICAL — keys are flat strings, NOT nested paths** (`keySeparator: false`).

```json
{ "nav.home": "Home", "nav.dashboard": "Dashboard" }
```

- Use `category.item` grouping within a namespace: `signIn.email`, `validation.passwordMin`
- Use camelCase: `emptyState`, `apiMessage`
- Plurals use `_one` / `_other` suffixes: `eventsCount_one`, `eventsCount_other`
- **Never prefix keys with namespace name** — `auth.json` keys must not start with `auth.`
- **Never use nested JSON** — `{ "nav": { "home": "..." } }` is wrong

## Adding a New Namespace

1. Create `locales/en-US/{ns}.json` and `locales/zh-CN/{ns}.json`
2. If the namespace is used in the root layout (outside route components, e.g. in `__root.tsx`, `Header`, `AuthBrandPanel`), add it to the `ns` array in `i18n/index.ts` for preloading. Route-level namespaces do NOT need this — `useSuspense: true` + TanStack Router's per-route Suspense handles them automatically.
3. Add import + resource entry in `i18next.d.ts`:

```typescript
import type settings from "../locales/en-US/settings.json";
// inside CustomTypeOptions.resources:
settings: typeof settings;
```

4. Run `pnpm i18n` to validate extraction

## Adding Keys to Existing Namespace

1. Add key to `locales/en-US/{ns}.json` (source of truth)
2. Add key to `locales/zh-CN/{ns}.json`
3. JSON keys must be alphabetically sorted (enforced by Biome `useSortedKeys`)
4. JSON must use tab indentation (enforced by Biome)
5. Run `pnpm i18n:ci` to verify — or just write `t("newKey")` in code and run `pnpm i18n` to auto-generate

## Usage Patterns

```typescript
// React component — namespace via hook
const { t } = useTranslation("auth");
t("signIn.email");

// Default namespace (common)
const { t } = useTranslation();
t("nav.home");

// With interpolation
t("welcome", { name: "Alice" }); // "Welcome Alice"

// With count (auto plural resolution)
t("items", { count: 5 }); // selects _one or _other based on CLDR
```

## Pluralization

English needs `_one` + `_other`. Chinese only needs `_other` (CLDR rules).

```json
// en-US
{ "items_one": "{{count}} item", "items_other": "{{count}} items" }
// zh-CN
{ "items_other": "{{count}} 个项目" }
```

Call with base key — i18next resolves the suffix automatically:

```typescript
t("items", { count: 5 });
```

## Formatting (built-in Intl API)

```json
{
  "count": "{{val, number}}",
  "price": "{{val, currency(USD)}}",
  "date": "{{val, datetime}}",
  "elapsed": "{{val, duration}}"
}
```

Custom `duration` formatter in `index.ts` — accepts milliseconds, outputs locale-aware seconds.

## Rules

1. **Always use string literal `t()` calls** — CLI cannot extract dynamic keys
2. **Keep `t()` inside `useTranslation()` scope** — pass translated strings to helpers, not the `t` function
3. **Never prefix keys with namespace name** — namespace is already the file
4. **Keep JSON keys sorted alphabetically** — `pnpm check` enforces this
5. **zh-CN must match en-US keys** — except `_one` (Chinese doesn't need it)
6. **Always pass raw values to formatters** — let i18next handle conversion
7. **Run `pnpm i18n:ci` before committing** — or let CI catch it
