import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import * as z from "zod";

const authSearchSchema = z.object({
	redirect: z
		.string()
		.default("/dashboard")
		.catch("/dashboard")
		.transform((v) => (v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

const AUTH_PATHS = ["/login", "/sign-up", "/otp", "/verify-email", "/forgot-password", "/reset-password"] as const;

type AuthPath = (typeof AUTH_PATHS)[number];

interface RenderAuthRouteOptions {
	path: AuthPath;
	initialSearch?: Record<string, string>;
	routeSearch?: z.ZodTypeAny;
}

export function renderAuthRoute(Component: React.ComponentType, options: RenderAuthRouteOptions) {
	const rootRoute = createRootRoute({ component: Outlet });

	const authLayout = createRoute({
		getParentRoute: () => rootRoute,
		id: "_auth",
		validateSearch: authSearchSchema,
		component: Outlet,
	});

	const routes = AUTH_PATHS.map((p) => {
		const routeComponent = p === options.path ? (Component as () => React.ReactNode) : () => null;
		return createRoute({
			getParentRoute: () => authLayout,
			path: p,
			validateSearch: p === options.path ? options.routeSearch : undefined,
			component: routeComponent,
		});
	});

	const catchAllRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "$",
		component: () => null,
	});

	const routeTree = rootRoute.addChildren([authLayout.addChildren(routes), catchAllRoute]);

	const searchParams = new URLSearchParams(options.initialSearch);
	const searchStr = searchParams.toString();
	const initialUrl = options.path + (searchStr ? `?${searchStr}` : "");

	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: [initialUrl] }),
		defaultPendingMinMs: 0,
	});

	const user = userEvent.setup();
	const result = render(<RouterProvider router={router} />);

	return { ...result, router, user };
}
