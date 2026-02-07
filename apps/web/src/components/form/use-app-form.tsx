import type { StandardSchemaV1Issue } from "@tanstack/react-form";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import type * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

function FieldError({ errors }: { errors: StandardSchemaV1Issue[] }) {
	if (errors.length === 0) return null;
	return (
		<div className="space-y-1" aria-live="polite">
			{errors.map((error, index) => (
				<p key={`${error.message}-${index}`} className="text-destructive text-xs">
					{error.message}
				</p>
			))}
		</div>
	);
}

function FieldWrapper({
	label,
	labelExtra,
	htmlFor,
	errors,
	className,
	children,
}: {
	label: string;
	labelExtra?: React.ReactNode;
	htmlFor: string;
	errors: StandardSchemaV1Issue[];
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={cn("space-y-2", className)}>
			{labelExtra ? (
				<div className="flex items-center justify-between">
					<Label htmlFor={htmlFor}>{label}</Label>
					{labelExtra}
				</div>
			) : (
				<Label htmlFor={htmlFor}>{label}</Label>
			)}
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

function BaseIconField({
	label,
	labelExtra,
	type,
	placeholder,
	autoComplete,
	className,
	icon,
	endAddon,
}: {
	label: string;
	labelExtra?: React.ReactNode;
	type: string;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
	icon: React.ReactNode;
	endAddon?: React.ReactNode;
}) {
	const field = useFieldContext<string>();
	const hasError = field.state.meta.errors.length > 0;
	return (
		<FieldWrapper
			label={label}
			labelExtra={labelExtra}
			htmlFor={field.name}
			errors={field.state.meta.errors}
			className={className}
		>
			<InputGroup>
				<InputGroupAddon>{icon}</InputGroupAddon>
				<InputGroupInput
					id={field.name}
					name={field.name}
					type={type}
					placeholder={placeholder}
					autoComplete={autoComplete}
					spellCheck={false}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.currentTarget.value)}
					aria-invalid={hasError ? true : undefined}
				/>
				{endAddon}
			</InputGroup>
		</FieldWrapper>
	);
}

function IconTextField({
	label,
	placeholder,
	autoComplete,
	className,
	icon,
}: {
	label: string;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
	icon: React.ReactNode;
}) {
	return (
		<BaseIconField
			label={label}
			type="text"
			placeholder={placeholder}
			autoComplete={autoComplete}
			className={className}
			icon={icon}
		/>
	);
}

function IconEmailField({
	label,
	labelExtra,
	placeholder,
	autoComplete,
	className,
}: {
	label: string;
	labelExtra?: React.ReactNode;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
}) {
	return (
		<BaseIconField
			label={label}
			labelExtra={labelExtra}
			type="email"
			placeholder={placeholder}
			autoComplete={autoComplete ?? "email"}
			className={className}
			icon={<Mail />}
		/>
	);
}

function IconPasswordField({
	label,
	labelExtra,
	placeholder,
	autoComplete,
	className,
	toggleLabels,
}: {
	label: string;
	labelExtra?: React.ReactNode;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
	toggleLabels?: { show: string; hide: string };
}) {
	const [visible, setVisible] = useState(false);
	const labels = toggleLabels ?? { show: "Show password", hide: "Hide password" };
	return (
		<BaseIconField
			label={label}
			labelExtra={labelExtra}
			type={visible ? "text" : "password"}
			placeholder={placeholder}
			autoComplete={autoComplete}
			className={className}
			icon={<Lock />}
			endAddon={
				<InputGroupAddon align="inline-end">
					<InputGroupButton onClick={() => setVisible((v) => !v)} aria-label={visible ? labels.hide : labels.show}>
						{visible ? <EyeOff /> : <Eye />}
					</InputGroupButton>
				</InputGroupAddon>
			}
		/>
	);
}

function SubmitButton({
	label,
	submittingLabel,
	variant,
	className,
	children,
}: {
	label: string;
	submittingLabel: string;
	variant?: "default" | "secondary" | "outline";
	className?: string;
	children?: React.ReactNode;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" variant={variant} className={cn("w-full", className)} disabled={isSubmitting}>
					{isSubmitting ? submittingLabel : label}
					{isSubmitting ? null : children}
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
		IconTextField,
		IconEmailField,
		IconPasswordField,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});
