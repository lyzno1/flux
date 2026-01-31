# Store Creation & Slice Patterns

## createFluxStore Wrapper

```ts
// packages/store/src/create-store.ts
import { optionalDevtools } from "zustand-utils";
import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import type { StateCreator } from "zustand/vanilla";

const isDev = process.env.NODE_ENV === "development";

export const createDevtools =
  (name: string) =>
  <T>(initializer: StateCreator<T, [["zustand/devtools", never]]>) => {
    let showDevtools = false;
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const debug = url.searchParams.get("debug");
      if (debug?.includes(name)) showDevtools = true;
    }
    return optionalDevtools(showDevtools)(initializer, {
      name: `Flux_${name}${isDev ? "_DEV" : ""}`,
    });
  };

export const createFluxStore = <S>(
  name: string,
  createStoreFn: StateCreator<S, [["zustand/devtools", never]]>,
) => {
  const devtools = createDevtools(name);
  return createWithEqualityFn<S>()(
    subscribeWithSelector(devtools(createStoreFn)),
    shallow,
  );
};
```

## Store with Slices

```ts
// stores/global/store.ts
import type { StateCreator } from "zustand/vanilla";
import { createFluxStore } from "../../create-store";
import type { GlobalState } from "./initial-state";
import { initialState } from "./initial-state";
import { type SidebarAction, createSidebarSlice } from "./slices/sidebar/action";
import { type ModalAction, createModalSlice } from "./slices/modal/action";

export type GlobalStore = GlobalState & SidebarAction & ModalAction;

const createStore: StateCreator<GlobalStore, [["zustand/devtools", never]]> = (
  ...params
) => ({
  ...initialState,
  ...createSidebarSlice(...params),
  ...createModalSlice(...params),
});

export const useGlobalStore = createFluxStore("global", createStore);
export const getGlobalStoreState = () => useGlobalStore.getState();
```

## State Definition

```ts
// stores/global/initial-state.ts
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
// stores/global/slices/sidebar/initial-state.ts
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
// stores/global/slices/sidebar/action.ts
import type { StateCreator } from "zustand/vanilla";
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
// stores/global/index.ts
export { useGlobalStore, getGlobalStoreState } from "./store";
export type { GlobalStore } from "./store";
export { globalSelectors } from "./slices/sidebar/selectors";
export { modalSelectors } from "./slices/modal/selectors";
```
