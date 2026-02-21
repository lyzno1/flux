import { createFileRoute } from "@tanstack/react-router";
import { type FocusEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppPromptInput } from "@/components/app-prompt-input";
import {
	type AppPromptInputRejectedFile,
	buildAppPromptInputAccept,
	DEFAULT_APP_PROMPT_INPUT_FILE_POLICY,
	filterAppPromptInputFiles,
} from "@/components/app-prompt-input/file-helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inferPromptInputFileKind, type PromptInputFileKind } from "@/components/ui/prompt-input/file-metadata";
import type { PromptInputAttachment } from "@/components/ui/prompt-input/types";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/dify")({
	component: DifyDemo,
});

interface StreamEntry {
	event: string;
	data: unknown;
	receivedAt: number;
}

type DifyUploadFileType = "audio" | "custom" | "document" | "image" | "video";

type PromptUploadAttachment = PromptInputAttachment & {
	file: File;
	uploadFileId: string | null;
};

const EVENT_COLORS: Record<string, string> = {
	message: "bg-info-muted text-info-foreground",
	agent_message: "bg-info-muted text-info-foreground",
	agent_thought: "bg-muted text-muted-foreground",
	message_end: "bg-success-muted text-success-foreground",
	message_file: "bg-warning-muted text-warning-foreground",
	message_replace: "bg-warning-muted text-warning-foreground",
	workflow_started: "bg-info-muted text-info-foreground",
	workflow_finished: "bg-success-muted text-success-foreground",
	node_started: "bg-info-muted text-info-foreground",
	node_finished: "bg-success-muted text-success-foreground",
	node_retry: "bg-warning-muted text-warning-foreground",
	error: "bg-destructive-muted text-destructive",
	ping: "bg-muted text-muted-foreground",
	text_chunk: "bg-info-muted text-info-foreground",
	agent_log: "bg-muted text-muted-foreground",
};

function EventBadge({ event }: { event: string }) {
	return (
		<span
			className={cn(
				"inline-block rounded px-1.5 py-0.5 font-mono text-xs",
				EVENT_COLORS[event] ?? "bg-muted text-muted-foreground",
			)}
		>
			{event}
		</span>
	);
}

interface StreamCallbacks {
	onEvent: (entry: StreamEntry) => void;
	onAnswer: (chunk: string) => void;
	onConversationId: (id: string) => void;
}

async function consumeStream(
	iterator: AsyncIterableIterator<{ event: string; [key: string]: unknown }>,
	start: number,
	callbacks: StreamCallbacks,
) {
	for await (const event of iterator) {
		callbacks.onEvent({ event: event.event, data: event, receivedAt: performance.now() - start });

		if ((event.event === "message" || event.event === "agent_message") && "answer" in event) {
			callbacks.onAnswer(event.answer as string);
		}

		if (event.event === "message_end" && "conversation_id" in event) {
			callbacks.onConversationId(event.conversation_id as string);
		}
	}
}

function isAbortError(error: unknown) {
	return error instanceof DOMException && error.name === "AbortError";
}

function toErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

function shouldSkipStreamRequest(
	query: string,
	streaming: boolean,
	activeController: AbortController | null,
	hasUploadingFiles: boolean,
) {
	return !query || streaming || Boolean(activeController) || hasUploadingFiles;
}

function toDifyUploadFileType(fileKind: PromptInputFileKind): DifyUploadFileType {
	switch (fileKind) {
		case "image":
			return "image";
		case "audio":
			return "audio";
		case "video":
			return "video";
		case "document":
			return "document";
		default:
			return "custom";
	}
}

function createAttachmentId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildRejectedFileMessages(
	rejected: AppPromptInputRejectedFile[],
	t: (key: string, options?: Record<string, unknown>) => string,
) {
	const reasonCounter: Partial<Record<AppPromptInputRejectedFile["reason"], number>> = {};

	for (const item of rejected) {
		reasonCounter[item.reason] = (reasonCounter[item.reason] ?? 0) + 1;
	}

	const messages: string[] = [];

	if (reasonCounter["file-type-not-allowed"]) {
		messages.push(t("fileTypeRejected", { count: reasonCounter["file-type-not-allowed"] }));
	}
	if (reasonCounter["file-too-large"]) {
		messages.push(t("fileTooLarge", { count: reasonCounter["file-too-large"] }));
	}
	if (reasonCounter["too-many-files"]) {
		messages.push(t("fileTooMany", { count: reasonCounter["too-many-files"] }));
	}

	return messages;
}

function DifyDemo() {
	const { t } = useTranslation("dify");
	const id = useId();
	const [query, setQuery] = useState("hello");
	const [conversationId, setConversationId] = useState("");

	const [entries, setEntries] = useState<StreamEntry[]>([]);
	const [answer, setAnswer] = useState("");
	const [streaming, setStreaming] = useState(false);
	const [elapsed, setElapsed] = useState<number | null>(null);
	const [attachments, setAttachments] = useState<PromptUploadAttachment[]>([]);
	const [rejectedFileMessages, setRejectedFileMessages] = useState<string[]>([]);

	const hasPlacedInitialCaretRef = useRef(false);
	const abortRef = useRef<AbortController | null>(null);
	const promptInputRef = useRef<HTMLTextAreaElement | null>(null);
	const previewUrlsRef = useRef<Set<string>>(new Set());
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
			for (const previewUrl of previewUrlsRef.current) {
				URL.revokeObjectURL(previewUrl);
			}
			previewUrlsRef.current.clear();
		};
	}, []);

	const scrollToBottom = useCallback(() => {
		requestAnimationFrame(() => {
			scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
		});
	}, []);

	const focusPromptInputToEnd = useCallback(() => {
		requestAnimationFrame(() => {
			const textarea = promptInputRef.current;
			if (!textarea) {
				return;
			}
			textarea.focus({ preventScroll: true });
			const end = textarea.value.length;
			textarea.setSelectionRange(end, end);
		});
	}, []);

	const handlePromptInitialFocus = useCallback((event: FocusEvent<HTMLTextAreaElement>) => {
		if (hasPlacedInitialCaretRef.current) {
			return;
		}
		const end = event.currentTarget.value.length;
		event.currentTarget.setSelectionRange(end, end);
		hasPlacedInitialCaretRef.current = true;
	}, []);

	const revokePreviewUrl = useCallback((previewUrl: string | null | undefined) => {
		if (!previewUrl) {
			return;
		}
		URL.revokeObjectURL(previewUrl);
		previewUrlsRef.current.delete(previewUrl);
	}, []);

	const uploadAttachment = useCallback(async (attachment: PromptUploadAttachment) => {
		setAttachments((prev) =>
			prev.map((item) =>
				item.id === attachment.id
					? {
							...item,
							errorMessage: null,
							progress: null,
							status: "uploading",
						}
					: item,
			),
		);

		try {
			const uploaded = await client.dify.fileUpload({ file: attachment.file });
			setAttachments((prev) =>
				prev.map((item) =>
					item.id === attachment.id
						? {
								...item,
								progress: 100,
								status: "uploaded",
								uploadFileId: uploaded.id,
							}
						: item,
				),
			);
		} catch (error) {
			setAttachments((prev) =>
				prev.map((item) =>
					item.id === attachment.id
						? {
								...item,
								errorMessage: toErrorMessage(error),
								progress: null,
								status: "error",
								uploadFileId: null,
							}
						: item,
				),
			);
		}
	}, []);

	const handleSelectFiles = useCallback(
		(selectedFiles: FileList) => {
			const { accepted, rejected } = filterAppPromptInputFiles(
				selectedFiles,
				DEFAULT_APP_PROMPT_INPUT_FILE_POLICY,
				attachments.length,
			);

			setRejectedFileMessages(buildRejectedFileMessages(rejected, t));

			if (accepted.length === 0) {
				return;
			}

			const nextAttachments: PromptUploadAttachment[] = accepted.map((file) => {
				const fileKind = inferPromptInputFileKind(file.name, file.type);
				const previewUrl = fileKind === "image" ? URL.createObjectURL(file) : null;

				if (previewUrl) {
					previewUrlsRef.current.add(previewUrl);
				}

				return {
					id: createAttachmentId(),
					file,
					fileKind,
					mimeType: file.type || null,
					name: file.name,
					previewUrl,
					progress: null,
					size: file.size,
					status: "uploading",
					uploadFileId: null,
				};
			});

			setAttachments((prev) => [...prev, ...nextAttachments]);

			for (const attachment of nextAttachments) {
				void uploadAttachment(attachment);
			}
		},
		[attachments.length, t, uploadAttachment],
	);

	const handleRemoveAttachment = useCallback(
		(attachmentId: string) => {
			setAttachments((prev) => {
				const removed = prev.find((item) => item.id === attachmentId);
				revokePreviewUrl(removed?.previewUrl);
				return prev.filter((item) => item.id !== attachmentId);
			});
		},
		[revokePreviewUrl],
	);

	const handleClearAttachments = useCallback(() => {
		setAttachments((prev) => {
			for (const attachment of prev) {
				revokePreviewUrl(attachment.previewUrl);
			}
			return [];
		});
		setRejectedFileMessages([]);
	}, [revokePreviewUrl]);

	const hasUploadingFiles = attachments.some((attachment) => attachment.status === "uploading");

	const filesForRequest = useMemo(
		() =>
			attachments
				.filter((attachment) => attachment.status === "uploaded" && attachment.uploadFileId)
				.map((attachment) => ({
					transfer_method: "local_file" as const,
					upload_file_id: attachment.uploadFileId as string,
					type: toDifyUploadFileType(
						attachment.fileKind ?? inferPromptInputFileKind(attachment.name, attachment.mimeType),
					),
				})),
		[attachments],
	);

	const handleStream = useCallback(async () => {
		const trimmedQuery = query.trim();
		if (shouldSkipStreamRequest(trimmedQuery, streaming, abortRef.current, hasUploadingFiles)) {
			return;
		}

		setEntries([]);
		setAnswer("");
		setElapsed(null);
		setStreaming(true);

		const controller = new AbortController();
		abortRef.current = controller;
		const start = performance.now();

		const finalizeStream = () => {
			setElapsed(performance.now() - start);
			setStreaming(false);
			abortRef.current = null;
			scrollToBottom();
			focusPromptInputToEnd();
		};

		try {
			const iterator = await client.dify.chatMessagesStream(
				{
					query: trimmedQuery,
					inputs: {},
					...(filesForRequest.length > 0 ? { files: filesForRequest } : {}),
					...(conversationId ? { conversation_id: conversationId } : {}),
				},
				{ signal: controller.signal },
			);

			await consumeStream(iterator, start, {
				onEvent: (entry) => {
					setEntries((prev) => [...prev, entry]);
					scrollToBottom();
				},
				onAnswer: (chunk) => setAnswer((prev) => prev + chunk),
				onConversationId: setConversationId,
			});
		} catch (err: unknown) {
			if (isAbortError(err)) {
				return;
			}
			setEntries((prev) => [
				...prev,
				{ event: "client_error", data: { message: toErrorMessage(err) }, receivedAt: performance.now() - start },
			]);
		} finally {
			finalizeStream();
		}
	}, [conversationId, filesForRequest, focusPromptInputToEnd, hasUploadingFiles, query, scrollToBottom, streaming]);

	const handleSubmitPrompt = useCallback(() => {
		if (streaming || hasUploadingFiles || !query.trim()) {
			return;
		}
		void handleStream();
	}, [handleStream, hasUploadingFiles, query, streaming]);

	const handleStop = useCallback(() => {
		abortRef.current?.abort();
	}, []);

	const queryId = `${id}-query`;
	const convId = `${id}-conv`;
	const canSubmit = !streaming && !hasUploadingFiles && query.trim().length > 0;

	return (
		<div className="grid h-full grid-cols-[320px_1fr] gap-0 overflow-hidden">
			<div className="flex flex-col gap-4 overflow-y-auto border-r p-4">
				<h2 className="font-bold text-lg">{t("title")}</h2>

				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor={queryId}>{t("query")}</Label>
						<AppPromptInput
							inputId={queryId}
							inputName="query"
							inputRef={promptInputRef}
							autoFocus
							value={query}
							onChange={setQuery}
							onInitialFocus={handlePromptInitialFocus}
							onSubmit={handleSubmitPrompt}
							onStop={handleStop}
							onSelectFiles={handleSelectFiles}
							onRemoveAttachment={handleRemoveAttachment}
							onClearFiles={handleClearAttachments}
							attachments={attachments}
							rejectedFileMessages={rejectedFileMessages}
							fileAccept={buildAppPromptInputAccept(DEFAULT_APP_PROMPT_INPUT_FILE_POLICY)}
							fileCountText={attachments.length > 0 ? t("fileCount", { count: attachments.length }) : undefined}
							placeholder={t("query")}
							disabled={streaming}
							streaming={streaming}
							canSubmit={canSubmit}
							labels={{
								attachFiles: t("attachFiles"),
								clearFiles: t("clearFiles"),
								fileUploadFailed: t("fileUploadFailed"),
								fileUploaded: t("fileUploaded"),
								fileUploading: t("fileUploading"),
								removeFile: t("removeFile"),
								send: t("send"),
								stop: t("stop"),
								streaming: t("streaming"),
								uploadEmpty: t("uploadEmpty"),
								uploadHelper: t("uploadHelper"),
							}}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor={convId}>{t("conversationId")}</Label>
						<Input
							id={convId}
							name="conversationId"
							autoComplete="off"
							value={conversationId}
							onChange={(e) => setConversationId(e.currentTarget.value)}
							placeholder={t("conversationIdPlaceholder")}
						/>
					</div>
				</div>

				{answer && (
					<Card>
						<CardHeader>
							<CardTitle>{t("answer")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-sm">{answer}</p>
						</CardContent>
						{elapsed !== null && (
							<CardFooter>
								<span className="text-muted-foreground text-xs">{t("elapsedShort", { val: elapsed })}</span>
							</CardFooter>
						)}
					</Card>
				)}

				{entries.length > 0 && (
					<div className="text-muted-foreground text-xs">
						{t("eventsCount", { count: entries.filter((e) => e.event !== "ping").length })}
						{elapsed !== null && <> {t("elapsed", { val: elapsed })}</>}
					</div>
				)}
			</div>

			<div ref={scrollRef} className="overflow-y-auto p-4" aria-live="polite" aria-busy={streaming}>
				<div className="flex flex-col gap-1 [content-visibility:auto]">
					{entries.length === 0 && <p className="py-8 text-center text-muted-foreground text-sm">{t("emptyState")}</p>}
					{entries.map((entry, i) => (
						<div
							key={`${entry.receivedAt}-${i}`}
							className="flex items-start gap-2 rounded border p-2 font-mono text-xs"
						>
							<span className="w-20 shrink-0 text-right text-muted-foreground">
								{t("eventTimestamp", { val: entry.receivedAt })}
							</span>
							<EventBadge event={entry.event} />
							<pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all">
								{JSON.stringify(entry.data, null, 2)}
							</pre>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
