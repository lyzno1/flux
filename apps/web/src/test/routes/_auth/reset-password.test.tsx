import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";

vi.mock("@/components/form/forgot-password-form", () => ({
	ForgotPasswordForm: () => <div data-testid="forgot-password-form-route" />,
}));

vi.mock("@/components/form/reset-password-form", () => ({
	ResetPasswordForm: ({ email }: { email: string }) => <div data-testid="reset-password-form-route">{email}</div>,
}));

describe("route /_auth/reset-password", () => {
	it("redirects to /forgot-password when email search is missing", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/reset-password",
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/forgot-password");
		});
		expect(await screen.findByTestId("forgot-password-form-route")).toBeInTheDocument();
	});

	it("redirects to /forgot-password when email search is invalid", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/reset-password?email=bad-email",
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/forgot-password");
		});
	});

	it("passes valid email search to ResetPasswordForm", async () => {
		const { router } = renderWithFileRoutes({
			initialLocation: "/reset-password?email=reset@example.com",
		});

		expect(await screen.findByTestId("reset-password-form-route")).toHaveTextContent("reset@example.com");
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/reset-password");
		});
	});
});
