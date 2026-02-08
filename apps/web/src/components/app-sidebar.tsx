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
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
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
	const collapsed = useAppStore(sidebarSelectors.isSidebarCollapsed);
	const isMobile = useIsMobile();

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
								className={cn(menuButtonStyles, collapsed && !isMobile && "justify-center px-0")}
							>
								<Home aria-hidden="true" />
								<span className="group-data-[state=collapsed]/sidebar-wrapper:hidden">Home</span>
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
