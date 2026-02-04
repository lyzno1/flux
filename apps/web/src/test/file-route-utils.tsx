import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RouterAppContext } from "@/routes/__root";
import { routeTree } from "@/routeTree.gen";
import { createMockContext } from "./mock-context";

export function createTestRouterFromFiles(initialLocation = "/", routerContext?: Partial<RouterAppContext>) {
	const mockContext = createMockContext({
		authenticated: !!routerContext?.auth?.data,
	});
	const mergedContext: RouterAppContext = { ...mockContext, ...routerContext };

	return createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: [initialLocation] }),
		context: mergedContext,
		defaultPendingMinMs: 0,
	});
}

interface RenderWithFileRoutesOptions {
	initialLocation?: string;
	routerContext?: Partial<RouterAppContext>;
}

export function renderWithFileRoutes({ initialLocation = "/", routerContext }: RenderWithFileRoutesOptions = {}) {
	const router = createTestRouterFromFiles(initialLocation, routerContext);
	const user = userEvent.setup();

	const result = render(
		<QueryClientProvider client={router.options.context.queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	);

	return { ...result, router, user };
}
