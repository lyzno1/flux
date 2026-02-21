import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptInputFileItem } from "./file-item";

describe("PromptInputFileItem", () => {
	it("calls onRemove with attachment id", () => {
		const onRemove = vi.fn();

		render(
			<PromptInputFileItem
				attachment={{
					id: "attachment-1",
					name: "notes.txt",
					size: 10,
				}}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Remove file" }));
		expect(onRemove).toHaveBeenCalledWith("attachment-1");
	});
});
