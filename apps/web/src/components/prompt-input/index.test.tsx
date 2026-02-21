import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PROMPT_INPUT_MAX_HEIGHT, PROMPT_INPUT_MIN_HEIGHT, PromptInput } from ".";

function PromptInputTest({ initialValue = "", onSubmit }: { initialValue?: string; onSubmit?: () => void }) {
	const [value, setValue] = useState(initialValue);

	return (
		<PromptInput.Root>
			<PromptInput.Input
				aria-label="Prompt"
				onSubmit={onSubmit}
				value={value}
				onChange={(event) => {
					setValue(event.currentTarget.value);
				}}
			/>
		</PromptInput.Root>
	);
}

describe("PromptInput", () => {
	afterEach(cleanup);

	it("submits on Enter when not composing", () => {
		const onSubmit = vi.fn();
		render(<PromptInputTest initialValue="hello" onSubmit={onSubmit} />);

		fireEvent.keyDown(screen.getByLabelText("Prompt"), { key: "Enter" });

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("does not submit on Shift+Enter", () => {
		const onSubmit = vi.fn();
		render(<PromptInputTest initialValue="hello" onSubmit={onSubmit} />);

		fireEvent.keyDown(screen.getByLabelText("Prompt"), { key: "Enter", shiftKey: true });

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("does not submit on Meta+Enter", () => {
		const onSubmit = vi.fn();
		render(<PromptInputTest initialValue="hello" onSubmit={onSubmit} />);

		fireEvent.keyDown(screen.getByLabelText("Prompt"), { key: "Enter", metaKey: true });

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("does not submit while IME composition is active", () => {
		const onSubmit = vi.fn();
		render(<PromptInputTest initialValue="hello" onSubmit={onSubmit} />);
		const input = screen.getByLabelText("Prompt");

		fireEvent.compositionStart(input);
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.compositionEnd(input);
		fireEvent.keyDown(input, { key: "Enter" });

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("does not submit when browser marks key event as composing", () => {
		const onSubmit = vi.fn();
		render(<PromptInputTest initialValue="hello" onSubmit={onSubmit} />);
		const input = screen.getByLabelText("Prompt");

		const keyDownEvent = createEvent.keyDown(input, { key: "Enter" });
		Object.defineProperty(keyDownEvent, "isComposing", {
			configurable: true,
			value: true,
		});

		fireEvent(input, keyDownEvent);

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("resizes textarea within min and max boundaries", () => {
		render(<PromptInputTest initialValue="hello" />);
		const input = screen.getByLabelText("Prompt");

		Object.defineProperty(input, "scrollHeight", {
			configurable: true,
			get: () => 20,
		});
		fireEvent.input(input, { target: { value: "a" } });
		expect(input).toHaveStyle({ height: `${PROMPT_INPUT_MIN_HEIGHT}px` });
		expect(input).toHaveStyle({ overflowY: "hidden" });

		Object.defineProperty(input, "scrollHeight", {
			configurable: true,
			get: () => PROMPT_INPUT_MAX_HEIGHT + 120,
		});
		fireEvent.input(input, { target: { value: "many\nmany\nlines" } });
		expect(input).toHaveStyle({ height: `${PROMPT_INPUT_MAX_HEIGHT}px` });
		expect(input).toHaveStyle({ overflowY: "auto" });
	});

	it("supports native autoFocus behavior", () => {
		function AutoFocusTest() {
			const [value, setValue] = useState("");

			return (
				<PromptInput.Root>
					<PromptInput.Input
						aria-label="Prompt"
						autoFocus
						value={value}
						onChange={(event) => {
							setValue(event.currentTarget.value);
						}}
					/>
				</PromptInput.Root>
			);
		}

		render(<AutoFocusTest />);
		expect(screen.getByLabelText("Prompt")).toHaveFocus();
	});

	it("exposes the textarea node via ref", () => {
		const inputRef = createRef<HTMLTextAreaElement>();
		const onChange = vi.fn();

		render(
			<PromptInput.Root>
				<PromptInput.Input ref={inputRef} aria-label="Prompt" value="" onChange={onChange} />
			</PromptInput.Root>,
		);

		expect(inputRef.current).toBeInstanceOf(HTMLTextAreaElement);
	});

	it("exposes the root fieldset node via ref", () => {
		const rootRef = createRef<HTMLFieldSetElement>();
		const onChange = vi.fn();

		render(
			<PromptInput.Root ref={rootRef}>
				<PromptInput.Input aria-label="Prompt" value="" onChange={onChange} />
			</PromptInput.Root>,
		);

		expect(rootRef.current?.tagName).toBe("FIELDSET");
	});
});
