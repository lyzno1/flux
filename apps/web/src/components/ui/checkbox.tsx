import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-input outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50 aria-invalid:border-destructive-border aria-invalid:ring-1 aria-invalid:ring-destructive-ring aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-unchecked:bg-input-subtle data-checked:text-primary-foreground",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
			>
				<CheckIcon />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
