import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { defineConfig } from "vite";

function reactScanDev(): PluginOption {
	return {
		name: "react-scan-dev",
		transformIndexHtml(_html, ctx) {
			if (!ctx.server) return;
			return [
				{
					tag: "script",
					attrs: { src: "https://unpkg.com/react-scan/dist/auto.global.js" },
					injectTo: "head-prepend",
				},
			];
		},
	};
}

export default defineConfig({
	plugins: [
		devtools(),
		reactScanDev(),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		chunkSizeWarningLimit: 500,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules") && id.includes("react-dom")) return "react-vendor";
				},
			},
		},
	},
	server: {
		port: 3001,
	},
});
