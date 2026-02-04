# i18next-cli Reference

## Overview

i18next-cli (SWC-powered) handles key extraction, unused key removal, multi-language sync, type generation, and hardcoded string detection. Config: `apps/web/i18next.config.ts`.

## Configuration

```typescript
import { defineConfig } from "i18next-cli";

export default defineConfig({
  locales: ["en-US", "zh-CN"],
  extract: {
    input: ["src/**/*.{ts,tsx}"],
    output: "src/locales/{{language}}/{{namespace}}.json",
    ignore: ["src/**/*.test.*", "src/**/*.d.ts"],
    defaultNS: "common",
    keySeparator: false,       // flat keys — "nav.home" not { nav: { home } }
    functions: ["t", "*.t"],
    useTranslationNames: ["useTranslation"],
    removeUnusedKeys: true,    // delete keys not found in source code
    primaryLanguage: "en-US",
    defaultValue: "",          // new keys get empty string
    sort: true,                // match Biome useSortedKeys
    indentation: "\t",         // match Biome tab indentation
  },
});
```

### Key Configuration Options

| Option | Value | Purpose |
|--------|-------|---------|
| `keySeparator` | `false` | Flat keys — dots are literal, not nesting |
| `removeUnusedKeys` | `true` | Auto-delete keys no longer referenced in code |
| `sort` | `true` | Alphabetical key order (matches Biome rule) |
| `indentation` | `"\t"` | Tab indentation (matches Biome formatter) |
| `defaultValue` | `""` | New keys in secondary languages get empty string |
| `primaryLanguage` | `"en-US"` | Source of truth language |

### Additional Options (not currently used)

| Option | Description |
|--------|-------------|
| `preservePatterns` | `["pattern.*"]` — protect dynamic keys from deletion. Use only for truly runtime-dynamic keys like `` t(`role.${var}`) `` |
| `disablePlurals` | `true` — disable automatic `_one`/`_other` suffix generation |
| `transComponents` | `["Trans"]` — add if using `<Trans>` component |
| `outputFormat` | `"ts"` — output TypeScript files instead of JSON |
| `mergeNamespaces` | `true` — combine all namespaces into one file per language |

## Commands

```bash
pnpm i18n                # extract + remove unused + sync languages
pnpm i18n:ci             # same but fails (exit 1) if any file changes
pnpm i18n:status         # translation health dashboard
pnpm i18n:status zh-CN   # per-key status for a specific locale
pnpm i18n:sync           # sync secondary languages only (no extraction)
pnpm i18n:lint           # find hardcoded strings in JSX
```

### CI Integration

`.github/workflows/ci.yml` runs `pnpm --filter web i18n:ci` which fails if:
- Code has `t("newKey")` but JSON doesn't have it
- JSON has a key but no code references it
- Secondary language is missing keys from primary

## How the CLI Resolves Namespaces

The CLI determines namespace by **tracing `t` back to `useTranslation()`**:

```typescript
const { t } = useTranslation("ai");  // CLI knows: t → "ai" namespace
t("reasoning.thinking");               // → extracted to ai.json ✅
```

### Namespace Resolution Failures

The CLI **loses namespace tracking** when `t` crosses function boundaries:

```typescript
// ❌ helper is outside useTranslation scope — CLI assigns to "common"
const helper = (t: TFunction) => t("reasoning.thinking");

// Inside component:
const { t } = useTranslation("ai");
helper(t); // CLI doesn't trace this — key goes to common.json!
```

**Fix**: call `t()` inside the component, pass strings out:

```typescript
const { t } = useTranslation("ai");
const thinking = t("reasoning.thinking"); // ✅ CLI traces correctly
helper(thinking);
```

### Comment-Based Extraction Limitation

`// t('key', { ns: 'ai' })` comments DO add the key to `ai` namespace, but if the actual `t("key")` call also exists in an unscoped function, the key appears in **BOTH** namespaces. Comments don't override code-based extraction — they add to it.

## Dynamic Keys

The CLI cannot extract keys from variables or template literals:

```typescript
t(variable)           // ❌ not extractable
t(`prefix.${id}`)     // ❌ not extractable
```

**Solutions (in order of preference):**

1. **Refactor to static calls** — move `t()` into component scope with string literals
2. **`preservePatterns`** — last resort for truly runtime-dynamic keys:

```typescript
// i18next.config.ts
extract: {
  preservePatterns: ["role.*.permission"],
}
```

This prevents deletion of matching keys but does NOT extract new ones — you must manually add them to JSON.

## Pluralization and the CLI

When code uses `t("key", { count })`, the CLI auto-generates CLDR plural suffixes:

| Language | Generated keys |
|----------|---------------|
| en-US | `key_one`, `key_other` |
| zh-CN | `key_other` (Chinese has no singular) |

**JSON must use these suffixes.** A plain `"key": "..."` without `_one`/`_other` will be treated as unused and deleted.

## Troubleshooting

### Key deleted after running `pnpm i18n`

1. Check if `t()` uses a variable instead of string literal
2. Check if `t()` is called outside `useTranslation()` scope
3. If truly dynamic, add to `preservePatterns`

### Key appears in wrong namespace

1. Verify `useTranslation("correctNs")` is in the same scope as `t()` call
2. Don't pass `t` as a function parameter — pass translated strings instead

### `extract --ci` fails but translations look correct

1. Run `pnpm i18n` to see what the CLI wants to change
2. Check `git diff` to understand the difference
3. Common cause: plural keys missing `_one`/`_other` suffixes
