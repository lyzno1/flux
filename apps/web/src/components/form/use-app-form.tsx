import type { StandardSchemaV1Issue } from "@tanstack/react-form";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

function FieldError({ errors }: { errors: StandardSchemaV1Issue[] }) {
	if (errors.length === 0) return null;
	return (
		<div className="space-y-1" aria-live="polite">
			{errors.map((error) => (
				<p key={error.message} className="text-destructive text-xs">
					{error.message}
				</p>
			))}
		</div>
	);
}

function FieldWrapper({
	label,
	htmlFor,
	errors,
	className,
	children,
}: {
	label: string;
	htmlFor: string;
	errors: StandardSchemaV1Issue[];
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
			<FieldError errors={errors} />
		</div>
	);
}

function BaseField({
	label,
	type,
	placeholder,
	autoComplete,
	spellCheck,
	className,
}: {
	label: string;
	type?: string;
	placeholder?: string;
	autoComplete?: string;
	spellCheck?: boolean;
	className?: string;
}) {
	const field = useFieldContext<string>();
	return (
		<FieldWrapper label={label} htmlFor={field.name} errors={field.state.meta.errors} className={className}>
			<Input
				id={field.name}
				name={field.name}
				type={type}
				placeholder={placeholder}
				autoComplete={autoComplete}
				spellCheck={spellCheck}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.currentTarget.value)}
				aria-invalid={field.state.meta.errors.length > 0 ? true : undefined}
			/>
		</FieldWrapper>
	);
}

function TextField({
	label,
	placeholder,
	autoComplete,
	className,
}: {
	label: string;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
}) {
	return <BaseField label={label} placeholder={placeholder} autoComplete={autoComplete} className={className} />;
}

function PasswordField({
	label,
	placeholder,
	autoComplete,
	className,
}: {
	label: string;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
}) {
	return (
		<BaseField
			label={label}
			type="password"
			placeholder={placeholder}
			autoComplete={autoComplete}
			spellCheck={false}
			className={className}
		/>
	);
}

function EmailField({
	label,
	placeholder,
	autoComplete,
	className,
}: {
	label: string;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
}) {
	return (
		<BaseField
			label={label}
			type="email"
			placeholder={placeholder}
			autoComplete={autoComplete ?? "email"}
			spellCheck={false}
			className={className}
		/>
	);
}

const OTP_SLOT_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5"] as const;

function OTPField({ label, length = 6, className }: { label: string; length?: number; className?: string }) {
	const field = useFieldContext<string>();
	return (
		<FieldWrapper label={label} htmlFor={field.name} errors={field.state.meta.errors} className={className}>
			<InputOTP
				id={field.name}
				maxLength={length}
				inputMode="numeric"
				pattern="[0-9]*"
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(value) => field.handleChange(value)}
			>
				<InputOTPGroup>
					{OTP_SLOT_KEYS.slice(0, length).map((key, index) => (
						<InputOTPSlot key={key} index={index} />
					))}
				</InputOTPGroup>
			</InputOTP>
		</FieldWrapper>
	);
}

function SubmitButton({
	label,
	submittingLabel,
	className,
}: {
	label: string;
	submittingLabel: string;
	className?: string;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" className={cn("w-full", className)} disabled={isSubmitting}>
					{isSubmitting ? submittingLabel : label}
				</Button>
			)}
		</form.Subscribe>
	);
}

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		TextField,
		PasswordField,
		EmailField,
		OTPField,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});
