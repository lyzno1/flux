import type * as React from "react";
import { cn } from "@/lib/utils";

function PromptInputFileList({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="prompt-input-file-list"
			className={cn("grid grid-cols-1 gap-2 md:grid-cols-2", className)}
			{...props}
		/>
	);
}

export { PromptInputFileList };
