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
});
