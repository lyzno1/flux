import { Dialog } from "@base-ui/react/dialog";
import type * as React from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

function Sidebar({ className, children, ...props }: React.ComponentProps<"div">) {
	const { open, isMobile, setSidebarOpen } = useSidebar();

	if (isMobile) {
		return (
			<Dialog.Root open={open} onOpenChange={setSidebarOpen}>
				<Dialog.Portal>
					<Dialog.Backdrop className="data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-overlay duration-200 data-closed:animate-out data-open:animate-in motion-reduce:animate-none motion-reduce:transition-none" />
					<Dialog.Popup
						data-sidebar="sidebar"
						data-mobile="true"
						className={cn(
							"data-closed:slide-out-to-left data-open:slide-in-from-left fixed inset-y-0 left-0 z-50 flex h-svh flex-col bg-sidebar text-sidebar-foreground shadow-lg duration-200 data-closed:animate-out data-open:animate-in motion-reduce:animate-none motion-reduce:transition-none",
							className,
						)}
						style={{ width: SIDEBAR_WIDTH_MOBILE }}
						{...props}
					>
						{children}
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		);
	}

	return (
		<div
			data-sidebar="sidebar-wrapper"
			data-state={open ? "expanded" : "collapsed"}
			className="group/sidebar-wrapper shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none"
			style={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }}
		>
			<aside
				data-sidebar="sidebar"
				data-state={open ? "expanded" : "collapsed"}
				className={cn(
					"fixed inset-y-0 left-0 z-30 flex h-svh flex-col border-sidebar-border border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none",
					className,
				)}
				style={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }}
				{...props}
			>
				{children}
			</aside>
		</div>
	);
}

export { Sidebar, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON };
