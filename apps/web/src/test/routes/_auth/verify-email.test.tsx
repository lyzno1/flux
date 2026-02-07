import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";

vi.mock("@/components/form/sign-in-form", () => ({
	SignInForm: () => <div data-testid="sign-in-form-route" />,
}));

vi.mock("@/components/form/verify-email-form", () => ({
	VerifyEmailForm: ({ email }: { email: string }) => <div data-testid="verify-email-form-route">{email}</div>,
}));

describe("route /_auth/verify-email", () => {
	it("redirects to /login when email search is missing", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/verify-email",
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
		expect(await screen.findByTestId("sign-in-form-route")).toBeInTheDocument();
	});

	it("redirects to /login when email search is invalid", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/verify-email?email=not-an-email",
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
	});

	it("passes valid email search to VerifyEmailForm", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/verify-email?email=verified@example.com",
		});

		expect(await screen.findByTestId("verify-email-form-route")).toHaveTextContent("verified@example.com");
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/verify-email");
		});
	});
});
