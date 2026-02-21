import type { PromptInputFileKind } from "./file-metadata";

export type PromptInputAttachmentStatus = "error" | "idle" | "uploaded" | "uploading";

export type PromptInputAttachment = {
	errorMessage?: string | null;
	fileKind?: PromptInputFileKind;
	id: string;
	mimeType?: string | null;
	name: string;
	previewUrl?: string | null;
	progress?: number | null;
	size: number;
	status?: PromptInputAttachmentStatus;
};
