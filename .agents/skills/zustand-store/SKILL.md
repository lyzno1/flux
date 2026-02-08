---
name: zustand-store
description: Zustand state management patterns for the Flux project. Slice pattern, strict selectors, and app-local store definitions. Use when creating new zustand stores, adding slices, writing selectors, integrating stores with React components, or refactoring client-side state management. Triggers on tasks involving zustand, store creation, state management, selectors, or client UI state.
---

# Zustand Store

Zustand state management with Slice architecture for the Flux monorepo.

## Architecture

- **Factory**: `apps/web/src/lib/create-store.ts` — `createStore` wrapper with `subscribeWithSelector` + `devtools` + `shallow`
- **Store definitions**: `apps/web/src/stores/` — domain stores live in the consuming app
- **Store creation**: Use `createStore` wrapper for simple stores; use `createWithEqualityFn` inline when additional middleware is needed (e.g. `persist`)
- **Organization**: Multi-store by domain, each store uses Slice pattern
- **Selectors**: Strict mode — all state access through selector objects
- **Types**: `type` only (no `interface`) — Store = State & SliceAction1 & SliceAction2 & ...
- **Imports**: Direct module paths only — no barrel files (`noBarrelFile` Biome rule)

## Quick Reference

| Pattern | Reference |
|---------|-----------|
| Store creation & Slice pattern | [store-patterns](references/store-patterns.md) |
| Selector patterns | [selector-patterns](references/selector-patterns.md) |
| React integration | [react-integration](references/react-integration.md) |

## Directory Structure

```
apps/web/src/stores/
  └── <domain>/
      ├── store.ts             # store creation + slice composition
      ├── initial-state.ts     # state types + initial values
      └── slices/
          └── <slice>/
              ├── action.ts
              ├── initial-state.ts
              └── selectors.ts
```

## Rules

1. Never access store state directly in components — always use selectors
2. Every selector function must be exported via a `xxxSelectors` object
3. Use `shallow` as default equality fn; use `isEqual` for deep objects only when needed
4. Prefix internal-only actions with `internal_`
5. Keep state flat — avoid deeply nested objects
6. Use Zustand `persist` middleware for localStorage persistence; use `partialize` to persist only needed fields
7. Use `subscribeWithSelector` on stores that need external subscriptions
8. Use `type` for all state and action type definitions — never `interface` (prevents declaration merging)
9. Access actions via `getXxxStoreState()` in callbacks to avoid subscriptions (Vercel: `rerender-defer-reads`)
10. Subscribe to derived booleans, not raw values (Vercel: `rerender-derived-state`)
11. Use functional `set((s) => ...)` for state updates that depend on current state (Vercel: `rerender-functional-setstate`)
