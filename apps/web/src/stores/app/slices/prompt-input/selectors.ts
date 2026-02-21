import type { AppStore } from "../../store";

const isPromptUploadAreaOpen = (s: AppStore) => s.promptUploadAreaOpen;

export const promptInputSelectors = {
	isPromptUploadAreaOpen,
};
