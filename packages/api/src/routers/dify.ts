import { env } from "@flux/env/server";
import { authed } from "../index";
import { parseDifySSE } from "../lib/sse";
import { chatMessagesBlockingResponseSchema } from "../schemas/dify/chat-messages";

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

const chatMessages = authed.dify.chatMessages.handler(async ({ input, context }) => {
	const res = await fetchDify("/chat-messages", { ...input, user: context.session.user.id, response_mode: "blocking" });

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Dify API error (${res.status}): ${text}`);
	}

	return chatMessagesBlockingResponseSchema.parse(await res.json());
});

const chatMessagesStream = authed.dify.chatMessagesStream.handler(async function* ({ input, context, signal }) {
	const res = await fetchDify(
		"/chat-messages",
		{ ...input, user: context.session.user.id, response_mode: "streaming" },
		signal,
	);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Dify API error (${res.status}): ${text}`);
	}

	if (!res.body) throw new Error("No response body");

	yield* parseDifySSE(res.body);
});

export const difyRouter = { chatMessages, chatMessagesStream };
