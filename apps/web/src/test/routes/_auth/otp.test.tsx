import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";

vi.mock("@/components/form/otp-login-form", () => ({
	OtpLoginForm: ({ email }: { email?: string }) => <div data-testid="otp-login-form-route">{email ?? "no-email"}</div>,
}));

describe("route /_auth/otp", () => {
	it("renders OtpLoginForm with undefined email when search is missing", async () => {
		const { router } = renderWithFileRoutes({ initialLocation: "/otp" });

		expect(await screen.findByTestId("otp-login-form-route")).toHaveTextContent("no-email");
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/otp");
		});
	});

	it("passes valid email search to OtpLoginForm", async () => {
		renderWithFileRoutes({ initialLocation: "/otp?email=test@example.com" });

		expect(await screen.findByTestId("otp-login-form-route")).toHaveTextContent("test@example.com");
	});

	it("coerces invalid email search to undefined", async () => {
		renderWithFileRoutes({ initialLocation: "/otp?email=invalid-email" });

		expect(await screen.findByTestId("otp-login-form-route")).toHaveTextContent("no-email");
	});
});
