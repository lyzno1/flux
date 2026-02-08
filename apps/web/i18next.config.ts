import { defineConfig } from "i18next-cli";
import { defaultNS, fallbackLng, keySeparator, supportedLngs } from "./src/i18n/config";

export default defineConfig({
	locales: supportedLngs,

	extract: {
		input: ["src/**/*.{ts,tsx}"],
		output: "src/locales/{{language}}/{{namespace}}.json",
		ignore: ["src/**/*.test.*", "src/**/*.d.ts"],

		defaultNS,
		keySeparator,

		functions: ["t", "*.t"],
		useTranslationNames: ["useTranslation"],
		removeUnusedKeys: true,

		primaryLanguage: fallbackLng,
		defaultValue: "",

		sort: true,
		indentation: "\t",
	},
});
