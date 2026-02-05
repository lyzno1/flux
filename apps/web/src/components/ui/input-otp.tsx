import { OTPInput, OTPInputContext } from "input-otp";
import type * as React from "react";
import { useContext } from "react";

import { cn } from "@/lib/utils";

function InputOTP({
	className,
	containerClassName,
	...props
}: React.ComponentProps<typeof OTPInput> & {
	containerClassName?: string;
}) {
	return (
		<OTPInput
			data-slot="input-otp"
			containerClassName={cn("cn-input-otp flex items-center has-disabled:opacity-50", containerClassName)}
			spellCheck={false}
			className={cn("disabled:cursor-not-allowed", className)}
			{...props}
		/>
	);
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-otp-group"
			className={cn(
				"flex items-center rounded-xl has-aria-invalid:border-destructive-border has-aria-invalid:ring-1 has-aria-invalid:ring-destructive-ring",
				className,
			)}
			{...props}
		/>
	);
}

function InputOTPSlot({
	index,
	className,
	...props
}: React.ComponentProps<"div"> & {
	index: number;
}) {
	const inputOTPContext = useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				"relative flex size-10 items-center justify-center border-input border-y border-r bg-input-subtle text-base transition-colors first:rounded-l-xl first:border-l last:rounded-r-xl aria-invalid:border-destructive-border data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-1 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive-border data-[active=true]:aria-invalid:ring-destructive-ring sm:text-sm",
				className,
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
				</div>
			)}
		</div>
	);
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"hr">) {
	return <hr data-slot="input-otp-separator" className={cn("mx-1 h-4 w-4 border-none", className)} {...props} />;
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
