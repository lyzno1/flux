import { eventIterator, oc } from "@orpc/contract";

import {
	chatMessagesBlockingResponseSchema,
	chatMessagesRequestSchema,
	chatMessagesStreamEventSchema,
} from "../schemas/dify/chat-messages";

const chatMessagesInput = chatMessagesRequestSchema.omit({ response_mode: true });

export const dify = {
	chatMessages: oc
		.route({
			method: "POST",
			path: "/dify/chat-messages",
			summary: "Send chat message (blocking)",
			tags: ["Dify"],
		})
		.input(chatMessagesInput)
		.output(chatMessagesBlockingResponseSchema),

	chatMessagesStream: oc
		.route({
			method: "POST",
			path: "/dify/chat-messages/stream",
			summary: "Send chat message (streaming SSE)",
			tags: ["Dify"],
		})
		.input(chatMessagesInput)
		.output(eventIterator(chatMessagesStreamEventSchema)),
};
