import { describe, expect, it } from "vitest";
import { isDev, isProd, isServer } from "./runtime";

describe("runtime", () => {
	it("detects server environment", () => {
		expect(isServer).toBe(true);
	});

	it("detects NODE_ENV as test", () => {
		expect(isDev).toBe(false);
		expect(isProd).toBe(false);
	});
});
