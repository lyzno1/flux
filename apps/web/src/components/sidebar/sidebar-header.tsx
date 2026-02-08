import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarHeader({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="header"
			className={cn(
				"flex shrink-0 items-center gap-2 border-sidebar-border border-b px-3 py-3 transition-[padding] duration-200 group-data-[state=collapsed]/sidebar-wrapper:justify-center group-data-[state=collapsed]/sidebar-wrapper:px-0 motion-reduce:transition-none",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export { SidebarHeader };
