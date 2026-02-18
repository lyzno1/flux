import "i18next";

import type auth from "../locales/en-US/auth.json";
import type common from "../locales/en-US/common.json";
import type dify from "../locales/en-US/dify.json";

type SharedI18nConfig = typeof import("./config");

declare module "i18next" {
	interface CustomTypeOptions {
		// Keep string-key mode for compatibility with current t("key") usage.
		enableSelector: false;
		defaultNS: SharedI18nConfig["defaultNS"];
		keySeparator: SharedI18nConfig["keySeparator"];
		// Ensure keys are always checked against typed resources.
		strictKeyChecks: true;
		resources: {
			common: typeof common;
			auth: typeof auth;
			dify: typeof dify;
		};
	}
}
