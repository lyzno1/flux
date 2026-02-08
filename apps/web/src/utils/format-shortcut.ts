import { IS_MAC } from "@/utils/platform";

export function formatShortcut(key: string, options?: { mod?: boolean; alt?: boolean; shift?: boolean }): string {
	const parts: string[] = [];
	if (options?.mod) parts.push(IS_MAC ? "⌘" : "Ctrl+");
	if (options?.alt) parts.push(IS_MAC ? "⌥" : "Alt+");
	if (options?.shift) parts.push(IS_MAC ? "⇧" : "Shift+");
	parts.push(key.toUpperCase());
	return parts.join("");
}
