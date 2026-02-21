import { isClient } from "@flux/utils/runtime";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import { STORAGE_KEYS } from "@/config/storage-keys";
import type { AppState } from "./initial-state";
import { initialState } from "./initial-state";
import { createPromptInputSlice, type PromptInputAction } from "./slices/prompt-input/action";
import { createSidebarSlice, type SidebarAction } from "./slices/sidebar/action";

export type AppStore = AppState & SidebarAction & PromptInputAction;

export const useAppStore = createWithEqualityFn<AppStore>()(
	subscribeWithSelector(
		devtools(
			persist(
				(...a) => ({
					...initialState,
					...createPromptInputSlice(...a),
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
