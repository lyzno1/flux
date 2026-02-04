import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

import { DevtoolsLoader } from "@/components/devtools/loader";
import { Header } from "@/components/header";
import { PageLoading } from "@/components/page-loading";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { STORAGE_KEYS } from "@/config/storage-keys";
import type { authClient } from "@/lib/auth-client";
import type { orpc } from "@/utils/orpc";

import "../index.css";

const GoogleOneTap = lazy(() => import("@/components/google-one-tap").then((m) => ({ default: m.GoogleOneTap })));

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
					<div className="relative min-h-0 overflow-auto">
						<Suspense fallback={<PageLoading />}>
							<Outlet />
						</Suspense>
					</div>
				</div>
				<Toaster richColors />
				<GoogleOneTap />
			</ThemeProvider>
			<DevtoolsLoader />
		</>
	);
}
