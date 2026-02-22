import { cleanup, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "@/lib/auth/client";
import { renderAuthRoute } from "@/test/auth-test-utils";
import { ForgotPasswordForm } from "./forgot-password-form";

vi.mock("@/lib/auth/client", () => ({
	authClient: {
		emailOtp: { sendVerificationOtp: vi.fn() },
	},
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const mockSendOtp = vi.mocked(authClient.emailOtp.sendVerificationOtp);

function getEmailInput() {
	return screen.findByRole("textbox");
}

function getSubmitButton() {
	return screen.findByRole("button", { name: /submit/i });
}

describe("ForgotPasswordForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("calls sendVerificationOtp with correct params on submit", async () => {
		mockSendOtp.mockResolvedValue({ error: null } as never);
		const { user } = renderAuthRoute(ForgotPasswordForm, { path: "/forgot-password" });

		await user.type(await getEmailInput(), "test@example.com");
		await user.click(await getSubmitButton());

		await waitFor(() => {
			expect(mockSendOtp).toHaveBeenCalledWith({
				email: "test@example.com",
				type: "forget-password",
			});
		});
	});

	it("navigates to /reset-password with email on success", async () => {
		mockSendOtp.mockResolvedValue({ error: null } as never);
		const { router, user } = renderAuthRoute(ForgotPasswordForm, { path: "/forgot-password" });

		await user.type(await getEmailInput(), "test@example.com");
		await user.click(await getSubmitButton());

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalled();
			expect(router.state.location.pathname).toBe("/reset-password");
			expect(router.state.location.search).toMatchObject({ email: "test@example.com" });
		});
	});

	it("preserves existing search params (redirect) on navigation", async () => {
		mockSendOtp.mockResolvedValue({ error: null } as never);
		const { router, user } = renderAuthRoute(ForgotPasswordForm, {
			path: "/forgot-password",
			initialSearch: { redirect: "/settings" },
		});

		await user.type(await getEmailInput(), "user@test.com");
		await user.click(await getSubmitButton());

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/reset-password");
			expect(router.state.location.search).toMatchObject({
				redirect: "/settings",
				email: "user@test.com",
			});
		});
	});

	it("shows error toast and does not navigate on failure", async () => {
		mockSendOtp.mockResolvedValue({
			error: { message: "Not found", statusText: "Not Found" },
		} as never);
		const { router, user } = renderAuthRoute(ForgotPasswordForm, { path: "/forgot-password" });

		await user.type(await getEmailInput(), "bad@example.com");
		await user.click(await getSubmitButton());

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Not found");
		});
		expect(router.state.location.pathname).toBe("/forgot-password");
	});

	it("uses statusText when error message is empty", async () => {
		mockSendOtp.mockResolvedValue({
			error: { message: "", statusText: "Not Found" },
		} as never);
		const { user } = renderAuthRoute(ForgotPasswordForm, { path: "/forgot-password" });

		await user.type(await getEmailInput(), "bad@example.com");
		await user.click(await getSubmitButton());

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Not Found");
		});
	});
});
