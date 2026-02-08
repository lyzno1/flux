import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarMenu({ className, children, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul data-sidebar="menu" className={cn("flex flex-col gap-0.5", className)} {...props}>
			{children}
		</ul>
	);
}

function SidebarMenuItem({ className, children, ...props }: React.ComponentProps<"li">) {
	return (
		<li data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props}>
			{children}
		</li>
	);
}

export { SidebarMenu, SidebarMenuItem };
