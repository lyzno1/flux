import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarGroup({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-sidebar="group" className={cn("flex flex-col gap-1", className)} {...props}>
			{children}
		</div>
	);
}

function SidebarGroupLabel({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="group-label"
			className={cn(
				"truncate px-2 py-1.5 font-medium text-sidebar-foreground/60 text-xs uppercase tracking-wider transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

function SidebarGroupContent({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-sidebar="group-content" className={cn("flex flex-col gap-0.5", className)} {...props}>
			{children}
		</div>
	);
}

export { SidebarGroup, SidebarGroupLabel, SidebarGroupContent };
