import type * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarMenuActionProps extends React.ComponentProps<"button"> {
	tooltip?: string;
	showOnHover?: boolean;
}

function SidebarMenuAction({ tooltip, showOnHover = true, className, children, ...props }: SidebarMenuActionProps) {
	const button = (
		<button
			type="button"
			data-sidebar="menu-action"
			className={cn(
				"absolute top-1/2 right-1.5 flex aspect-square w-6 -translate-y-1/2 items-center justify-center rounded-lg text-sidebar-foreground outline-none transition-[opacity,background-color] hover:bg-sidebar-accent-foreground/10 hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring peer-data-[active=true]/menu-button:text-sidebar-accent-foreground motion-reduce:transition-none [&>svg]:size-3.5 [&>svg]:shrink-0",
				showOnHover &&
					"opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100",
				"group-data-[state=collapsed]/sidebar-wrapper:hidden",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);

	if (tooltip) {
		return (
			<Tooltip>
				<TooltipTrigger render={button} />
				<TooltipContent side="right">{tooltip}</TooltipContent>
			</Tooltip>
		);
	}

	return button;
}

export { SidebarMenuAction };
