import type * as React from "react";
import { cn } from "@/lib/utils";

function PromptInputSubmitSlot({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="prompt-input-submit-slot"
			className={cn("flex shrink-0 items-center gap-1", className)}
			{...props}
		/>
	);
}

export { PromptInputSubmitSlot };
