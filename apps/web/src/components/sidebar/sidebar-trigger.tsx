import { PanelLeftIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAppStoreState } from "@/stores/app/store";

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
	const toggleSidebar = getAppStoreState().toggleSidebar;

	return (
		<Button variant="ghost" size="icon" className={cn("size-8", className)} onClick={toggleSidebar} {...props}>
			<PanelLeftIcon aria-hidden="true" />
			<span className="sr-only">Toggle sidebar</span>
		</Button>
	);
}

export { SidebarTrigger };
