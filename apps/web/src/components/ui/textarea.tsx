import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"field-sizing-content flex min-h-16 w-full rounded-xl border border-input bg-input-subtle px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input-subtle-disabled disabled:opacity-50 aria-invalid:border-destructive-border aria-invalid:ring-1 aria-invalid:ring-destructive-ring motion-reduce:transition-none sm:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
