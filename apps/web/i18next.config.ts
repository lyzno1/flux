import { defineConfig } from "i18next-cli";

export default defineConfig({
	locales: ["en-US", "zh-CN"],

	extract: {
		input: ["src/**/*.{ts,tsx}"],
		output: "src/locales/{{language}}/{{namespace}}.json",
		ignore: ["src/**/*.test.*", "src/**/*.d.ts"],

		defaultNS: "common",
		keySeparator: false,

		functions: ["t", "*.t"],
		useTranslationNames: ["useTranslation"],
		removeUnusedKeys: true,

		primaryLanguage: "en-US",
		defaultValue: "",

		sort: true,
		indentation: "\t",
	},
});
