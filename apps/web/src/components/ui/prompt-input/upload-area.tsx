import type * as React from "react";
import { cn } from "@/lib/utils";

function PromptInputUploadArea({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="prompt-input-upload-area" className={cn("px-3 py-2", className)} {...props} />;
}

export { PromptInputUploadArea };
