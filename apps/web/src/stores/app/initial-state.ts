import type { PromptInputState } from "./slices/prompt-input/initial-state";
import { initialPromptInputState } from "./slices/prompt-input/initial-state";
import type { SidebarState } from "./slices/sidebar/initial-state";
import { initialSidebarState } from "./slices/sidebar/initial-state";

export type AppState = SidebarState & PromptInputState;

export const initialState: AppState = {
	...initialPromptInputState,
	...initialSidebarState,
};
