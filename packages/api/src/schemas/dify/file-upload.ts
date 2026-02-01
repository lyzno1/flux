import * as z from "zod";

export const fileUploadRequestSchema = z.object({
	file: z.file(),
});

export const fileUploadResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	size: z.number(),
	extension: z.string().nullable().optional(),
	mime_type: z.string().nullable().optional(),
	created_by: z.string().nullable().optional(),
	created_at: z.number().nullable().optional(),
	preview_url: z.string().nullable().optional(),
	source_url: z.string().nullable().optional(),
	original_url: z.string().nullable().optional(),
	user_id: z.string().nullable().optional(),
	tenant_id: z.string().nullable().optional(),
	conversation_id: z.string().nullable().optional(),
	file_key: z.string().nullable().optional(),
});

export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
