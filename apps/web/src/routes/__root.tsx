import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, useMatches } from "@tanstack/react-router";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { DevtoolsLoader } from "@/components/devtools/loader";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { STORAGE_KEYS } from "@/config/storage-keys";
import type { authClient } from "@/lib/auth-client";
import type { orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
	auth: ReturnType<typeof authClient.useSession>;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	head: () => ({
		meta: [
			{
				title: "flux",
			},
			{
				name: "description",
				content: "flux is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function NotFoundComponent() {
	const { t } = useTranslation();
	return <div>{t("error.notFound")}</div>;
}

function RootComponent() {
	const matches = useMatches();
	const contentId = useId();
	const isAuthenticatedRoute = matches.some(
		(match) => match.routeId === "/_authenticated" || match.routeId.startsWith("/_authenticated/"),
	);

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				disableTransitionOnChange
				storageKey={STORAGE_KEYS.LOCAL.THEME}
			>
				<a
					href={`#${contentId}`}
					className="sr-only top-4 left-4 z-50 rounded-full bg-background px-3 py-2 text-sm focus:not-sr-only focus:absolute focus-visible:ring-2 focus-visible:ring-ring"
				>
					Skip to content
				</a>
				<div className="relative h-svh overflow-hidden">
					<main id={contentId} className="h-full overflow-y-auto">
						<Outlet />
					</main>
					{!isAuthenticatedRoute && <Header />}
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<DevtoolsLoader />
		</>
	);
}
