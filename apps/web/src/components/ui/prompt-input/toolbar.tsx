import type * as React from "react";
import { cn } from "@/lib/utils";

function PromptInputToolbar({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="prompt-input-toolbar"
			className={cn("flex items-center justify-between gap-2 px-2 py-2", className)}
			{...props}
		/>
	);
}

export { PromptInputToolbar };
