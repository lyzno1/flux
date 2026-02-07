import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";

vi.mock("@/components/form/sign-in-form", () => ({
	SignInForm: () => <div data-testid="sign-in-form-route" />,
}));

describe("route /_auth/login", () => {
	it("renders SignInForm", async () => {
		const { router } = renderWithFileRoutes({ initialLocation: "/login" });

		expect(await screen.findByTestId("sign-in-form-route")).toBeInTheDocument();
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
	});
});
