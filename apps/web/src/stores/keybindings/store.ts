import type { StateCreator } from "zustand";
import { createStore } from "@/lib/create-store";
import { createKeybindingsActions, type KeybindingsAction } from "./action";
import type { KeybindingsState } from "./initial-state";
import { initialKeybindingsState } from "./initial-state";

export type KeybindingsStore = KeybindingsState & KeybindingsAction;

const createKeybindingsStore: StateCreator<KeybindingsStore, [["zustand/devtools", never]]> = (...params) => ({
	...initialKeybindingsState,
	...createKeybindingsActions(...params),
});

export const useKeybindingsStore = createStore("keybindings", createKeybindingsStore);

export const getKeybindingsStoreState = () => useKeybindingsStore.getState();
