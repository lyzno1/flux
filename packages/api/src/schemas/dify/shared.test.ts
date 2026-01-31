import { describe, expect, it } from "vitest";
import { uploadFileSchema } from "./shared";

describe("uploadFileSchema", () => {
	describe("remote_url", () => {
		it("accepts with url", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "remote_url",
				url: "https://example.com/image.png",
			});
			expect(result.success).toBe(true);
		});

		it("accepts with remote_url field", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "remote_url",
				remote_url: "https://example.com/image.png",
			});
			expect(result.success).toBe(true);
		});

		it("rejects without url or remote_url", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "remote_url",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["url"] })]));
			}
		});

		it("rejects with empty url", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "remote_url",
				url: "   ",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("local_file", () => {
		it("accepts with upload_file_id", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "local_file",
				upload_file_id: "abc-123",
			});
			expect(result.success).toBe(true);
		});

		it("rejects without upload_file_id", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "local_file",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toEqual(
					expect.arrayContaining([expect.objectContaining({ path: ["upload_file_id"] })]),
				);
			}
		});
	});

	describe("tool_file", () => {
		it("accepts with tool_file_id", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "tool_file",
				tool_file_id: "tool-456",
			});
			expect(result.success).toBe(true);
		});

		it("rejects without tool_file_id", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "tool_file",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toEqual(
					expect.arrayContaining([expect.objectContaining({ path: ["tool_file_id"] })]),
				);
			}
		});
	});

	describe("datasource_file", () => {
		it("accepts with datasource_file_id", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "datasource_file",
				datasource_file_id: "ds-789",
			});
			expect(result.success).toBe(true);
		});

		it("rejects without datasource_file_id", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "datasource_file",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toEqual(
					expect.arrayContaining([expect.objectContaining({ path: ["datasource_file_id"] })]),
				);
			}
		});
	});

	describe("optional type field", () => {
		it("accepts with type", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "remote_url",
				url: "https://example.com/img.png",
				type: "image",
			});
			expect(result.success).toBe(true);
		});

		it("accepts without type", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "remote_url",
				url: "https://example.com/img.png",
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid type", () => {
			const result = uploadFileSchema.safeParse({
				transfer_method: "remote_url",
				url: "https://example.com/img.png",
				type: "invalid",
			});
			expect(result.success).toBe(false);
		});
	});

	it("rejects invalid transfer_method", () => {
		const result = uploadFileSchema.safeParse({
			transfer_method: "ftp",
		});
		expect(result.success).toBe(false);
	});
});
