import { describe, expect, it } from "vitest";
import { isClient, isDev, isProd, isServer } from "./runtime";

describe("runtime", () => {
	it("detects server environment (no window in node)", () => {
		expect(isServer).toBe(true);
		expect(isClient).toBe(false);
	});

	it("detects NODE_ENV as test", () => {
		expect(isDev).toBe(false);
		expect(isProd).toBe(false);
	});
});
