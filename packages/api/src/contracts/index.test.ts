import { describe, expect, it } from "vitest";
import { contract } from "./index";

describe("contracts", () => {
	it("defines healthCheck contract", () => {
		expect(contract.healthCheck).toBeDefined();
	});

	it("defines privateData contract", () => {
		expect(contract.privateData).toBeDefined();
	});
});
