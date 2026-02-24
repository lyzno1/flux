import type * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PROMPT_INPUT_MIN_HEIGHT = 64;
const PROMPT_INPUT_MAX_HEIGHT = 220;

function resizeTextarea(textarea: HTMLTextAreaElement, minHeight: number, maxHeight: number) {
	textarea.style.height = "auto";
	const scrollHeight = textarea.scrollHeight;
	const nextHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
	textarea.style.height = `${nextHeight}px`;
	textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
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

type PromptInputInputProps = React.ComponentPropsWithRef<"textarea"> & {
	maxHeight?: number;
	minHeight?: number;
	onSubmit?: () => void;
};

function PromptInputInput({
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
	const controlledValue = value;

	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}
		if (controlledValue !== undefined) {
			const normalizedControlledValue = Array.isArray(controlledValue)
				? controlledValue.join("\n")
				: String(controlledValue);
			if (textarea.value !== normalizedControlledValue) {
				textarea.value = normalizedControlledValue;
			}
		}
		resizeTextarea(textarea, minHeight, maxHeight);
	}, [controlledValue, maxHeight, minHeight]);

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

PromptInputInput.displayName = "PromptInputInput";

export { PROMPT_INPUT_MAX_HEIGHT, PROMPT_INPUT_MIN_HEIGHT, PromptInputInput };
export type { PromptInputInputProps };
