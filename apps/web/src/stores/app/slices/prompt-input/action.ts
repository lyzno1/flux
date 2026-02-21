import type { StateCreator } from "zustand";
import type { AppStore } from "../../store";

export type PromptInputAction = {
	setPromptUploadAreaOpen: (open: boolean) => void;
	togglePromptUploadArea: () => void;
};

export const createPromptInputSlice: StateCreator<
	AppStore,
	[["zustand/devtools", never], ["zustand/persist", unknown]],
	[],
	PromptInputAction
> = (set) => ({
	setPromptUploadAreaOpen: (open) => set({ promptUploadAreaOpen: open }, false, "setPromptUploadAreaOpen"),

	togglePromptUploadArea: () =>
		set((s) => ({ promptUploadAreaOpen: !s.promptUploadAreaOpen }), false, "togglePromptUploadArea"),
});
