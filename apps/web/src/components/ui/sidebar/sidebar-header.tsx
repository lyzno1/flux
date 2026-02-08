import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarHeader({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="header"
			className={cn(
				"flex shrink-0 items-center gap-2 overflow-hidden border-sidebar-border border-b p-2 motion-reduce:transition-none",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export { SidebarHeader };
