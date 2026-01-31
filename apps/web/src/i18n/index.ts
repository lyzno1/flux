import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

export const defaultNS = "common" as const;
export const supportedLngs = ["en-US", "zh-CN"] as const;
export const fallbackLng = "en-US" as const;

i18n
	.use(resourcesToBackend((language: string, namespace: string) => import(`../locales/${language}/${namespace}.json`)))
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng,
		supportedLngs,
		defaultNS,
		ns: [defaultNS],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["navigator", "htmlTag"],
			caches: ["localStorage"],
			lookupLocalStorage: "i18nextLng",
		},
	});

export default i18n;
