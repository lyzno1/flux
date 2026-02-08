import { PanelLeftIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
	const { toggleSidebar } = useSidebar();

	return (
		<Button variant="ghost" size="icon" className={cn("size-8", className)} onClick={toggleSidebar} {...props}>
			<PanelLeftIcon />
			<span className="sr-only">Toggle sidebar</span>
		</Button>
	);
}

export { SidebarTrigger };
