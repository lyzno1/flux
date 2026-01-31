---
name: i18next
description: i18next internationalization patterns for the Flux project. Flat keys, type-safe namespaces, on-demand loading, and Intl-based formatting. Use when adding translation keys, creating namespaces, using useTranslation, formatting numbers/dates/durations, or working with pluralization. Triggers on tasks involving i18n, translations, localization, language switching, or locale files.
---

# i18next

Type-safe i18n with flat keys, on-demand namespace loading, and Intl-based formatting.

## Architecture

- **Config**: `apps/web/src/i18n/index.ts` — i18next init, language config, custom formatters
- **Types**: `apps/web/src/i18n/i18next.d.ts` — module augmentation for type-safe `t()`
- **Locales**: `apps/web/src/locales/{en-US,zh-CN}/{namespace}.json`
- **Loading**: `i18next-resources-to-backend` dynamic import, zero upfront cost (`ns: []`)
- **Detection**: browser navigator → localStorage (`i18nextLng`)

```
apps/web/src/
├── i18n/
│   ├── index.ts        # config + custom formatters
│   └── i18next.d.ts    # type augmentation (update when adding namespace)
└── locales/
    ├── en-US/          # source of truth for types
    │   ├── common.json # default namespace
    │   ├── auth.json
    │   ├── dashboard.json
    │   └── dify.json
    └── zh-CN/          # must have same keys as en-US (except plural variants)
```

## Key Naming Rules

**CRITICAL — keys are flat strings, NOT nested paths** (`keySeparator: false`).

```json
{ "nav.home": "Home", "nav.dashboard": "Dashboard" }
```

### Naming Conventions

- Use `category.item` grouping within a namespace: `signIn.email`, `validation.passwordMin`
- Use camelCase: `emptyState`, `apiMessage`
- Plurals use `_one` / `_other` suffixes: `eventsCount_one`, `eventsCount_other`

### Anti-patterns

```jsonc
// WRONG — key starts with namespace filename
// In common.json:
{ "common.language.toggle": "..." }

// RIGHT — namespace is already "common", no prefix needed
{ "language.toggle": "..." }
```

```jsonc
// WRONG — nested JSON structure
{ "nav": { "home": "Home" } }

// RIGHT — flat keys
{ "nav.home": "Home" }
```

## Adding a New Namespace

Three files to update:

1. Create `locales/en-US/{ns}.json` and `locales/zh-CN/{ns}.json`
2. Add import + resource entry in `i18next.d.ts`:

```typescript
import type settings from "../locales/en-US/settings.json";

// inside CustomTypeOptions.resources:
settings: typeof settings;
```

No changes needed to `index.ts` — dynamic imports handle it automatically.

## Adding Keys to Existing Namespace

1. Add key to `locales/en-US/{ns}.json` (source of truth)
2. Add key to `locales/zh-CN/{ns}.json`
3. JSON keys must be alphabetically sorted (enforced by Biome `useSortedKeys`)
4. TypeScript types update automatically from JSON

## Usage Patterns

```typescript
// React component — namespace via hook
const { t } = useTranslation("auth");
t("signIn.email");

// Default namespace (common)
const { t } = useTranslation();
t("nav.home");

// Non-React code — direct import
import i18n from "i18next";
i18n.t("error.generic", { message: err.message });
```

## Formatting (built-in Intl API)

i18next 25.x has built-in formatters — use them in translation strings:

```json
{
  "count": "{{val, number}}",
  "price": "{{val, currency(USD)}}",
  "date": "{{val, datetime}}",
  "ago": "{{val, relativetime}}",
  "elapsed": "{{val, duration}}"
}
```

Custom `duration` formatter registered in `index.ts` — accepts milliseconds, outputs locale-aware seconds (`"1.23 sec"` / `"1.23秒"`).

## Pluralization

English needs `_one` + `_other`. Chinese only needs `_other` (CLDR rules).

```json
// en-US
{ "items_one": "{{count}} item", "items_other": "{{count}} items" }
// zh-CN
{ "items_other": "{{count}} 个项目" }
```

```typescript
t("items", { count: 5 }); // call with base key, i18next resolves suffix
```

## Rules

1. **Never prefix keys with namespace name** — `auth.json` keys must not start with `auth.`
2. **Keep JSON keys sorted alphabetically** — `pnpm check` enforces this
3. **zh-CN must match en-US keys** — except plural `_one` (Chinese doesn't need it)
4. **Always pass raw values to formatters** — let i18next handle conversion, not the component
5. **Use `useTranslation("ns")` in React** — use direct `i18n.t()` only outside React
