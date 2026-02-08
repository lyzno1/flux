import "i18next";

import type ai from "../locales/en-US/ai.json";
import type auth from "../locales/en-US/auth.json";
import type common from "../locales/en-US/common.json";
import type dify from "../locales/en-US/dify.json";

type SharedI18nConfig = typeof import("./config");

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: SharedI18nConfig["defaultNS"];
		keySeparator: SharedI18nConfig["keySeparator"];
		resources: {
			common: typeof common;
			auth: typeof auth;
			dify: typeof dify;
			ai: typeof ai;
		};
	}
}
