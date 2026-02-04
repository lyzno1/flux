import "@testing-library/jest-dom/vitest";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { vi } from "vitest";

vi.mock("zustand/traditional");

// @ts-expect-error -- required for React Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

i18next.use(initReactI18next).init({
	lng: "en-US",
	fallbackLng: "en-US",
	supportedLngs: ["en-US", "zh-CN"],
	defaultNS: "common",
	ns: [],
	resources: {},
	keySeparator: false,
	interpolation: { escapeValue: false },
});
