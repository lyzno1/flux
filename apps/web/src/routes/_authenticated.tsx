import { useHotkey } from "@tanstack/react-hotkeys";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PanelLeftIcon } from "lucide-react";
import { AppSidebar, toggleButtonStyles } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar/sidebar-inset";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { getRelativeRedirectFromHref } from "@/lib/auth/redirect";
import { getAppStoreState } from "@/stores/app/store";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context, location }) => {
		if (!context.auth.data) {
			throw redirect({
				to: "/login",
				search: { redirect: getRelativeRedirectFromHref(location.href) },
			});
		}
		return { session: context.auth.data };
	},
	component: AuthenticatedLayout,
});

function MobileHeader() {
	const isMobile = useIsMobile();

	if (!isMobile) return null;

	return (
		<header className="flex h-12 shrink-0 items-center px-4">
			<button
				type="button"
				aria-label="Open sidebar"
				onClick={() => getAppStoreState().setSidebarOpen(true)}
				className={toggleButtonStyles}
			>
				<PanelLeftIcon className="size-4" />
			</button>
		</header>
	);
}

function AuthenticatedLayout() {
	useHotkey("Mod+B", () => getAppStoreState().toggleSidebar());

	return (
		<div className="flex h-svh overflow-hidden">
			<AppSidebar />
			<SidebarInset>
				<MobileHeader />
				<Outlet />
			</SidebarInset>
		</div>
	);
}
