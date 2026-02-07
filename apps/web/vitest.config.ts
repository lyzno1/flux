import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	test: {
		name: "web",
		environment: "jsdom",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		setupFiles: ["./setup-vitest.ts"],
		env: {
			VITE_SERVER_URL: "http://localhost:3000",
		},
		clearMocks: true,
		restoreMocks: true,
	},
});
