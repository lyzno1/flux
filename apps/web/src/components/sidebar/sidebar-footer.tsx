import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarFooter({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="footer"
			className={cn(
				"flex shrink-0 flex-col gap-2 border-sidebar-border border-t p-2 transition-[padding] duration-200 motion-reduce:transition-none",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export { SidebarFooter };
