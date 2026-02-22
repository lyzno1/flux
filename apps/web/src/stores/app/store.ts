import { STORAGE_KEYS } from "@/config/storage-keys";
import { createStore } from "@/lib/create-store";
import type { AppState } from "./initial-state";
import { initialState } from "./initial-state";
import { createPromptInputSlice, type PromptInputAction } from "./slices/prompt-input/action";
import { createSidebarSlice, type SidebarAction } from "./slices/sidebar/action";

export type AppStore = AppState & SidebarAction & PromptInputAction;
type PersistedSidebarState = Pick<AppStore, "sidebarOpen">;

export const useAppStore = createStore<AppStore>(
	"app",
	(...a) => ({
		...initialState,
		...createPromptInputSlice(...a),
		...createSidebarSlice(...a),
	}),
	{
		persist: {
			name: STORAGE_KEYS.LOCAL.SIDEBAR,
			partialize: (state): PersistedSidebarState => ({
				sidebarOpen: state.sidebarOpen,
			}),
		},
	},
);

export const getAppStoreState = () => useAppStore.getState();
