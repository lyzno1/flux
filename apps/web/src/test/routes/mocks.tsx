import { cleanup } from "@testing-library/react";
import type * as React from "react";
import { afterEach, vi } from "vitest";

afterEach(() => {
	cleanup();
});

vi.mock("@/components/auth/auth-brand-panel", () => ({
	AuthBrandPanel: ({ className }: { className?: string }) => (
		<div data-testid="auth-brand-panel" className={className} />
	),
}));

vi.mock("@/components/devtools/loader", () => ({
	DevtoolsLoader: () => null,
}));

vi.mock("@/components/header", () => ({
	Header: () => null,
}));

vi.mock("@/components/page-loading", () => ({
	PageLoading: () => <div data-testid="page-loading" />,
}));

vi.mock("@/components/theme-provider", () => ({
	ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useTheme: () => ({
		theme: "light",
		resolvedTheme: "light",
		setTheme: vi.fn(),
	}),
}));

vi.mock("@/components/ui/sonner", () => ({
	Toaster: () => null,
}));

vi.mock("@/components/google-one-tap", () => ({
	GoogleOneTap: () => null,
}));
