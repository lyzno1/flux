import { z } from "zod";

export const fileTransferMethod = z.enum(["remote_url", "local_file", "tool_file", "datasource_file"]);

export const fileType = z.enum(["image", "document", "audio", "video", "custom"]);

export const fileBelongsTo = z.enum(["user", "assistant"]);

export const uploadFileSchema = z.object({
	type: fileType.optional(),
	transfer_method: fileTransferMethod,
	url: z.string().optional(),
	remote_url: z.string().optional(),
	upload_file_id: z.string().optional(),
	tool_file_id: z.string().optional(),
	datasource_file_id: z.string().optional(),
});

const decimalValue = z.union([z.number(), z.string()]);

export const usageSchema = z.object({
	prompt_tokens: z.number(),
	prompt_unit_price: decimalValue,
	prompt_price_unit: decimalValue,
	prompt_price: decimalValue,
	completion_tokens: z.number(),
	completion_unit_price: decimalValue,
	completion_price_unit: decimalValue,
	completion_price: decimalValue,
	total_tokens: z.number(),
	total_price: decimalValue,
	currency: z.string(),
	latency: z.number(),
	time_to_first_token: z.number().nullable().optional(),
	time_to_generate: z.number().nullable().optional(),
});

export const retrieverResourceSchema = z.object({
	position: z.number().nullable().optional(),
	dataset_id: z.string().nullable().optional(),
	dataset_name: z.string().nullable().optional(),
	document_id: z.string().nullable().optional(),
	document_name: z.string().nullable().optional(),
	data_source_type: z.string().nullable().optional(),
	segment_id: z.string().nullable().optional(),
	retriever_from: z.string().nullable().optional(),
	score: z.number().nullable().optional(),
	hit_count: z.number().nullable().optional(),
	word_count: z.number().nullable().optional(),
	segment_position: z.number().nullable().optional(),
	index_node_hash: z.string().nullable().optional(),
	content: z.string().nullable().optional(),
	page: z.number().nullable().optional(),
	doc_metadata: z.record(z.string(), z.unknown()).nullable().optional(),
	title: z.string().nullable().optional(),
	files: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
	summary: z.string().nullable().optional(),
});

export const annotationReplySchema = z.object({
	id: z.string(),
	account: z.object({
		id: z.string(),
		name: z.string(),
	}),
});

export const metadataSchema = z.object({
	usage: usageSchema.optional(),
	retriever_resources: z.array(retrieverResourceSchema).optional(),
	annotation_reply: annotationReplySchema.optional(),
});

export const workflowNodeExecutionStatus = z.enum([
	"succeeded",
	"failed",
	"exception",
	"stopped",
	"pending",
	"running",
	"paused",
	"retry",
]);

export const agentNodeStrategySchema = z.object({
	name: z.string(),
	icon: z.string().nullable().optional(),
});

export const chunkType = z.enum(["text", "tool_call", "tool_result", "thought", "thought_start", "thought_end"]);
