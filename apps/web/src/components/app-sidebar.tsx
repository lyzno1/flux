import { Link, useRouter } from "@tanstack/react-router";
import { Home, PanelLeftIcon } from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarContent } from "@/components/sidebar/sidebar-content";
import { SidebarFooter } from "@/components/sidebar/sidebar-footer";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/sidebar/sidebar-group";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMenu, SidebarMenuItem } from "@/components/sidebar/sidebar-menu";
import { menuButtonStyles } from "@/components/sidebar/sidebar-menu-button";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";
import { getAppStoreState } from "@/stores/app/store";

function AppSidebarHeader() {
	const toggleSidebar = getAppStoreState().toggleSidebar;

	return (
		<SidebarHeader className="border-none px-1">
			<div className="flex w-full items-center gap-0 px-3 py-2">
				<span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left font-semibold text-sidebar-foreground transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none">
					Flux
				</span>
				<button
					type="button"
					aria-label="Toggle sidebar"
					onClick={toggleSidebar}
					className="-mx-3 -my-2 shrink-0 cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground outline-none transition-[color,background-color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground motion-reduce:transition-none"
				>
					<PanelLeftIcon className="size-4" aria-hidden="true" />
				</button>
			</div>
		</SidebarHeader>
	);
}

function AppSidebarNav() {
	const router = useRouter();
	const currentPath = router.state.location.pathname;

	return (
		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Navigation</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<Link
								to="/dify"
								data-sidebar="menu-button"
								data-active={currentPath === "/dify"}
								className={menuButtonStyles}
							>
								<Home aria-hidden="true" />
								<span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none">
									Home
								</span>
							</Link>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	);
}

function AppSidebarFooter() {
	return (
		<SidebarFooter>
			<SidebarUserMenu />
		</SidebarFooter>
	);
}

export function AppSidebar() {
	return (
		<Sidebar>
			<AppSidebarHeader />
			<AppSidebarNav />
			<AppSidebarFooter />
		</Sidebar>
	);
}
