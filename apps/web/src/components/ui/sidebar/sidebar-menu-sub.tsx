import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarMenuSub({ className, children, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-sidebar="menu-sub"
			className={cn(
				"ml-3.5 flex flex-col gap-0.5 border-sidebar-border border-l px-2.5 py-0.5 group-data-[state=collapsed]/sidebar-wrapper:hidden",
				className,
			)}
			{...props}
		>
			{children}
		</ul>
	);
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
	return <li data-sidebar="menu-sub-item" className={className} {...props} />;
}

function SidebarMenuSubButton({
	isActive = false,
	className,
	children,
	...props
}: React.ComponentProps<"button"> & { isActive?: boolean }) {
	return (
		<button
			type="button"
			data-sidebar="menu-sub-button"
			data-active={isActive}
			className={cn(
				"flex min-h-7 w-full items-center gap-2 rounded-lg px-2 py-1 text-sidebar-foreground text-xs outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground motion-reduce:transition-none [&>svg]:size-3.5 [&>svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton };
