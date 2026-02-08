import { Link, useRouter } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarContent } from "@/components/sidebar/sidebar-content";
import { SidebarFooter } from "@/components/sidebar/sidebar-footer";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/sidebar/sidebar-group";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMenu, SidebarMenuItem } from "@/components/sidebar/sidebar-menu";
import { menuButtonStyles } from "@/components/sidebar/sidebar-menu-button";
import { SidebarRail } from "@/components/sidebar/sidebar-rail";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";

function AppSidebarHeader() {
	return (
		<SidebarHeader>
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
				<span className="font-bold text-sm">F</span>
			</div>
			<span className="overflow-hidden whitespace-nowrap font-semibold text-sidebar-foreground transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none">
				Flux
			</span>
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
			<SidebarRail />
		</Sidebar>
	);
}
