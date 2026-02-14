import { formatForDisplay } from "@tanstack/react-hotkeys";
import { Link, useRouter } from "@tanstack/react-router";
import { Home, PanelLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SidebarUserMenu } from "@/components/app-sidebar/sidebar-user-menu";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarContent } from "@/components/ui/sidebar/sidebar-content";
import { SidebarFooter } from "@/components/ui/sidebar/sidebar-footer";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar/sidebar-group";
import { SidebarHeader } from "@/components/ui/sidebar/sidebar-header";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar/sidebar-menu";
import { menuButtonStyles } from "@/components/ui/sidebar/sidebar-menu-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { getAppStoreState, useAppStore } from "@/stores/app/store";

export const toggleButtonStyles =
	"-mx-3 -my-2 shrink-0 cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground outline-none transition-[color,background-color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground motion-reduce:transition-none";

const sidebarShortcut = formatForDisplay("Mod+B");

function AppSidebarHeader() {
	const { t } = useTranslation();
	const collapsed = useAppStore(sidebarSelectors.isSidebarCollapsed);
	const toggleSidebar = getAppStoreState().toggleSidebar;

	const toggleButton = (
		<button type="button" aria-label="Toggle sidebar" onClick={toggleSidebar} className={toggleButtonStyles}>
			<PanelLeftIcon className="size-4" aria-hidden="true" />
		</button>
	);

	return (
		<SidebarHeader className="border-none px-1">
			<div className="flex w-full items-center gap-0 px-3 py-2">
				<span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left font-semibold text-sidebar-foreground transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none">
					Flux
				</span>
				<Tooltip key={collapsed ? "collapsed" : "expanded"} delay={150}>
					<TooltipTrigger render={toggleButton} />
					<TooltipContent side={collapsed ? "right" : "bottom"}>
						{t(collapsed ? "sidebar.open" : "sidebar.close")}{" "}
						<span className="text-muted-foreground">{sidebarShortcut}</span>
					</TooltipContent>
				</Tooltip>
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
