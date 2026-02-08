import { afterEach, describe, expect, it, vi } from "vitest";

describe("formatShortcut", () => {
	afterEach(() => {
		vi.resetModules();
		vi.restoreAllMocks();
	});

	async function importWithPlatform(isMac: boolean) {
		const ua = isMac ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
		vi.stubGlobal("navigator", { userAgent: ua });
		vi.doMock("@flux/utils/runtime", () => ({ isClient: true }));
		const mod = await import("@/utils/format-shortcut");
		return mod.formatShortcut;
	}

	describe("on Mac", () => {
		it("formats mod as ⌘", async () => {
			const formatShortcut = await importWithPlatform(true);
			expect(formatShortcut("b", { mod: true })).toBe("⌘B");
		});

		it("formats alt as ⌥", async () => {
			const formatShortcut = await importWithPlatform(true);
			expect(formatShortcut("k", { alt: true })).toBe("⌥K");
		});

		it("formats shift as ⇧", async () => {
			const formatShortcut = await importWithPlatform(true);
			expect(formatShortcut("p", { shift: true })).toBe("⇧P");
		});

		it("combines multiple modifiers", async () => {
			const formatShortcut = await importWithPlatform(true);
			expect(formatShortcut("s", { mod: true, shift: true })).toBe("⌘⇧S");
		});
	});

	describe("on non-Mac", () => {
		it("formats mod as Ctrl+", async () => {
			const formatShortcut = await importWithPlatform(false);
			expect(formatShortcut("b", { mod: true })).toBe("Ctrl+B");
		});

		it("formats alt as Alt+", async () => {
			const formatShortcut = await importWithPlatform(false);
			expect(formatShortcut("k", { alt: true })).toBe("Alt+K");
		});

		it("formats shift as Shift+", async () => {
			const formatShortcut = await importWithPlatform(false);
			expect(formatShortcut("p", { shift: true })).toBe("Shift+P");
		});

		it("combines multiple modifiers", async () => {
			const formatShortcut = await importWithPlatform(false);
			expect(formatShortcut("s", { mod: true, shift: true })).toBe("Ctrl+Shift+S");
		});
	});

	it("uppercases the key", async () => {
		const formatShortcut = await importWithPlatform(false);
		expect(formatShortcut("a")).toBe("A");
	});

	it("returns just the key when no modifiers", async () => {
		const formatShortcut = await importWithPlatform(false);
		expect(formatShortcut("f", {})).toBe("F");
	});
});
