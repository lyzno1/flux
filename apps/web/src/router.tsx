import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, ErrorComponent } from "@tanstack/react-router";
import { PageLoading } from "./components/page-loading";
import { orpc, queryClient } from "./lib/orpc";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	defaultPendingComponent: () => <PageLoading />,
	defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
	scrollRestoration: true,
	context: { orpc, queryClient, auth: undefined as never },
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
