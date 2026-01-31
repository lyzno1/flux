---
name: zustand-store
description: Zustand state management patterns for the Flux project. LobeHub-style architecture with Slice pattern, strict selectors, and shared package structure. Use when creating new zustand stores, adding slices, writing selectors, integrating stores with React components, or refactoring client-side state management. Triggers on tasks involving zustand, store creation, state management, selectors, or client UI state.
---

# Zustand Store

Zustand state management following LobeHub-style Slice architecture for the Flux monorepo.

## Architecture

- **Package**: `packages/store` (`@flux/store`) - shared across apps
- **Store creation**: `createWithEqualityFn` + `shallow` default + optional `devtools` + `subscribeWithSelector`
- **Organization**: Multi-store by domain, each store uses Slice pattern
- **Selectors**: Strict mode - all state access through selector objects
- **Types**: Full TypeScript - Store = State & SliceAction1 & SliceAction2 & ...

## Quick Reference

| Pattern | Reference |
|---------|-----------|
| Store creation & Slice pattern | [store-patterns](references/store-patterns.md) |
| Selector patterns | [selector-patterns](references/selector-patterns.md) |
| React integration | [react-integration](references/react-integration.md) |

## Store Directory Structure

```
packages/store/src/
  ├── index.ts                 # public exports
  ├── create-store.ts          # createFluxStore wrapper
  └── stores/
      └── <domain>/
          ├── store.ts         # store creation + slice composition
          ├── initial-state.ts # state types + initial values
          ├── index.ts         # public exports
          └── slices/
              └── <slice>/
                  ├── action.ts
                  ├── initial-state.ts
                  └── selectors.ts
```

## Rules

1. Never access store state directly in components - always use selectors
2. Every selector function must be exported via a `xxxSelectors` object
3. Use `shallow` as default equality fn; use `isEqual` for deep objects only when needed
4. Prefix internal-only actions with `internal_`
5. Keep state flat - avoid deeply nested objects
6. Async actions call services then `set()` - no middleware for persistence
7. Use `subscribeWithSelector` on stores that need external subscriptions
