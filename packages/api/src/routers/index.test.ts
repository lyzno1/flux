import { describe, expect, it, vi } from "vitest";

import { mockAuth, mockGetSession } from "../testing/mock-auth";
import { mockEnv } from "../testing/mock-env";
import { createMockSession, createTestContext } from "../testing/setup";

vi.mock("@flux/auth", () => ({ auth: mockAuth }));
vi.mock("@flux/env/server", () => ({ env: mockEnv }));

const { appRouter } = await import("./index");
const { call } = await import("@orpc/server");

describe("healthCheck", () => {
	it("returns OK", async () => {
		const result = await call(appRouter.healthCheck, undefined, {
			context: createTestContext(),
		});
		expect(result).toBe("OK");
	});
});

describe("privateData", () => {
	it("returns user data when authenticated", async () => {
		const session = createMockSession();
		mockGetSession.mockResolvedValueOnce(session);

		const result = await call(appRouter.privateData, undefined, {
			context: createTestContext(),
		});

		expect(result).toEqual({
			message: "This is private",
			user: session.user,
		});
	});

	it("throws UNAUTHORIZED when not authenticated", async () => {
		mockGetSession.mockResolvedValueOnce(null);

		await expect(
			call(appRouter.privateData, undefined, {
				context: createTestContext(),
			}),
		).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));
	});
});
