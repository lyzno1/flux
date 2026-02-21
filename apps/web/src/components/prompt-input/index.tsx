import type * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const PROMPT_INPUT_MIN_HEIGHT = 64;
export const PROMPT_INPUT_MAX_HEIGHT = 220;

function resizeTextarea(textarea: HTMLTextAreaElement, minHeight: number, maxHeight: number) {
	textarea.style.height = "0px";
	const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
	textarea.style.height = `${nextHeight}px`;
	textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
	if (!ref) {
		return;
	}
	if (typeof ref === "function") {
		ref(value);
		return;
	}
	ref.current = value;
}

export type PromptInputRootProps = React.ComponentProps<"fieldset">;

function Root({ className, disabled, ...props }: PromptInputRootProps) {
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

type PromptInputUploadAreaProps = React.ComponentProps<"div">;

function UploadArea({ className, ...props }: PromptInputUploadAreaProps) {
	return (
		<div data-slot="prompt-input-upload-area" className={cn("border-input border-b px-3 py-2", className)} {...props} />
	);
}

export type PromptInputInputProps = React.ComponentPropsWithRef<"textarea"> & {
	maxHeight?: number;
	minHeight?: number;
	onSubmit?: () => void;
};

function Input({
	className,
	disabled: disabledProp,
	maxHeight = PROMPT_INPUT_MAX_HEIGHT,
	minHeight = PROMPT_INPUT_MIN_HEIGHT,
	onCompositionEnd,
	onCompositionStart,
	onInput,
	onKeyDown,
	onSubmit,
	ref,
	value,
	...props
}: PromptInputInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const isComposingRef = useRef(false);
	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea || value === undefined) {
			return;
		}
		resizeTextarea(textarea, minHeight, maxHeight);
	}, [maxHeight, minHeight, value]);

	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea || value !== undefined) {
			return;
		}
		resizeTextarea(textarea, minHeight, maxHeight);
	}, [maxHeight, minHeight, value]);

	return (
		<Textarea
			ref={(element) => {
				textareaRef.current = element;
				assignRef(ref, element);
			}}
			data-slot="prompt-input-input"
			rows={1}
			value={value}
			disabled={disabledProp}
			className={cn(
				"min-h-0 resize-none border-0 bg-transparent px-3 py-2 shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0",
				className,
			)}
			onInput={(event) => {
				if (value === undefined) {
					resizeTextarea(event.currentTarget, minHeight, maxHeight);
				}
				onInput?.(event);
			}}
			onCompositionStart={(event) => {
				isComposingRef.current = true;
				onCompositionStart?.(event);
			}}
			onCompositionEnd={(event) => {
				isComposingRef.current = false;
				onCompositionEnd?.(event);
			}}
			onKeyDown={(event) => {
				onKeyDown?.(event);
				if (event.defaultPrevented) {
					return;
				}
				if (event.key !== "Enter" || event.shiftKey) {
					return;
				}
				if (event.metaKey || event.ctrlKey || event.altKey) {
					return;
				}
				if (isComposingRef.current || event.nativeEvent.isComposing) {
					return;
				}
				event.preventDefault();
				onSubmit?.();
			}}
			{...props}
		/>
	);
}

type PromptInputToolbarProps = React.ComponentProps<"div">;

function Toolbar({ className, ...props }: PromptInputToolbarProps) {
	return (
		<div
			data-slot="prompt-input-toolbar"
			className={cn("flex items-center justify-between gap-2 border-input border-t px-2 py-2", className)}
			{...props}
		/>
	);
}

type PromptInputToolSlotProps = React.ComponentProps<"div">;

function ToolSlot({ className, ...props }: PromptInputToolSlotProps) {
	return (
		<div
			data-slot="prompt-input-tool-slot"
			className={cn("flex min-w-0 flex-1 items-center gap-1", className)}
			{...props}
		/>
	);
}

type PromptInputSubmitSlotProps = React.ComponentProps<"div">;

function SubmitSlot({ className, ...props }: PromptInputSubmitSlotProps) {
	return (
		<div
			data-slot="prompt-input-submit-slot"
			className={cn("flex shrink-0 items-center gap-1", className)}
			{...props}
		/>
	);
}

Input.displayName = "PromptInputInput";

export const PromptInput = {
	Root,
	UploadArea,
	Input,
	Toolbar,
	ToolSlot,
	SubmitSlot,
};
