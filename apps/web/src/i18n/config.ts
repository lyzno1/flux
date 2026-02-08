export const defaultNS = "common" as const;
export const fallbackLng = "en-US" as const;
export const keySeparator = false as const;

export const languages = [
	{ code: "en-US", label: "English" },
	{ code: "zh-CN", label: "中文" },
] as const;

export const supportedLngs = languages.map((language) => language.code);
