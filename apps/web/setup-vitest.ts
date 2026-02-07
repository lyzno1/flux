import "@testing-library/jest-dom/vitest";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { vi } from "vitest";

vi.mock("zustand/traditional");

vi.stubEnv("VITE_SERVER_URL", process.env.VITE_SERVER_URL || "http://localhost:3000");

// @ts-expect-error -- required for React Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string): MediaQueryList =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(() => false),
		}) as MediaQueryList,
});

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
