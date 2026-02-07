import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";

vi.mock("@/components/form/forgot-password-form", () => ({
	ForgotPasswordForm: () => <div data-testid="forgot-password-form-route" />,
}));

describe("route /_auth/forgot-password", () => {
	it("renders ForgotPasswordForm", async () => {
		const { router } = renderWithFileRoutes({ initialLocation: "/forgot-password" });

		expect(await screen.findByTestId("forgot-password-form-route")).toBeInTheDocument();
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/forgot-password");
		});
	});
});
