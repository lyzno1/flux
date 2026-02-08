import type * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { useAppStore } from "@/stores/app/store";

type SidebarMenuButtonProps = React.ComponentProps<"button"> & {
	isActive?: boolean;
	tooltip?: string;
};

const menuButtonStyles =
	"peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-lg px-2 py-2 text-sidebar-foreground text-sm outline-none transition-[color,background-color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0";

function SidebarMenuButton({ isActive = false, tooltip, className, children, ...props }: SidebarMenuButtonProps) {
	const collapsed = useAppStore(sidebarSelectors.isSidebarCollapsed);
	const isMobile = useIsMobile();

	const button = (
		<button
			type="button"
			data-sidebar="menu-button"
			data-active={isActive}
			className={cn(menuButtonStyles, className)}
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

export { SidebarMenuButton, menuButtonStyles };
