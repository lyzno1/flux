import { env } from "@flux/env/server";
import { authed } from "../index";
import type { ChatMessagesBlockingResponse } from "../schemas/dify/chat-messages";

function fetchDify(path: string, body: Record<string, unknown>, signal?: AbortSignal) {
	return fetch(`${env.DIFY_API_URL}${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.DIFY_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		signal,
	});
}

function* parseSSELines(lines: string[], state: { currentEvent: string }) {
	for (const line of lines) {
		if (line.startsWith("event: ")) {
			state.currentEvent = line.slice(7).trim();
		} else if (line.startsWith("data: ")) {
			yield JSON.parse(line.slice(6));
			state.currentEvent = "";
		} else if (line === "" && state.currentEvent === "ping") {
			yield { event: "ping" as const };
			state.currentEvent = "";
		}
	}
}

async function* parseDifySSE(stream: ReadableStream<Uint8Array>) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	const state = { currentEvent: "" };

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";

			yield* parseSSELines(lines, state);
		}
	} finally {
		reader.releaseLock();
	}
}

const chatMessages = authed.dify.chatMessages.handler(async ({ input }) => {
	const res = await fetchDify("/chat-messages", { ...input, response_mode: "blocking" });

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Dify API error (${res.status}): ${text}`);
	}

	return (await res.json()) as ChatMessagesBlockingResponse;
});

const chatMessagesStream = authed.dify.chatMessagesStream.handler(async function* ({ input, signal }) {
	const res = await fetchDify("/chat-messages", { ...input, response_mode: "streaming" }, signal);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Dify API error (${res.status}): ${text}`);
	}

	if (!res.body) throw new Error("No response body");

	yield* parseDifySSE(res.body);
});

export const difyRouter = { chatMessages, chatMessagesStream };
