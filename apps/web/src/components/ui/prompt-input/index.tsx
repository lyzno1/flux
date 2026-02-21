import type * as React from "react";
import { cn } from "@/lib/utils";

function PromptInput({ className, disabled, ...props }: React.ComponentProps<"fieldset">) {
	return (
		<fieldset
			data-slot="prompt-input-root"
			data-disabled={disabled ? "true" : "false"}
			disabled={disabled}
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-xl border border-input bg-input-subtle focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 data-[disabled=true]:opacity-60 motion-reduce:transition-none",
				className,
			)}
			{...props}
		/>
	);
}

export { PromptInput };
