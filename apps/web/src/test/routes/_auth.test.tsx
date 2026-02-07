import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";
import { createMockContext } from "@/test/mock-context";

vi.mock("@/components/form/sign-in-form", () => ({
	SignInForm: () => <div data-testid="sign-in-form" />,
}));

describe("route /_auth", () => {
	it("applies default redirect search when missing", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/login",
		});

		expect(await screen.findByTestId("sign-in-form")).toBeInTheDocument();
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
		expect(router.state.location.search).toMatchObject({ redirect: "/dify" });
	});

	it("sanitizes unsafe redirect search values", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/login?redirect=https://evil.example/phish",
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
		expect(router.state.location.search).toMatchObject({ redirect: "/dify" });
	});

	it("keeps valid internal redirect search values", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/login?redirect=%2Fverify-email",
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
		expect(router.state.location.search).toMatchObject({ redirect: "/verify-email" });
	});

	it("redirects authenticated users to sanitized redirect target", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/login?redirect=%2F%2Fevil.example",
			routerContext: createMockContext({ authenticated: true }),
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/dify");
		});
	});
});
