const BYTES_IN_KIB = 1024;
const MIME_WILDCARD_SUFFIX = "/*";

export type AppPromptInputFilePolicyMode = "whitelist" | "blacklist";

export type AppPromptInputFilePolicy = {
	mode: AppPromptInputFilePolicyMode;
	mimeTypes: string[];
	extensions: string[];
	maxFileCount: number;
	maxFileSizeInBytes: number;
};

export const DEFAULT_APP_PROMPT_INPUT_FILE_POLICY: AppPromptInputFilePolicy = {
	mode: "whitelist",
	mimeTypes: [
		"image/*",
		"text/*",
		"application/pdf",
		"application/json",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"audio/*",
		"video/*",
	],
	extensions: [
		"csv",
		"doc",
		"docx",
		"jpeg",
		"jpg",
		"json",
		"md",
		"mp3",
		"mp4",
		"pdf",
		"png",
		"ppt",
		"pptx",
		"txt",
		"wav",
		"webm",
		"webp",
		"xls",
		"xlsx",
	],
	maxFileCount: 8,
	maxFileSizeInBytes: 20 * BYTES_IN_KIB * BYTES_IN_KIB,
};

export type AppPromptInputRejectedFileReason = "file-type-not-allowed" | "file-too-large" | "too-many-files";

export type AppPromptInputRejectedFile = {
	file: File;
	reason: AppPromptInputRejectedFileReason;
};

export type AppPromptInputFilterResult = {
	accepted: File[];
	rejected: AppPromptInputRejectedFile[];
};

function normalizeFileToken(token: string): string {
	return token.trim().replace(/^\./, "").toLowerCase();
}

function normalizeMimeType(mimeType: string): string {
	return mimeType.trim().toLowerCase();
}

function getFileExtension(fileName: string): string | null {
	const index = fileName.lastIndexOf(".");
	if (index <= 0 || index === fileName.length - 1) {
		return null;
	}
	return fileName.slice(index + 1).toLowerCase();
}

function matchesMimeType(mimeType: string, pattern: string): boolean {
	const normalizedMimeType = normalizeMimeType(mimeType);
	const normalizedPattern = normalizeMimeType(pattern);

	if (!normalizedPattern.includes("/")) {
		return false;
	}

	if (normalizedPattern.endsWith(MIME_WILDCARD_SUFFIX)) {
		const prefix = normalizedPattern.slice(0, -MIME_WILDCARD_SUFFIX.length);
		return normalizedMimeType.startsWith(`${prefix}/`);
	}

	return normalizedMimeType === normalizedPattern;
}

function isMimeTypeAllowed(file: File, mimeTypeRules: string[]): boolean {
	if (!file.type) {
		return false;
	}
	return mimeTypeRules.some((rule) => matchesMimeType(file.type, rule));
}

function isExtensionAllowed(file: File, extensionRules: string[]): boolean {
	const extension = getFileExtension(file.name);
	if (!extension) {
		return false;
	}
	return extensionRules.includes(extension);
}

function isFileTypeAllowed(file: File, policy: AppPromptInputFilePolicy): boolean {
	const normalizedMimeTypes = policy.mimeTypes.map(normalizeMimeType);
	const normalizedExtensions = policy.extensions.map(normalizeFileToken);
	const matchedByMime = isMimeTypeAllowed(file, normalizedMimeTypes);
	const matchedByExtension = isExtensionAllowed(file, normalizedExtensions);

	if (policy.mode === "whitelist") {
		return matchedByMime || matchedByExtension;
	}

	return !matchedByMime && !matchedByExtension;
}

export function buildAppPromptInputAccept(policy: AppPromptInputFilePolicy): string | undefined {
	if (policy.mode !== "whitelist") {
		return undefined;
	}

	const acceptTokens = new Set([
		...policy.mimeTypes.map(normalizeMimeType),
		...policy.extensions.map((extension) => `.${normalizeFileToken(extension)}`),
	]);

	return [...acceptTokens].join(",");
}

export function filterAppPromptInputFiles(
	files: FileList | File[],
	policy: AppPromptInputFilePolicy,
	currentFileCount = 0,
): AppPromptInputFilterResult {
	const accepted: File[] = [];
	const rejected: AppPromptInputRejectedFile[] = [];

	for (const file of Array.from(files)) {
		if (currentFileCount + accepted.length >= policy.maxFileCount) {
			rejected.push({ file, reason: "too-many-files" });
			continue;
		}

		if (file.size > policy.maxFileSizeInBytes) {
			rejected.push({ file, reason: "file-too-large" });
			continue;
		}

		if (!isFileTypeAllowed(file, policy)) {
			rejected.push({ file, reason: "file-type-not-allowed" });
			continue;
		}

		accepted.push(file);
	}

	return { accepted, rejected };
}
