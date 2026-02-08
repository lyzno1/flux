import { formatShortcut } from "@/utils/format-shortcut";
import type { KeybindingEntry } from "./initial-state";
import type { KeybindingsStore } from "./store";

const getBindingById = (id: string) => (s: KeybindingsStore) => s.bindings[id];
const getAllBindings = (s: KeybindingsStore) => s.bindings;

export const keybindingsSelectors = {
	getBindingById,
	getAllBindings,
};

export function formatKeybinding(entry: Pick<KeybindingEntry, "key" | "mod" | "alt" | "shift">): string {
	return formatShortcut(entry.key, entry);
}
