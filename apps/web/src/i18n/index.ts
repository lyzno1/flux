import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

export const defaultNS = "common" as const;
export const fallbackLng = "en-US" as const;

export const languages = [
	{ code: "en-US", label: "English" },
	{ code: "zh-CN", label: "中文" },
] as const;

export const supportedLngs = languages.map((l) => l.code);

i18n
	.use(resourcesToBackend((language: string, namespace: string) => import(`../locales/${language}/${namespace}.json`)))
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng,
		supportedLngs,
		defaultNS,
		keySeparator: false,
		ns: [],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["navigator", "htmlTag"],
			caches: ["localStorage"],
			lookupLocalStorage: "i18nextLng",
		},
	});

i18n.services.formatter?.addCached("duration", (lng, options) => {
	const fractionDigits = options?.maximumFractionDigits ?? 2;
	const formatter = new Intl.NumberFormat(lng ?? undefined, {
		style: "unit",
		unit: "second",
		maximumFractionDigits: fractionDigits,
		minimumFractionDigits: fractionDigits,
	});
	return (val: number) => formatter.format(val / 1000);
});

export default i18n;
