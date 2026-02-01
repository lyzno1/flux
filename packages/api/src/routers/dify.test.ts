import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockAuth, mockGetSession } from "../testing/mock-auth";
import { mockEnv } from "../testing/mock-env";
import { createMockSession, createTestContext } from "../testing/setup";

vi.mock("@flux/auth", () => ({ auth: mockAuth }));
vi.mock("@flux/env/server", () => ({ env: mockEnv }));

const mockFetch = vi.fn();
beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
});

const { appRouter } = await import("./index");
const { call } = await import("@orpc/server");

const difyInput = {
	inputs: {},
	query: "hello",
};

function authenticateSession() {
	const session = createMockSession();
	mockGetSession.mockResolvedValueOnce(session);
	return session;
}

describe("dify.chatMessages", () => {
	it("returns parsed blocking response on success", async () => {
		const session = authenticateSession();
		const body = {
			event: "message",
			task_id: "task-1",
			id: "msg-1",
			message_id: "msg-1",
			conversation_id: "conv-1",
			mode: "chat",
			answer: "Hello!",
			metadata: {},
			created_at: 1700000000,
		};

		mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 200 }));

		const result = await call(appRouter.dify.chatMessages, difyInput, {
			context: createTestContext(),
		});

		expect(result).toEqual(body);
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockEnv.DIFY_API_URL}/chat-messages`,
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({ Authorization: `Bearer ${mockEnv.DIFY_API_KEY}` }),
			}),
		);
		expect(JSON.parse(mockFetch.mock.lastCall?.[1]?.body as string)).toMatchObject({
			...difyInput,
			user: session.user.id,
			response_mode: "blocking",
		});
	});

	it("throws on API error", async () => {
		authenticateSession();
		mockFetch.mockResolvedValueOnce(new Response("Internal Server Error", { status: 500 }));

		await expect(
			call(appRouter.dify.chatMessages, difyInput, {
				context: createTestContext(),
			}),
		).rejects.toThrow("Dify API error (500)");
	});
});

describe("dify.chatMessagesStream", () => {
	it("yields parsed SSE events", async () => {
		authenticateSession();

		const ssePayload =
			'data: {"event":"message","task_id":"t1","id":"m1","message_id":"m1","conversation_id":"c1","answer":"Hi","created_at":1700000000}\n\n';
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new TextEncoder().encode(ssePayload));
				controller.close();
			},
		});

		mockFetch.mockResolvedValueOnce(new Response(stream, { status: 200 }));

		const events: unknown[] = [];
		const iter = await call(appRouter.dify.chatMessagesStream, difyInput, {
			context: createTestContext(),
		});
		for await (const event of iter) {
			events.push(event);
		}

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			event: "message",
			answer: "Hi",
		});
	});

	it("throws when response body is null", async () => {
		authenticateSession();

		const res = new Response(null, { status: 200 });
		Object.defineProperty(res, "body", { value: null });
		mockFetch.mockResolvedValueOnce(res);

		const iter = await call(appRouter.dify.chatMessagesStream, difyInput, {
			context: createTestContext(),
		});
		await expect(async () => {
			for await (const _ of iter) {
				/* drain */
			}
		}).rejects.toThrow("No response body");
	});

	it("throws on API error", async () => {
		authenticateSession();
		mockFetch.mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }));

		const iter = await call(appRouter.dify.chatMessagesStream, difyInput, {
			context: createTestContext(),
		});
		await expect(async () => {
			for await (const _ of iter) {
				/* drain */
			}
		}).rejects.toThrow("Dify API error (502)");
	});
});

describe("dify.chatMessagesStop", () => {
	it("returns success on stop", async () => {
		const session = authenticateSession();
		mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ result: "success" }), { status: 200 }));

		const result = await call(
			appRouter.dify.chatMessagesStop,
			{ task_id: "task-1" },
			{
				context: createTestContext(),
			},
		);

		expect(result).toEqual({ result: "success" });
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockEnv.DIFY_API_URL}/chat-messages/task-1/stop`,
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({ Authorization: `Bearer ${mockEnv.DIFY_API_KEY}` }),
			}),
		);
		expect(JSON.parse(mockFetch.mock.lastCall?.[1]?.body as string)).toMatchObject({
			user: session.user.id,
		});
	});

	it("throws on API error", async () => {
		authenticateSession();
		mockFetch.mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

		await expect(
			call(
				appRouter.dify.chatMessagesStop,
				{ task_id: "task-1" },
				{
					context: createTestContext(),
				},
			),
		).rejects.toThrow("Dify API error (404)");
	});
});

describe("dify.filePreview", () => {
	const fileId = "550e8400-e29b-41d4-a716-446655440000";

	it("returns a File on success", async () => {
		const session = authenticateSession();
		const blob = new Blob(["image-data"], { type: "image/png" });
		const res = new Response(blob, {
			status: 200,
			headers: {
				"Content-Type": "image/png",
				"Content-Disposition": "inline; filename*=UTF-8''test.png",
			},
		});
		mockFetch.mockResolvedValueOnce(res);

		const result = await call(appRouter.dify.filePreview, { file_id: fileId }, { context: createTestContext() });

		expect(result).toBeInstanceOf(File);
		expect(result.type).toBe("image/png");
		expect(result.name).toBe("test.png");
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockEnv.DIFY_API_URL}/files/${fileId}/preview?user=${session.user.id}&as_attachment=false`,
			expect.objectContaining({
				method: "GET",
				headers: expect.objectContaining({ Authorization: `Bearer ${mockEnv.DIFY_API_KEY}` }),
			}),
		);
	});

	it("throws on API error", async () => {
		authenticateSession();
		mockFetch.mockResolvedValueOnce(new Response("Forbidden", { status: 403 }));

		await expect(
			call(appRouter.dify.filePreview, { file_id: fileId }, { context: createTestContext() }),
		).rejects.toThrow("Dify API error (403)");
	});
});

describe("dify.fileUpload", () => {
	it("returns parsed file response on success", async () => {
		const session = authenticateSession();
		const body = {
			id: "file-1",
			name: "test.png",
			size: 1024,
			extension: "png",
			mime_type: "image/png",
			created_by: session.user.id,
			created_at: 1700000000,
		};

		mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 201 }));

		const file = new File(["test"], "test.png", { type: "image/png" });
		const result = await call(appRouter.dify.fileUpload, { file }, { context: createTestContext() });

		expect(result).toMatchObject(body);
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockEnv.DIFY_API_URL}/files/upload`,
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({ Authorization: `Bearer ${mockEnv.DIFY_API_KEY}` }),
			}),
		);

		const sentFormData = mockFetch.mock.lastCall?.[1]?.body as FormData;
		expect(sentFormData.get("user")).toBe(session.user.id);
		expect(sentFormData.get("file")).toBeInstanceOf(File);
	});

	it("throws on API error", async () => {
		authenticateSession();
		mockFetch.mockResolvedValueOnce(new Response("Unsupported Media Type", { status: 415 }));

		const file = new File(["test"], "test.xyz", { type: "application/octet-stream" });
		await expect(call(appRouter.dify.fileUpload, { file }, { context: createTestContext() })).rejects.toThrow(
			"Dify API error (415)",
		);
	});
});
