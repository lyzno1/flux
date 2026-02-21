import { describe, expect, it } from "vitest";
import {
	buildAppPromptInputAccept,
	DEFAULT_APP_PROMPT_INPUT_FILE_POLICY,
	filterAppPromptInputFiles,
} from "./file-helpers";

describe("app-prompt-input file-helpers", () => {
	it("builds a file input accept value from whitelist policy", () => {
		const accept = buildAppPromptInputAccept(DEFAULT_APP_PROMPT_INPUT_FILE_POLICY);

		expect(accept).toContain("image/*");
		expect(accept).toContain(".pdf");
		expect(accept).toContain(".png");
	});

	it("filters files with whitelist policy and returns rejections", () => {
		const policy = {
			...DEFAULT_APP_PROMPT_INPUT_FILE_POLICY,
			extensions: ["png", "pdf"],
			maxFileCount: 5,
			mimeTypes: ["image/*", "application/pdf"],
		};
		const files = [
			new File(["data"], "photo.png", { type: "image/png" }),
			new File(["data"], "notes.pdf", { type: "application/pdf" }),
			new File(["data"], "script.exe", { type: "application/octet-stream" }),
		];

		const result = filterAppPromptInputFiles(files, policy);

		expect(result.accepted).toHaveLength(2);
		expect(result.rejected).toHaveLength(1);
		expect(result.rejected[0]?.reason).toBe("file-type-not-allowed");
	});

	it("respects max file count with existing attachments", () => {
		const policy = {
			...DEFAULT_APP_PROMPT_INPUT_FILE_POLICY,
			maxFileCount: 2,
			mimeTypes: ["image/*"],
			extensions: ["png"],
		};
		const files = [
			new File(["data"], "a.png", { type: "image/png" }),
			new File(["data"], "b.png", { type: "image/png" }),
		];

		const result = filterAppPromptInputFiles(files, policy, 1);

		expect(result.accepted).toHaveLength(1);
		expect(result.rejected).toHaveLength(1);
		expect(result.rejected[0]?.reason).toBe("too-many-files");
	});
});
