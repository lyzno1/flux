import type * as React from "react";
import { cn } from "@/lib/utils";
import { getAppStoreState } from "@/stores/app/store";

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
	const toggleSidebar = getAppStoreState().toggleSidebar;

	return (
		<button
			type="button"
			data-sidebar="rail"
			aria-label="Toggle sidebar"
			onClick={toggleSidebar}
			className={cn(
				"absolute inset-y-0 -right-2 z-20 hidden w-4 cursor-col-resize transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-sidebar-border sm:flex",
				"group-data-[state=collapsed]/sidebar-wrapper:cursor-e-resize",
				className,
			)}
			{...props}
		/>
	);
}

export { SidebarRail };
