# Selector Patterns

## Basic Selector Object

```ts
// apps/web/src/stores/app/slices/sidebar/selectors.ts
import type { AppStore } from "../../store";

const isSidebarOpen = (s: AppStore) => s.sidebarOpen;
const isSidebarMobile = (s: AppStore) => s.sidebarIsMobile;
const isSidebarCollapsed = (s: AppStore) => !s.sidebarOpen;
const sidebarState = (s: AppStore): "expanded" | "collapsed" =>
	s.sidebarOpen ? "expanded" : "collapsed";

export const sidebarSelectors = {
	isSidebarOpen,
	isSidebarMobile,
	isSidebarCollapsed,
	sidebarState,
};
```

Prefer derived booleans (`isSidebarCollapsed`) over raw values — components only re-render when the boolean flips. (Vercel: `rerender-derived-state`)

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
const isOpen = useAppStore(sidebarSelectors.isSidebarOpen);

// curried
const item = useListStore(listSelectors.getItemById(itemId));

// multiple values (auto shallow compare)
const [tab, isOpen] = useAppStore((s) => [
	sidebarSelectors.currentTab(s),
	sidebarSelectors.isSidebarOpen(s),
]);

// deep object — use isEqual
import { isEqual } from "fast-deep-equal";
const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
```

## Static Getters (Outside React)

```ts
// for use in services, utils, or event handlers outside React
export const getIsSidebarOpen = () =>
	sidebarSelectors.isSidebarOpen(useAppStore.getState());
```
