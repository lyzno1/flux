import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { defaultNS, fallbackLng, keySeparator, supportedLngs } from "./config";

i18n
	.use(resourcesToBackend((language: string, namespace: string) => import(`../locales/${language}/${namespace}.json`)))
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng,
		supportedLngs,
		defaultNS,
		keySeparator,
		ns: ["common", "auth"],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["localStorage", "navigator", "htmlTag"],
			caches: ["localStorage"],
			lookupLocalStorage: "i18nextLng",
		},
		react: {
			useSuspense: true,
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

document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lng) => {
	document.documentElement.lang = lng;
});

export default i18n;
