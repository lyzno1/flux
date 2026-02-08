import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar/sidebar-inset";
import { useGlobalKeyboardListener, useKeybinding } from "@/hooks/use-keybinding";
import { getAppStoreState } from "@/stores/app/store";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context, location }) => {
		if (!context.auth.data) {
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}
		return { session: context.auth.data };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	useGlobalKeyboardListener();

	useKeybinding("toggle-sidebar", "b", () => getAppStoreState().toggleSidebar(), {
		mod: true,
		description: "Toggle sidebar",
	});

	return (
		<div className="flex h-svh overflow-hidden">
			<AppSidebar />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</div>
	);
}
