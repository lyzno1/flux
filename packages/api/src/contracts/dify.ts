import { eventIterator, oc } from "@orpc/contract";

import {
	chatMessagesBlockingResponseSchema,
	chatMessagesRequestSchema,
	chatMessagesStreamEventSchema,
} from "../schemas/dify/chat-messages";
import { chatMessagesStopRequestSchema, chatMessagesStopResponseSchema } from "../schemas/dify/chat-messages-stop";
import { filePreviewRequestSchema, filePreviewResponseSchema } from "../schemas/dify/file-preview";
import { fileUploadRequestSchema, fileUploadResponseSchema } from "../schemas/dify/file-upload";

const chatMessagesInput = chatMessagesRequestSchema.omit({ response_mode: true, user: true });

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

	chatMessagesStop: oc
		.route({
			method: "POST",
			path: "/dify/chat-messages/{task_id}/stop",
			summary: "Stop a streaming chat message generation",
			tags: ["Dify"],
		})
		.input(chatMessagesStopRequestSchema.omit({ user: true }))
		.output(chatMessagesStopResponseSchema),

	filePreview: oc
		.route({
			method: "GET",
			path: "/dify/files/{file_id}/preview",
			summary: "Preview an uploaded file",
			tags: ["Dify"],
		})
		.input(filePreviewRequestSchema.omit({ user: true }))
		.output(filePreviewResponseSchema),

	fileUpload: oc
		.route({
			method: "POST",
			path: "/dify/files/upload",
			summary: "Upload a file for use in conversations",
			tags: ["Dify"],
		})
		.input(fileUploadRequestSchema)
		.output(fileUploadResponseSchema),
};
