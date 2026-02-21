import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptInputToolbar } from "./toolbar";
import { PromptInputUploadArea } from "./upload-area";

describe("PromptInput layout", () => {
	it("does not render divider classes on upload area and toolbar", () => {
		render(
			<>
				<PromptInputUploadArea data-testid="upload-area" />
				<PromptInputToolbar data-testid="toolbar" />
			</>,
		);

		expect(screen.getByTestId("upload-area")).not.toHaveClass("border-b");
		expect(screen.getByTestId("toolbar")).not.toHaveClass("border-t");
	});
});
