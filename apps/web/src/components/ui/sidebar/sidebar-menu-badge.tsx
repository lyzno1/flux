import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarMenuBadge({ className, children, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-sidebar="menu-badge"
			className={cn(
				"pointer-events-none absolute top-1/2 right-2 flex h-5 min-w-5 -translate-y-1/2 select-none items-center justify-center rounded-full bg-sidebar-primary px-1 font-medium text-sidebar-primary-foreground text-xs tabular-nums group-data-[state=collapsed]/sidebar-wrapper:hidden",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}

export { SidebarMenuBadge };
