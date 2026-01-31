import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

import { DevtoolsLoader } from "@/components/devtools/loader";
import Header from "@/components/header";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { STORAGE_KEYS } from "@/config/storage-keys";
import type { orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
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

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				disableTransitionOnChange
				storageKey={STORAGE_KEYS.LOCAL.THEME}
			>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<Suspense fallback={<Loader />}>
						<Outlet />
					</Suspense>
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<DevtoolsLoader />
		</>
	);
}
