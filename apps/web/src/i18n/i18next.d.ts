import "i18next";

import type ai from "../locales/en-US/ai.json";
import type auth from "../locales/en-US/auth.json";
import type common from "../locales/en-US/common.json";
import type dashboard from "../locales/en-US/dashboard.json";
import type dify from "../locales/en-US/dify.json";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		keySeparator: false;
		resources: {
			common: typeof common;
			auth: typeof auth;
			dashboard: typeof dashboard;
			dify: typeof dify;
			ai: typeof ai;
		};
	}
}
