# Store Creation & Slice Patterns

## createStore Wrapper

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

## Store with Slices

```ts
// apps/web/src/stores/global/store.ts
import type { StateCreator } from "zustand";
import { createStore } from "@/lib/create-store";
import type { GlobalState } from "./initial-state";
import { initialState } from "./initial-state";
import { type SidebarAction, createSidebarSlice } from "./slices/sidebar/action";
import { type ModalAction, createModalSlice } from "./slices/modal/action";

export type GlobalStore = GlobalState & SidebarAction & ModalAction;

const createGlobalStore: StateCreator<GlobalStore, [["zustand/devtools", never]]> = (
	...params
) => ({
	...initialState,
	...createSidebarSlice(...params),
	...createModalSlice(...params),
});

export const useGlobalStore = createStore("global", createGlobalStore);
export const getGlobalStoreState = () => useGlobalStore.getState();
```

## State Definition

```ts
// apps/web/src/stores/global/initial-state.ts
import type { SidebarState } from "./slices/sidebar/initial-state";
import { initialSidebarState } from "./slices/sidebar/initial-state";
import type { ModalState } from "./slices/modal/initial-state";
import { initialModalState } from "./slices/modal/initial-state";

export type GlobalState = SidebarState & ModalState;

export const initialState: GlobalState = {
	...initialSidebarState,
	...initialModalState,
};
```

## Slice Definition

```ts
// apps/web/src/stores/global/slices/sidebar/initial-state.ts
export interface SidebarState {
	sidebarOpen: boolean;
	sidebarTab: "nav" | "search" | "settings";
}

export const initialSidebarState: SidebarState = {
	sidebarOpen: true,
	sidebarTab: "nav",
};
```

```ts
// apps/web/src/stores/global/slices/sidebar/action.ts
import type { StateCreator } from "zustand";
import type { GlobalStore } from "../../store";

export interface SidebarAction {
	toggleSidebar: () => void;
	setSidebarTab: (tab: SidebarState["sidebarTab"]) => void;
	internal_resetSidebar: () => void;
}

export const createSidebarSlice: StateCreator<
	GlobalStore,
	[["zustand/devtools", never]],
	[],
	SidebarAction
> = (set) => ({
	toggleSidebar: () =>
		set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "toggleSidebar"),

	setSidebarTab: (tab) =>
		set({ sidebarTab: tab }, false, "setSidebarTab"),

	internal_resetSidebar: () =>
		set({ sidebarOpen: true, sidebarTab: "nav" }, false, "internal_resetSidebar"),
});
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

## Store Index Exports

```ts
// apps/web/src/stores/global/index.ts
export { useGlobalStore, getGlobalStoreState } from "./store";
export type { GlobalStore } from "./store";
export { sidebarSelectors } from "./slices/sidebar/selectors";
export { modalSelectors } from "./slices/modal/selectors";
```
