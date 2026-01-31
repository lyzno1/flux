import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "store",
		environment: "jsdom",
		include: ["src/**/*.test.ts"],
		clearMocks: true,
		restoreMocks: true,
	},
});
