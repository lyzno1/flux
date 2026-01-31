# Selector Patterns

## Basic Selector Object

```ts
// stores/global/slices/sidebar/selectors.ts
import type { GlobalStore } from "../../store";

const isSidebarOpen = (s: GlobalStore) => s.sidebarOpen;
const currentTab = (s: GlobalStore) => s.sidebarTab;
const isSearchActive = (s: GlobalStore) => s.sidebarTab === "search";

export const sidebarSelectors = {
  isSidebarOpen,
  currentTab,
  isSearchActive,
};
```

## Derived / Composed Selectors

```ts
const currentSettings = (s: UserStore): UserSettings =>
  merge(s.defaultSettings, s.settings);

const currentTheme = (s: UserStore) =>
  currentSettings(s).theme;

export const settingsSelectors = {
  currentSettings,
  currentTheme,
};
```

## Parameterized Selectors (Curried)

```ts
const getItemById = (id: string) => (s: ListStore) =>
  s.items[id];

const isItemSelected = (id: string) => (s: ListStore) =>
  s.selectedIds.includes(id);

export const listSelectors = {
  getItemById,
  isItemSelected,
};
```

## Usage in Components

```tsx
// basic
const isOpen = useGlobalStore(sidebarSelectors.isSidebarOpen);

// curried
const item = useListStore(listSelectors.getItemById(itemId));

// multiple values (auto shallow compare)
const [tab, isOpen] = useGlobalStore((s) => [
  sidebarSelectors.currentTab(s),
  sidebarSelectors.isSidebarOpen(s),
]);

// deep object - use isEqual
import { isEqual } from "fast-deep-equal";
const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
```

## Static Getters (Outside React)

```ts
// for use in services, utils, or event handlers outside React
export const getIsSidebarOpen = () =>
  sidebarSelectors.isSidebarOpen(useGlobalStore.getState());
```
