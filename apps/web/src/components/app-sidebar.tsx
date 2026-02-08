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
import { cn } from "@/lib/utils";
import { getAppStoreState } from "@/stores/app/store";

function AppSidebarHeader() {
	const toggleSidebar = getAppStoreState().toggleSidebar;

	return (
		<SidebarHeader className="border-none px-1">
			<button
				type="button"
				aria-label="Toggle sidebar"
				onClick={toggleSidebar}
				className={cn(menuButtonStyles, "cursor-pointer gap-0")}
			>
				<span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left font-semibold transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none">
					Flux
				</span>
				<PanelLeftIcon aria-hidden="true" />
			</button>
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
