import { useRouter } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarContent } from "@/components/sidebar/sidebar-content";
import { SidebarFooter } from "@/components/sidebar/sidebar-footer";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/sidebar/sidebar-group";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMenu, SidebarMenuItem } from "@/components/sidebar/sidebar-menu";
import { SidebarMenuButton } from "@/components/sidebar/sidebar-menu-button";
import { SidebarRail } from "@/components/sidebar/sidebar-rail";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { useAppStore } from "@/stores/app/store";

function AppSidebarHeader() {
	const collapsed = useAppStore(sidebarSelectors.isSidebarCollapsed);

	return (
		<SidebarHeader>
			<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
				<span className="font-bold text-sm">F</span>
			</div>
			{!collapsed && <span className="font-semibold text-sidebar-foreground">Flux</span>}
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
							<SidebarMenuButton
								isActive={currentPath === "/dify"}
								tooltip="Home"
								onClick={() => router.navigate({ to: "/dify" })}
							>
								<Home />
								<span className="group-data-[state=collapsed]/sidebar-wrapper:hidden">Home</span>
							</SidebarMenuButton>
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
