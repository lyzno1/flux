import { useRouter } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarContent } from "@/components/sidebar/sidebar-content";
import { SidebarFooter } from "@/components/sidebar/sidebar-footer";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/sidebar/sidebar-group";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMenu, SidebarMenuItem } from "@/components/sidebar/sidebar-menu";
import { SidebarMenuButton } from "@/components/sidebar/sidebar-menu-button";
import { SidebarRail } from "@/components/sidebar/sidebar-rail";
import { SidebarSeparator } from "@/components/sidebar/sidebar-separator";
import { UserMenu } from "@/components/user-menu";
import { useSidebar } from "@/hooks/use-sidebar";

function AppSidebarHeader() {
	const { state } = useSidebar();
	const collapsed = state === "collapsed";

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
	const { state } = useSidebar();
	const collapsed = state === "collapsed";

	return (
		<SidebarFooter>
			<div className={collapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-2"}>
				<ModeToggle />
				<LanguageToggle />
			</div>
			<SidebarSeparator className="mx-0" />
			<UserMenu />
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
