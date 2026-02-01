import * as z from "zod";

export const filePreviewRequestSchema = z.object({
	file_id: z.uuid(),
	as_attachment: z.boolean().default(false),
	user: z.string(),
});

export const filePreviewResponseSchema = z.instanceof(File);

export type FilePreviewRequest = z.infer<typeof filePreviewRequestSchema>;
export type FilePreviewResponse = z.infer<typeof filePreviewResponseSchema>;
