import { useEffect, useRef } from "react";
import type { KeybindingEntry } from "@/stores/keybindings/initial-state";
import { getKeybindingsStoreState } from "@/stores/keybindings/store";

export function useKeybinding(
	id: string,
	key: string,
	handler: () => void,
	options?: Pick<KeybindingEntry, "mod" | "alt" | "shift" | "description">,
) {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	const mod = options?.mod;
	const alt = options?.alt;
	const shift = options?.shift;
	const description = options?.description;

	useEffect(() => {
		const { registerKeybinding, unregisterKeybinding } = getKeybindingsStoreState();

		registerKeybinding(id, {
			key,
			mod,
			alt,
			shift,
			description,
			handler: () => handlerRef.current(),
		});

		return () => unregisterKeybinding(id);
	}, [id, key, mod, alt, shift, description]);
}

let globalListenerInit = false;

export function useGlobalKeyboardListener() {
	useEffect(() => {
		if (globalListenerInit) return;
		globalListenerInit = true;

		window.addEventListener("keydown", (event) => {
			getKeybindingsStoreState().handleKeyDown(event);
		});
	}, []);
}
