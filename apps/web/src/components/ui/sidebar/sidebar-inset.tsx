import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarInset({ className, children, ...props }: React.ComponentProps<"main">) {
	return (
		<main data-sidebar="inset" className={cn("flex min-h-svh flex-1 flex-col overflow-y-auto", className)} {...props}>
			{children}
		</main>
	);
}

export { SidebarInset };
