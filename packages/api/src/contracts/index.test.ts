import { describe, expect, it } from "vitest";
import { contract } from "./index";

describe("contracts", () => {
	it("defines healthCheck as GET /health", () => {
		expect(contract.healthCheck["~orpc"]).toMatchObject({
			route: expect.objectContaining({
				method: "GET",
				path: "/health",
			}),
		});
	});

	it("defines privateData as GET /private", () => {
		expect(contract.privateData["~orpc"]).toMatchObject({
			route: expect.objectContaining({
				method: "GET",
				path: "/private",
			}),
		});
	});

	it("defines dify.chatMessages as POST /dify/chat-messages", () => {
		expect(contract.dify.chatMessages["~orpc"]).toMatchObject({
			route: expect.objectContaining({
				method: "POST",
				path: "/dify/chat-messages",
			}),
		});
	});

	it("defines dify.chatMessagesStream as POST /dify/chat-messages/stream", () => {
		expect(contract.dify.chatMessagesStream["~orpc"]).toMatchObject({
			route: expect.objectContaining({
				method: "POST",
				path: "/dify/chat-messages/stream",
			}),
		});
	});

	it("defines dify.chatMessagesStop as POST /dify/chat-messages/{task_id}/stop", () => {
		expect(contract.dify.chatMessagesStop["~orpc"]).toMatchObject({
			route: expect.objectContaining({
				method: "POST",
				path: "/dify/chat-messages/{task_id}/stop",
			}),
		});
	});

	it("defines dify.filePreview as GET /dify/files/{file_id}/preview", () => {
		expect(contract.dify.filePreview["~orpc"]).toMatchObject({
			route: expect.objectContaining({
				method: "GET",
				path: "/dify/files/{file_id}/preview",
			}),
		});
	});

	it("defines dify.fileUpload as POST /dify/files/upload", () => {
		expect(contract.dify.fileUpload["~orpc"]).toMatchObject({
			route: expect.objectContaining({
				method: "POST",
				path: "/dify/files/upload",
			}),
		});
	});
});
