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
