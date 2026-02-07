import "@/test/routes/mocks";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";

vi.mock("@/components/form/sign-up-form", () => ({
	SignUpForm: () => <div data-testid="sign-up-form-route" />,
}));

describe("route /_auth/sign-up", () => {
	it("renders SignUpForm", async () => {
		const { router } = renderWithFileRoutes({ initialLocation: "/sign-up" });

		expect(await screen.findByTestId("sign-up-form-route")).toBeInTheDocument();
		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/sign-up");
		});
	});
});
