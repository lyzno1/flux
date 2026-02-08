import type * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
	isActive?: boolean;
	tooltip?: string;
}

function SidebarMenuButton({ isActive = false, tooltip, className, children, ...props }: SidebarMenuButtonProps) {
	const { state, isMobile } = useSidebar();
	const collapsed = state === "collapsed";

	const button = (
		<button
			type="button"
			data-sidebar="menu-button"
			data-active={isActive}
			className={cn(
				"peer/menu-button flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sidebar-foreground text-sm outline-none transition-[color,background-color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0",
				collapsed && !isMobile && "justify-center px-0",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);

	if (collapsed && !isMobile) {
		const label = tooltip ?? (typeof children === "string" ? children : undefined);
		if (label) {
			return (
				<Tooltip>
					<TooltipTrigger className="w-full">{button}</TooltipTrigger>
					<TooltipContent side="right">{label}</TooltipContent>
				</Tooltip>
			);
		}
	}

	return button;
}

export { SidebarMenuButton };
