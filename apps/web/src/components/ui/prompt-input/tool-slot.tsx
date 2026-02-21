import type * as React from "react";
import { cn } from "@/lib/utils";

function PromptInputToolSlot({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="prompt-input-tool-slot"
			className={cn("flex min-w-0 flex-1 items-center gap-1", className)}
			{...props}
		/>
	);
}

export { PromptInputToolSlot };
