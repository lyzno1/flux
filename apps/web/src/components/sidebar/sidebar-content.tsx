import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarContent({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="content"
			className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export { SidebarContent };
