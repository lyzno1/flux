import type * as React from "react";
import { useId } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function SidebarMenuSkeleton({
	className,
	showIcon = false,
	...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
	const skeletonId = useId();
	const widthSeed = Array.from(skeletonId).reduce((total, char) => total + char.charCodeAt(0), 0);
	const width = `${50 + (widthSeed % 40)}%`;

	return (
		<div
			data-sidebar="menu-skeleton"
			className={cn("flex h-8 items-center gap-2 rounded-lg px-2", className)}
			{...props}
		>
			{showIcon && <Skeleton className="size-4 rounded-md" />}
			<Skeleton
				className="h-4 max-w-[--skeleton-width] flex-1 group-data-[state=collapsed]/sidebar-wrapper:hidden"
				style={{ "--skeleton-width": width } as React.CSSProperties}
			/>
		</div>
	);
}

export { SidebarMenuSkeleton };
