import type { SidebarState } from "./slices/sidebar/initial-state";
import { initialSidebarState } from "./slices/sidebar/initial-state";

export type AppState = SidebarState;

export const initialState: AppState = {
	...initialSidebarState,
};
