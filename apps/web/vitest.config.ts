import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "web",
		environment: "jsdom",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		setupFiles: ["./setup-vitest.ts"],
		clearMocks: true,
		restoreMocks: true,
	},
});
