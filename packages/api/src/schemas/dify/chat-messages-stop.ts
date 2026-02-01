import * as z from "zod";

export const chatMessagesStopRequestSchema = z.object({
	task_id: z.string(),
	user: z.string(),
});

export const chatMessagesStopResponseSchema = z.object({
	result: z.literal("success"),
});

export type ChatMessagesStopRequest = z.infer<typeof chatMessagesStopRequestSchema>;
export type ChatMessagesStopResponse = z.infer<typeof chatMessagesStopResponseSchema>;
