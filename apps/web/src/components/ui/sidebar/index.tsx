import { Dialog } from "@base-ui/react/dialog";
import type * as React from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { getAppStoreState, useAppStore } from "@/stores/app/store";

const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

function Sidebar({ className, children, ...props }: React.ComponentProps<"div">) {
	const open = useAppStore(sidebarSelectors.isSidebarOpen);
	const isMobile = useIsMobile();
	const setSidebarOpen = getAppStoreState().setSidebarOpen;

	if (isMobile) {
		return (
			<Dialog.Root open={open} onOpenChange={setSidebarOpen}>
				<Dialog.Portal>
					<Dialog.Backdrop className="data-closed:fade-out-0 data-open:fade-in-0 absolute inset-0 z-50 bg-overlay duration-200 data-closed:animate-out data-open:animate-in motion-reduce:animate-none motion-reduce:transition-none" />
					<Dialog.Popup
						data-sidebar="sidebar"
						data-mobile="true"
						className={cn(
							"data-closed:slide-out-to-left data-open:slide-in-from-left fixed inset-y-0 left-0 z-50 flex h-svh flex-col overscroll-contain bg-sidebar text-sidebar-foreground shadow-lg duration-200 data-closed:animate-out data-open:animate-in motion-reduce:animate-none motion-reduce:transition-none",
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

	const isChildInteractive = (e: React.SyntheticEvent<HTMLElement>) => {
		const interactive = (e.target as HTMLElement).closest(INTERACTIVE_SELECTOR);
		return interactive !== null && interactive !== e.currentTarget;
	};

	const handleSidebarExpand = (e: React.MouseEvent<HTMLElement>) => {
		if (open) {
			return;
		}

		if (e.currentTarget.contains(e.target as Node) && !isChildInteractive(e)) {
			setSidebarOpen(true);
		}
	};

	const handleSidebarKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		if (open) {
			return;
		}

		if (e.key !== "Enter" && e.key !== " ") {
			return;
		}

		if (e.currentTarget.contains(e.target as Node) && !isChildInteractive(e)) {
			e.preventDefault();
			setSidebarOpen(true);
		}
	};

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
				tabIndex={open ? undefined : 0}
				aria-label={open ? undefined : "Expand sidebar"}
				role={open ? undefined : "button"}
				className={cn(
					"fixed inset-y-0 left-0 z-30 flex h-svh flex-col border-sidebar-border border-r bg-sidebar text-sidebar-foreground transition-[width,border-color] duration-200 ease-out group-data-[state=collapsed]/sidebar-wrapper:cursor-e-resize group-data-[state=collapsed]/sidebar-wrapper:border-transparent motion-reduce:transition-none group-data-[state=collapsed]/sidebar-wrapper:[&_a]:cursor-pointer group-data-[state=collapsed]/sidebar-wrapper:[&_button]:cursor-pointer",
					className,
				)}
				style={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }}
				onClick={handleSidebarExpand}
				onKeyDown={handleSidebarKeyDown}
				{...props}
			>
				{children}
			</aside>
		</div>
	);
}

export { Sidebar, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON };
