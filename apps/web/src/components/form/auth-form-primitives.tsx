import { Link } from "@tanstack/react-router";
import type * as React from "react";

import { cn } from "@/lib/utils";

export const AUTH_PRIMARY_SUBMIT_BUTTON_CLASS = "bg-accent text-accent-foreground hover:bg-accent/80";

export const AUTH_MUTED_TEXT_LINK_CLASS =
	"text-muted-foreground text-xs hover:text-foreground focus-visible:text-foreground focus-visible:outline-none";

type AuthFooterLinkRowProps = {
	prefix: string;
	to: React.ComponentProps<typeof Link>["to"];
	label: string;
	className?: string;
	linkClassName?: string;
};

export function AuthFooterLinkRow({ prefix, to, label, className, linkClassName }: AuthFooterLinkRowProps) {
	return (
		<div className={cn("flex items-center justify-center gap-1 text-sm", className)}>
			<span className="text-muted-foreground">{prefix}</span>
			<Link
				to={to}
				search={true}
				className={cn(
					"font-semibold hover:underline focus-visible:underline focus-visible:outline-none",
					linkClassName,
				)}
			>
				{label}
			</Link>
		</div>
	);
}
