import { env } from "@flux/env/server";
import { authed } from "../index";
import { parseDifySSE } from "../lib/sse";
import { chatMessagesBlockingResponseSchema } from "../schemas/dify/chat-messages";
import { chatMessagesStopResponseSchema } from "../schemas/dify/chat-messages-stop";
import { filePreviewResponseSchema } from "../schemas/dify/file-preview";
import { fileUploadResponseSchema } from "../schemas/dify/file-upload";

function assertDifyConfigured(): { url: string; key: string } {
	if (!env.DIFY_API_URL || !env.DIFY_API_KEY) {
		throw new Error("Dify is not configured: DIFY_API_URL and DIFY_API_KEY are required");
	}
	return { url: env.DIFY_API_URL, key: env.DIFY_API_KEY };
}

async function assertOk(res: Response): Promise<void> {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Dify API error (${res.status}): ${text}`);
	}
}

function fetchDifyGet(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<Response> {
	const { url, key } = assertDifyConfigured();
	const query = new URLSearchParams(params).toString();

	return fetch(`${url}${path}?${query}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${key}`,
		},
		signal,
	});
}

function fetchDifyJson(path: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
	const { url, key } = assertDifyConfigured();

	return fetch(`${url}${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		signal,
	});
}

function fetchDifyMultipart(path: string, formData: FormData, signal?: AbortSignal): Promise<Response> {
	const { url, key } = assertDifyConfigured();

	return fetch(`${url}${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${key}`,
		},
		body: formData,
		signal,
	});
}

const chatMessages = authed.dify.chatMessages.handler(async ({ input, context }) => {
	const res = await fetchDifyJson("/chat-messages", {
		...input,
		user: context.session.user.id,
		response_mode: "blocking",
	});
	await assertOk(res);

	return chatMessagesBlockingResponseSchema.parse(await res.json());
});

const chatMessagesStream = authed.dify.chatMessagesStream.handler(async function* ({ input, context, signal }) {
	const res = await fetchDifyJson(
		"/chat-messages",
		{ ...input, user: context.session.user.id, response_mode: "streaming" },
		signal,
	);
	await assertOk(res);

	if (!res.body) throw new Error("No response body");

	yield* parseDifySSE(res.body);
});

const chatMessagesStop = authed.dify.chatMessagesStop.handler(async ({ input, context }) => {
	const res = await fetchDifyJson(`/chat-messages/${input.task_id}/stop`, {
		user: context.session.user.id,
	});
	await assertOk(res);

	return chatMessagesStopResponseSchema.parse(await res.json());
});

const filePreview = authed.dify.filePreview.handler(async ({ input, context }) => {
	const res = await fetchDifyGet(`/files/${input.file_id}/preview`, {
		user: context.session.user.id,
		as_attachment: String(input.as_attachment),
	});
	await assertOk(res);

	const blob = await res.blob();
	const contentDisposition = res.headers.get("Content-Disposition");
	const filename = contentDisposition?.match(/filename\*?=(?:UTF-8'')?(.+)/)?.[1] ?? input.file_id;

	return filePreviewResponseSchema.parse(new File([blob], decodeURIComponent(filename), { type: blob.type }));
});

const fileUpload = authed.dify.fileUpload.handler(async ({ input, context }) => {
	const formData = new FormData();
	formData.append("file", input.file);
	formData.append("user", context.session.user.id);

	const res = await fetchDifyMultipart("/files/upload", formData);
	await assertOk(res);

	return fileUploadResponseSchema.parse(await res.json());
});

export const difyRouter = { chatMessages, chatMessagesStream, chatMessagesStop, filePreview, fileUpload };
