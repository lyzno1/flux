const BYTES_IN_KIB = 1024;

const DOCUMENT_EXTENSIONS = new Set([
	"csv",
	"doc",
	"docx",
	"json",
	"md",
	"odt",
	"pdf",
	"ppt",
	"pptx",
	"rtf",
	"txt",
	"xls",
	"xlsx",
]);

const ARCHIVE_EXTENSIONS = new Set(["7z", "bz2", "gz", "rar", "tar", "xz", "zip"]);
const CODE_EXTENSIONS = new Set(["c", "cpp", "cs", "go", "java", "js", "jsx", "py", "rb", "rs", "sql", "ts", "tsx"]);

export type PromptInputFileKind = "archive" | "audio" | "code" | "document" | "image" | "unknown" | "video";

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

export function inferPromptInputFileKind(fileName: string, mimeType?: string | null): PromptInputFileKind {
	const normalizedMimeType = mimeType ? normalizeMimeType(mimeType) : "";
	const extension = getFileExtension(fileName);

	if (normalizedMimeType.startsWith("image/")) {
		return "image";
	}
	if (normalizedMimeType.startsWith("audio/")) {
		return "audio";
	}
	if (normalizedMimeType.startsWith("video/")) {
		return "video";
	}
	if (
		normalizedMimeType.startsWith("text/") ||
		normalizedMimeType.includes("pdf") ||
		normalizedMimeType.includes("word") ||
		normalizedMimeType.includes("excel") ||
		normalizedMimeType.includes("presentation") ||
		normalizedMimeType.includes("json")
	) {
		return "document";
	}

	if (!extension) {
		return "unknown";
	}

	if (DOCUMENT_EXTENSIONS.has(extension)) {
		return "document";
	}
	if (ARCHIVE_EXTENSIONS.has(extension)) {
		return "archive";
	}
	if (CODE_EXTENSIONS.has(extension)) {
		return "code";
	}

	return "unknown";
}

export function formatPromptInputFileSize(sizeInBytes: number): string {
	if (!Number.isFinite(sizeInBytes) || sizeInBytes < 0) {
		return "0 B";
	}
	if (sizeInBytes < BYTES_IN_KIB) {
		return `${sizeInBytes} B`;
	}

	const units = ["KB", "MB", "GB", "TB"];
	let size = sizeInBytes / BYTES_IN_KIB;
	let unitIndex = 0;

	while (size >= BYTES_IN_KIB && unitIndex < units.length - 1) {
		size /= BYTES_IN_KIB;
		unitIndex += 1;
	}

	const precision = size >= 10 ? 0 : 1;
	return `${size.toFixed(precision)} ${units[unitIndex]}`;
}
