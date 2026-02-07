import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";
import { createMockContext } from "@/test/mock-context";

vi.mock("@/components/form/sign-in-form", () => ({
	SignInForm: () => <div data-testid="sign-in-form-route" />,
}));

describe("root route branding layout", () => {
	it("uses auth branding viewport for auth pages", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/login",
		});

		expect(await screen.findByTestId("auth-brand-panel")).toBeInTheDocument();
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
		expect(document.querySelector("main.ml-auto")).toBeInTheDocument();
	});

	it("uses home branding viewport for /", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/",
		});

		expect(await screen.findByTestId("auth-brand-panel")).toBeInTheDocument();
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/");
		});
		expect(document.querySelector("main.relative.h-full.overflow-hidden")).toBeInTheDocument();
		expect(document.querySelector("main.ml-auto")).not.toBeInTheDocument();
	});

	it("uses plain viewport for non-home non-auth pages", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/dify",
			routerContext: createMockContext({ authenticated: true }),
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/dify");
		});
		expect(screen.queryByTestId("auth-brand-panel")).not.toBeInTheDocument();
		expect(document.querySelector("main.ml-auto")).not.toBeInTheDocument();
		expect(document.querySelector("main.h-full.overflow-y-auto")).toBeInTheDocument();
	});
});
