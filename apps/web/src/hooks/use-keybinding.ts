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

let globalListener: ((event: KeyboardEvent) => void) | null = null;

export function useGlobalKeyboardListener() {
	useEffect(() => {
		if (globalListener) return;

		globalListener = (event: KeyboardEvent) => {
			getKeybindingsStoreState().handleKeyDown(event);
		};
		window.addEventListener("keydown", globalListener);

		return () => {
			if (globalListener) {
				window.removeEventListener("keydown", globalListener);
				globalListener = null;
			}
		};
	}, []);
}
