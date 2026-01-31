import { z } from "zod";

import {
	agentNodeStrategySchema,
	chunkType,
	fileBelongsTo,
	metadataSchema,
	uploadFileSchema,
	workflowNodeExecutionStatus,
} from "./shared";

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export const chatMessagesRequestSchema = z.object({
	inputs: z.record(z.string(), z.unknown()),
	query: z.string(),
	files: z.array(uploadFileSchema).optional(),
	response_mode: z.enum(["blocking", "streaming"]).optional(),
	conversation_id: z.string().uuid().optional(),
	retriever_from: z.string().default("dev"),
	auto_generate_name: z.boolean().default(true),
	workflow_id: z.string().optional(),
	user: z.string(),
});

// ---------------------------------------------------------------------------
// Blocking Response
// ---------------------------------------------------------------------------

export const chatMessagesBlockingResponseSchema = z.object({
	event: z.literal("message"),
	task_id: z.string(),
	id: z.string(),
	message_id: z.string(),
	conversation_id: z.string(),
	mode: z.string(),
	answer: z.string(),
	metadata: metadataSchema,
	created_at: z.number(),
});

// ---------------------------------------------------------------------------
// SSE Stream Events — Base wrapper fields
// ---------------------------------------------------------------------------
// Every SSE event from /chat-messages is wrapped with:
//   conversation_id, message_id, created_at
// plus the inner event's own fields (spread at top level via model_dump).

const chatStreamBase = z.object({
	task_id: z.string(),
	conversation_id: z.string(),
	message_id: z.string(),
	created_at: z.number(),
});

// ---------------------------------------------------------------------------
// 1. message
// ---------------------------------------------------------------------------

export const messageEventSchema = chatStreamBase.extend({
	event: z.literal("message"),
	id: z.string(),
	answer: z.string(),
	from_variable_selector: z.array(z.string()).optional(),
	chunk_type: chunkType.optional(),
	tool_call_id: z.string().optional(),
	tool_name: z.string().optional(),
	tool_arguments: z.string().optional(),
	tool_files: z.array(z.string()).optional(),
	tool_error: z.string().optional(),
	tool_elapsed_time: z.number().optional(),
	tool_icon: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
	tool_icon_dark: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
});

// ---------------------------------------------------------------------------
// 2. agent_message
// ---------------------------------------------------------------------------

export const agentMessageEventSchema = chatStreamBase.extend({
	event: z.literal("agent_message"),
	id: z.string(),
	answer: z.string(),
});

// ---------------------------------------------------------------------------
// 3. agent_thought
// ---------------------------------------------------------------------------

export const agentThoughtEventSchema = chatStreamBase.extend({
	event: z.literal("agent_thought"),
	id: z.string(),
	position: z.number(),
	thought: z.string().nullable().optional(),
	observation: z.string().nullable().optional(),
	tool: z.string().nullable().optional(),
	tool_labels: z.record(z.string(), z.unknown()).optional(),
	tool_input: z.string().nullable().optional(),
	message_files: z.array(z.string()).nullable().optional(),
});

// ---------------------------------------------------------------------------
// 4. message_file
// ---------------------------------------------------------------------------

export const messageFileEventSchema = chatStreamBase.extend({
	event: z.literal("message_file"),
	id: z.string(),
	type: z.string(),
	belongs_to: fileBelongsTo,
	url: z.string(),
});

// ---------------------------------------------------------------------------
// 5. message_end
// ---------------------------------------------------------------------------

export const messageEndEventSchema = chatStreamBase.extend({
	event: z.literal("message_end"),
	id: z.string(),
	metadata: metadataSchema.optional(),
	files: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
});

// ---------------------------------------------------------------------------
// 6. message_replace
// ---------------------------------------------------------------------------

export const messageReplaceEventSchema = chatStreamBase.extend({
	event: z.literal("message_replace"),
	answer: z.string(),
	reason: z.string(),
});

// ---------------------------------------------------------------------------
// 7. tts_message
// ---------------------------------------------------------------------------

export const ttsMessageEventSchema = chatStreamBase.extend({
	event: z.literal("tts_message"),
	audio: z.string(),
});

// ---------------------------------------------------------------------------
// 8. tts_message_end
// ---------------------------------------------------------------------------

export const ttsMessageEndEventSchema = chatStreamBase.extend({
	event: z.literal("tts_message_end"),
	audio: z.string(),
});

// ---------------------------------------------------------------------------
// 9. error
// ---------------------------------------------------------------------------

export const errorEventSchema = z.object({
	event: z.literal("error"),
	conversation_id: z.string(),
	message_id: z.string(),
	created_at: z.number(),
	status: z.number(),
	code: z.string(),
	message: z.string(),
});

// ---------------------------------------------------------------------------
// 10. workflow_started
// ---------------------------------------------------------------------------

export const workflowStartedEventSchema = chatStreamBase.extend({
	event: z.literal("workflow_started"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		workflow_id: z.string(),
		inputs: z.record(z.string(), z.unknown()),
		created_at: z.number(),
	}),
});

// ---------------------------------------------------------------------------
// 11. workflow_finished
// ---------------------------------------------------------------------------

export const workflowFinishedEventSchema = chatStreamBase.extend({
	event: z.literal("workflow_finished"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		workflow_id: z.string(),
		status: z.enum(["succeeded", "failed", "partial-succeeded", "stopped"]),
		outputs: z.record(z.string(), z.unknown()).nullable().optional(),
		error: z.string().nullable().optional(),
		elapsed_time: z.number(),
		total_tokens: z.number(),
		total_steps: z.number(),
		created_by: z.record(z.string(), z.unknown()).optional(),
		created_at: z.number(),
		finished_at: z.number(),
		exceptions_count: z.number().nullable().optional(),
		files: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 12. node_started
// ---------------------------------------------------------------------------

export const nodeStartedEventSchema = chatStreamBase.extend({
	event: z.literal("node_started"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		index: z.number(),
		predecessor_node_id: z.string().nullable().optional(),
		inputs: z.record(z.string(), z.unknown()).nullable().optional(),
		inputs_truncated: z.boolean().optional(),
		created_at: z.number(),
		extras: z.record(z.string(), z.unknown()).optional(),
		iteration_id: z.string().nullable().optional(),
		loop_id: z.string().nullable().optional(),
		parent_node_id: z.string().nullable().optional(),
		agent_strategy: agentNodeStrategySchema.nullable().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 13. node_finished
// ---------------------------------------------------------------------------

export const nodeFinishedEventSchema = chatStreamBase.extend({
	event: z.literal("node_finished"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		index: z.number(),
		predecessor_node_id: z.string().nullable().optional(),
		inputs: z.record(z.string(), z.unknown()).nullable().optional(),
		inputs_truncated: z.boolean().optional(),
		process_data: z.record(z.string(), z.unknown()).nullable().optional(),
		process_data_truncated: z.boolean().optional(),
		outputs: z.record(z.string(), z.unknown()).nullable().optional(),
		outputs_truncated: z.boolean().optional(),
		status: z.string(),
		error: z.string().nullable().optional(),
		elapsed_time: z.number(),
		execution_metadata: z.record(z.string(), z.unknown()).nullable().optional(),
		created_at: z.number(),
		finished_at: z.number(),
		files: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
		iteration_id: z.string().nullable().optional(),
		loop_id: z.string().nullable().optional(),
		parent_node_id: z.string().nullable().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 14. node_retry
// ---------------------------------------------------------------------------

export const nodeRetryEventSchema = chatStreamBase.extend({
	event: z.literal("node_retry"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		index: z.number(),
		predecessor_node_id: z.string().nullable().optional(),
		inputs: z.record(z.string(), z.unknown()).nullable().optional(),
		inputs_truncated: z.boolean().optional(),
		process_data: z.record(z.string(), z.unknown()).nullable().optional(),
		process_data_truncated: z.boolean().optional(),
		outputs: z.record(z.string(), z.unknown()).nullable().optional(),
		outputs_truncated: z.boolean().optional(),
		status: z.string(),
		error: z.string().nullable().optional(),
		elapsed_time: z.number(),
		execution_metadata: z.record(z.string(), z.unknown()).nullable().optional(),
		created_at: z.number(),
		finished_at: z.number(),
		files: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
		iteration_id: z.string().nullable().optional(),
		loop_id: z.string().nullable().optional(),
		parent_node_id: z.string().nullable().optional(),
		retry_index: z.number(),
	}),
});

// ---------------------------------------------------------------------------
// 15. iteration_started
// ---------------------------------------------------------------------------

export const iterationStartedEventSchema = chatStreamBase.extend({
	event: z.literal("iteration_started"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		created_at: z.number(),
		extras: z.record(z.string(), z.unknown()).optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		inputs: z.record(z.string(), z.unknown()).optional(),
		inputs_truncated: z.boolean().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 16. iteration_next
// ---------------------------------------------------------------------------

export const iterationNextEventSchema = chatStreamBase.extend({
	event: z.literal("iteration_next"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		index: z.number(),
		created_at: z.number(),
		extras: z.record(z.string(), z.unknown()).optional(),
	}),
});

// ---------------------------------------------------------------------------
// 17. iteration_completed
// ---------------------------------------------------------------------------

export const iterationCompletedEventSchema = chatStreamBase.extend({
	event: z.literal("iteration_completed"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		outputs: z.record(z.string(), z.unknown()).nullable().optional(),
		outputs_truncated: z.boolean().optional(),
		created_at: z.number(),
		extras: z.record(z.string(), z.unknown()).nullable().optional(),
		inputs: z.record(z.string(), z.unknown()).nullable().optional(),
		inputs_truncated: z.boolean().optional(),
		status: workflowNodeExecutionStatus,
		error: z.string().nullable().optional(),
		elapsed_time: z.number(),
		total_tokens: z.number(),
		execution_metadata: z.record(z.string(), z.unknown()).optional(),
		finished_at: z.number(),
		steps: z.number(),
	}),
});

// ---------------------------------------------------------------------------
// 18. loop_started
// ---------------------------------------------------------------------------

export const loopStartedEventSchema = chatStreamBase.extend({
	event: z.literal("loop_started"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		created_at: z.number(),
		extras: z.record(z.string(), z.unknown()).optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		inputs: z.record(z.string(), z.unknown()).optional(),
		inputs_truncated: z.boolean().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 19. loop_next
// ---------------------------------------------------------------------------

export const loopNextEventSchema = chatStreamBase.extend({
	event: z.literal("loop_next"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		index: z.number(),
		created_at: z.number(),
		pre_loop_output: z.unknown().optional(),
		extras: z.record(z.string(), z.unknown()).optional(),
	}),
});

// ---------------------------------------------------------------------------
// 20. loop_completed
// ---------------------------------------------------------------------------

export const loopCompletedEventSchema = chatStreamBase.extend({
	event: z.literal("loop_completed"),
	workflow_run_id: z.string(),
	data: z.object({
		id: z.string(),
		node_id: z.string(),
		node_type: z.string(),
		title: z.string(),
		outputs: z.record(z.string(), z.unknown()).nullable().optional(),
		outputs_truncated: z.boolean().optional(),
		created_at: z.number(),
		extras: z.record(z.string(), z.unknown()).nullable().optional(),
		inputs: z.record(z.string(), z.unknown()).nullable().optional(),
		inputs_truncated: z.boolean().optional(),
		status: workflowNodeExecutionStatus,
		error: z.string().nullable().optional(),
		elapsed_time: z.number(),
		total_tokens: z.number(),
		execution_metadata: z.record(z.string(), z.unknown()).optional(),
		finished_at: z.number(),
		steps: z.number(),
	}),
});

// ---------------------------------------------------------------------------
// 21. text_chunk
// ---------------------------------------------------------------------------

export const textChunkEventSchema = chatStreamBase.extend({
	event: z.literal("text_chunk"),
	data: z.object({
		text: z.string(),
		from_variable_selector: z.array(z.string()).optional(),
		chunk_type: chunkType.optional(),
		tool_call_id: z.string().optional(),
		tool_name: z.string().optional(),
		tool_arguments: z.string().optional(),
		tool_files: z.array(z.string()).optional(),
		tool_error: z.string().optional(),
		tool_elapsed_time: z.number().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 22. text_replace
// ---------------------------------------------------------------------------

export const textReplaceEventSchema = chatStreamBase.extend({
	event: z.literal("text_replace"),
	data: z.object({
		text: z.string(),
	}),
});

// ---------------------------------------------------------------------------
// 23. agent_log
// ---------------------------------------------------------------------------

export const agentLogEventSchema = chatStreamBase.extend({
	event: z.literal("agent_log"),
	data: z.object({
		node_execution_id: z.string(),
		message_id: z.string(),
		label: z.string(),
		parent_id: z.string().nullable().optional(),
		error: z.string().nullable().optional(),
		status: z.string(),
		data: z.record(z.string(), z.unknown()),
		metadata: z.record(z.string(), z.unknown()).optional(),
		node_id: z.string(),
	}),
});

// ---------------------------------------------------------------------------
// 24. ping (special: sent as "event: ping\n\n", not "data: {json}\n\n")
// ---------------------------------------------------------------------------

export const pingEventSchema = z.object({
	event: z.literal("ping"),
});

// ---------------------------------------------------------------------------
// Discriminated Union — All SSE events for /chat-messages
// ---------------------------------------------------------------------------

export const chatMessagesStreamEventSchema = z.discriminatedUnion("event", [
	messageEventSchema,
	agentMessageEventSchema,
	agentThoughtEventSchema,
	messageFileEventSchema,
	messageEndEventSchema,
	messageReplaceEventSchema,
	ttsMessageEventSchema,
	ttsMessageEndEventSchema,
	errorEventSchema,
	workflowStartedEventSchema,
	workflowFinishedEventSchema,
	nodeStartedEventSchema,
	nodeFinishedEventSchema,
	nodeRetryEventSchema,
	iterationStartedEventSchema,
	iterationNextEventSchema,
	iterationCompletedEventSchema,
	loopStartedEventSchema,
	loopNextEventSchema,
	loopCompletedEventSchema,
	textChunkEventSchema,
	textReplaceEventSchema,
	agentLogEventSchema,
	pingEventSchema,
]);

// ---------------------------------------------------------------------------
// Type Exports
// ---------------------------------------------------------------------------

export type ChatMessagesRequest = z.infer<typeof chatMessagesRequestSchema>;
export type ChatMessagesBlockingResponse = z.infer<typeof chatMessagesBlockingResponseSchema>;
export type ChatMessagesStreamEvent = z.infer<typeof chatMessagesStreamEventSchema>;

export type MessageEvent = z.infer<typeof messageEventSchema>;
export type AgentMessageEvent = z.infer<typeof agentMessageEventSchema>;
export type AgentThoughtEvent = z.infer<typeof agentThoughtEventSchema>;
export type MessageFileEvent = z.infer<typeof messageFileEventSchema>;
export type MessageEndEvent = z.infer<typeof messageEndEventSchema>;
export type MessageReplaceEvent = z.infer<typeof messageReplaceEventSchema>;
export type TtsMessageEvent = z.infer<typeof ttsMessageEventSchema>;
export type TtsMessageEndEvent = z.infer<typeof ttsMessageEndEventSchema>;
export type ErrorEvent = z.infer<typeof errorEventSchema>;
export type WorkflowStartedEvent = z.infer<typeof workflowStartedEventSchema>;
export type WorkflowFinishedEvent = z.infer<typeof workflowFinishedEventSchema>;
export type NodeStartedEvent = z.infer<typeof nodeStartedEventSchema>;
export type NodeFinishedEvent = z.infer<typeof nodeFinishedEventSchema>;
export type NodeRetryEvent = z.infer<typeof nodeRetryEventSchema>;
export type IterationStartedEvent = z.infer<typeof iterationStartedEventSchema>;
export type IterationNextEvent = z.infer<typeof iterationNextEventSchema>;
export type IterationCompletedEvent = z.infer<typeof iterationCompletedEventSchema>;
export type LoopStartedEvent = z.infer<typeof loopStartedEventSchema>;
export type LoopNextEvent = z.infer<typeof loopNextEventSchema>;
export type LoopCompletedEvent = z.infer<typeof loopCompletedEventSchema>;
export type TextChunkEvent = z.infer<typeof textChunkEventSchema>;
export type TextReplaceEvent = z.infer<typeof textReplaceEventSchema>;
export type AgentLogEvent = z.infer<typeof agentLogEventSchema>;
export type PingEvent = z.infer<typeof pingEventSchema>;
