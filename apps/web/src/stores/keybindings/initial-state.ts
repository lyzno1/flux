import { isClient } from "@flux/utils/runtime";

export const IS_MAC = isClient && /Mac|iPhone|iPad/.test(navigator.userAgent);

export type KeybindingEntry = {
	key: string;
	mod?: boolean;
	alt?: boolean;
	shift?: boolean;
	handler: () => void;
	description?: string;
};

export type KeybindingsState = {
	bindings: Record<string, KeybindingEntry>;
};

export const initialKeybindingsState: KeybindingsState = {
	bindings: {},
};
