import "@/test/routes/mocks";

import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";
import { createMockContext } from "@/test/mock-context";

describe("route /", () => {
	it("redirects authenticated users to /dify", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/",
			routerContext: createMockContext({ authenticated: true }),
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/dify");
		});
	});

	it("stays on / for unauthenticated users", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/",
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/");
			expect(router.state.matches[router.state.matches.length - 1]?.routeId).toBe("/");
		});
	});
});
