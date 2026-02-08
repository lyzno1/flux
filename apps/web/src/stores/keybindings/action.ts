import type { StateCreator } from "zustand";
import { IS_MAC } from "@/utils/platform";
import type { KeybindingEntry } from "./initial-state";
import type { KeybindingsStore } from "./store";

export type KeybindingsAction = {
	registerKeybinding: (id: string, entry: KeybindingEntry) => void;
	unregisterKeybinding: (id: string) => void;
	handleKeyDown: (event: KeyboardEvent) => void;
};

function matchesEntry(event: KeyboardEvent, entry: KeybindingEntry): boolean {
	if (event.key.toLowerCase() !== entry.key.toLowerCase()) return false;

	const modPressed = IS_MAC ? event.metaKey : event.ctrlKey;
	if (!!entry.mod !== modPressed) return false;
	if (!!entry.alt !== event.altKey) return false;
	if (!!entry.shift !== event.shiftKey) return false;

	const otherModPressed = IS_MAC ? event.ctrlKey : event.metaKey;
	if (otherModPressed) return false;

	return true;
}

export const createKeybindingsActions: StateCreator<
	KeybindingsStore,
	[["zustand/devtools", never]],
	[],
	KeybindingsAction
> = (set, get) => ({
	registerKeybinding: (id, entry) =>
		set((state) => ({ bindings: { ...state.bindings, [id]: entry } }), false, "registerKeybinding"),

	unregisterKeybinding: (id) =>
		set(
			(state) => {
				const { [id]: _, ...rest } = state.bindings;
				return { bindings: rest };
			},
			false,
			"unregisterKeybinding",
		),

	handleKeyDown: (event) => {
		const target = event.target as HTMLElement;
		const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

		const { bindings } = get();
		for (const entry of Object.values(bindings)) {
			if (!matchesEntry(event, entry)) continue;

			if (isInput && !entry.mod && !entry.alt) return;

			event.preventDefault();
			entry.handler();
			return;
		}
	},
});
