import type { KeybindingEntry } from "./initial-state";
import { IS_MAC } from "./initial-state";
import type { KeybindingsStore } from "./store";

const getBindingById = (id: string) => (s: KeybindingsStore) => s.bindings[id];
const getAllBindings = (s: KeybindingsStore) => s.bindings;

export const keybindingsSelectors = {
	getBindingById,
	getAllBindings,
};

export function formatKeybinding(entry: Pick<KeybindingEntry, "key" | "mod" | "alt" | "shift">): string {
	const parts: string[] = [];
	if (entry.mod) parts.push(IS_MAC ? "⌘" : "Ctrl");
	if (entry.alt) parts.push(IS_MAC ? "⌥" : "Alt");
	if (entry.shift) parts.push(IS_MAC ? "⇧" : "Shift");
	parts.push(entry.key.toUpperCase());
	return parts.join(IS_MAC ? "" : "+");
}
