import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, useMatches } from "@tanstack/react-router";
import type * as React from "react";
import { lazy, Suspense, useId } from "react";
import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
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

type BrandingVariant = "home" | "auth" | "none";

function BrandingViewport({
	variant,
	contentId,
	children,
}: {
	variant: BrandingVariant;
	contentId: string;
	children: React.ReactNode;
}) {
	if (variant === "auth") {
		return (
			<div className="grid h-full overflow-hidden lg:grid-cols-[minmax(24rem,36rem)_1px_1fr] xl:grid-cols-[minmax(26rem,40rem)_1px_1fr]">
				<AuthBrandPanel />
				<div className="hidden bg-border lg:block" />
				<main id={contentId} className="min-h-0 overflow-y-auto bg-surface-1">
					{children}
				</main>
			</div>
		);
	}

	if (variant === "home") {
		return (
			<div className="relative h-full overflow-hidden">
				<AuthBrandPanel variant="fullscreen" className="absolute inset-0" />
				<main id={contentId} className="relative z-10 h-full overflow-y-auto">
					{children}
				</main>
			</div>
		);
	}

	return (
		<main id={contentId} className="h-full overflow-y-auto">
			{children}
		</main>
	);
}

function RootComponent() {
	const matches = useMatches();
	const contentId = useId();
	const isAuthRoute = matches.some((match) => match.routeId === "/_auth" || match.routeId.startsWith("/_auth/"));
	const isHomeRoute = matches.some((match) => match.routeId === "/");
	const brandingVariant: BrandingVariant = isAuthRoute ? "auth" : isHomeRoute ? "home" : "none";

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
				<div className="relative grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<div className="relative z-10 min-h-0 overflow-hidden">
						<BrandingViewport variant={brandingVariant} contentId={contentId}>
							<Suspense fallback={<PageLoading />}>
								<Outlet />
							</Suspense>
						</BrandingViewport>
					</div>
				</div>
				<Toaster richColors />
				<GoogleOneTap />
			</ThemeProvider>
			<DevtoolsLoader />
		</>
	);
}
