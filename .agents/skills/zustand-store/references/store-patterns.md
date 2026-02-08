# Store Creation & Slice Patterns

## createStore Wrapper (Simple Stores)

For stores that only need `devtools` + `subscribeWithSelector`:

```ts
// apps/web/src/lib/create-store.ts
import { isClient } from "@flux/utils/runtime";
import type { StateCreator } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

export function createStore<T>(
	name: string,
	storeCreator: StateCreator<T, [["zustand/devtools", never]]>,
) {
	return createWithEqualityFn<T>()(
		subscribeWithSelector(
			devtools(storeCreator, {
				name: `Flux_${name}`,
				enabled: import.meta.env.DEV && isClient,
			}),
		),
		shallow,
	);
}
```

### Example: Keybindings Store (no persistence)

```ts
// apps/web/src/stores/keybindings/store.ts
import type { StateCreator } from "zustand";
import { createStore } from "@/lib/create-store";
import { createKeybindingsActions, type KeybindingsAction } from "./action";
import type { KeybindingsState } from "./initial-state";
import { initialKeybindingsState } from "./initial-state";

export type KeybindingsStore = KeybindingsState & KeybindingsAction;

const createKeybindingsStore: StateCreator<
	KeybindingsStore,
	[["zustand/devtools", never]]
> = (...params) => ({
	...initialKeybindingsState,
	...createKeybindingsActions(...params),
});

export const useKeybindingsStore = createStore("keybindings", createKeybindingsStore);
export const getKeybindingsStoreState = () => useKeybindingsStore.getState();
```

## Inline Creation (Stores with persist middleware)

When `persist` is needed, create inline with `createWithEqualityFn`:

```ts
// apps/web/src/stores/app/store.ts
import { isClient } from "@flux/utils/runtime";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import { STORAGE_KEYS } from "@/config/storage-keys";
import type { AppState } from "./initial-state";
import { initialState } from "./initial-state";
import { createSidebarSlice, type SidebarAction } from "./slices/sidebar/action";

export type AppStore = AppState & SidebarAction;

export const useAppStore = createWithEqualityFn<AppStore>()(
	subscribeWithSelector(
		devtools(
			persist(
				(...a) => ({
					...initialState,
					...createSidebarSlice(...a),
				}),
				{
					name: STORAGE_KEYS.LOCAL.SIDEBAR_OPEN,
					partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
				},
			),
			{
				name: "Flux_app",
				enabled: import.meta.env.DEV && isClient,
			},
		),
	),
	shallow,
);

export const getAppStoreState = () => useAppStore.getState();
```

Middleware order (outer → inner): `subscribeWithSelector` → `devtools` → `persist`

Key `persist` options:
- `name` — storage key, use `STORAGE_KEYS` constants
- `partialize` — only persist what's needed; exclude transient/derived state

## State Definition

```ts
// apps/web/src/stores/app/initial-state.ts
import type { SidebarState } from "./slices/sidebar/initial-state";
import { initialSidebarState } from "./slices/sidebar/initial-state";

export type AppState = SidebarState;

export const initialState: AppState = {
	...initialSidebarState,
};
```

## Slice Definition

### State

```ts
// apps/web/src/stores/app/slices/sidebar/initial-state.ts
export type SidebarState = {
	sidebarOpen: boolean;
};

export const initialSidebarState: SidebarState = {
	sidebarOpen: true,
};
```

### Actions

Use the four-parameter `StateCreator` generic. The second parameter declares which middleware the store uses:

```ts
// apps/web/src/stores/app/slices/sidebar/action.ts
import type { StateCreator } from "zustand";
import type { AppStore } from "../../store";

export type SidebarAction = {
	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;
};

export const createSidebarSlice: StateCreator<
	AppStore,                                                    // 1. Full store type
	[["zustand/devtools", never], ["zustand/persist", unknown]], // 2. Middleware array
	[],                                                          // 3. Mutators (empty)
	SidebarAction                                                // 4. This slice's exports
> = (set) => ({
	toggleSidebar: () =>
		set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "toggleSidebar"),

	setSidebarOpen: (open) =>
		set({ sidebarOpen: open }, false, "setSidebarOpen"),
});
```

For stores without `persist`, the middleware array only includes devtools:

```ts
export const createKeybindingsActions: StateCreator<
	KeybindingsStore,
	[["zustand/devtools", never]], // devtools only
	[],
	KeybindingsAction
> = (set, get) => ({ ... });
```

## Async Action Pattern

```ts
export const createSettingsSlice: StateCreator<
	UserStore,
	[["zustand/devtools", never]],
	[],
	SettingsAction
> = (set, get) => ({
	updateSettings: async (patch) => {
		const prev = get().settings;
		const next = { ...prev, ...patch };

		// optimistic update
		set({ settings: next }, false, "optimistic_updateSettings");

		try {
			await settingsService.save(next);
		} catch {
			// rollback
			set({ settings: prev }, false, "rollback_updateSettings");
		}
	},
});
```
