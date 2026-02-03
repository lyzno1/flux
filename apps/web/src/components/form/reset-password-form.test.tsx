import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { renderAuthRoute } from "@/test/auth-test-utils";

import { ResetPasswordForm } from "./reset-password-form";

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		// biome-ignore lint/suspicious/noEmptyBlockStatements: stub
		observe() {}
		// biome-ignore lint/suspicious/noEmptyBlockStatements: stub
		unobserve() {}
		// biome-ignore lint/suspicious/noEmptyBlockStatements: stub
		disconnect() {}
	};
	document.elementFromPoint = () => null;
});

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		emailOtp: { resetPassword: vi.fn() },
	},
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const mockResetPassword = vi.mocked(authClient.emailOtp.resetPassword);

async function getForm() {
	await screen.findByLabelText(/resetPassword\.password/i);
	const forms = document.querySelectorAll("form");
	const form = forms[forms.length - 1];
	if (!form) throw new Error("form not found");
	return form;
}

async function fillAndSubmit(
	user: ReturnType<typeof userEvent.setup>,
	{ otp = "123456", password = "newPassword123" } = {},
) {
	const form = await getForm();

	const otpInput = form.querySelector<HTMLInputElement>("input[data-input-otp]");
	expect(otpInput).toBeTruthy();
	act(() => {
		fireEvent.change(otpInput as HTMLInputElement, { target: { value: otp } });
	});

	const passwordInput = form.querySelector<HTMLInputElement>('input[type="password"]');
	expect(passwordInput).toBeTruthy();
	await user.click(passwordInput as HTMLInputElement);
	await user.type(passwordInput as HTMLInputElement, password);

	const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
	expect(submitButton).toBeTruthy();
	await user.click(submitButton as HTMLButtonElement);
}

describe("ResetPasswordForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls resetPassword with correct params and navigates to /login on success", async () => {
		mockResetPassword.mockResolvedValue({ data: {}, error: null } as never);

		const { router, user } = renderAuthRoute(() => <ResetPasswordForm email="test@example.com" />, {
			path: "/reset-password",
		});

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(mockResetPassword).toHaveBeenCalledWith({
				email: "test@example.com",
				otp: "123456",
				password: "newPassword123",
			});
		});

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalled();
			expect(router.state.location.pathname).toBe("/login");
		});
	});

	it("preserves search params when navigating to /login on success", async () => {
		mockResetPassword.mockResolvedValue({ data: {}, error: null } as never);

		const { router, user } = renderAuthRoute(() => <ResetPasswordForm email="test@example.com" />, {
			path: "/reset-password",
			initialSearch: { redirect: "/settings" },
		});

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
			expect(router.state.location.search).toMatchObject({ redirect: "/settings" });
		});
	});

	it("shows error toast and does not navigate on API error", async () => {
		mockResetPassword.mockResolvedValue({
			data: null,
			error: { message: "Invalid OTP", statusText: "Bad Request" },
		} as never);

		const { router, user } = renderAuthRoute(() => <ResetPasswordForm email="test@example.com" />, {
			path: "/reset-password",
		});

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Invalid OTP");
		});

		expect(router.state.location.pathname).toBe("/reset-password");
	});

	it("falls back to statusText when error message is empty", async () => {
		mockResetPassword.mockResolvedValue({
			data: null,
			error: { message: "", statusText: "Bad Request" },
		} as never);

		const { router, user } = renderAuthRoute(() => <ResetPasswordForm email="test@example.com" />, {
			path: "/reset-password",
		});

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Bad Request");
		});

		expect(router.state.location.pathname).toBe("/reset-password");
	});

	it("passes the email prop to the API call, not a form field", async () => {
		mockResetPassword.mockResolvedValue({ data: {}, error: null } as never);

		const { user } = renderAuthRoute(() => <ResetPasswordForm email="other@example.com" />, {
			path: "/reset-password",
		});

		await fillAndSubmit(user, { otp: "654321", password: "anotherPass" });

		await waitFor(() => {
			expect(mockResetPassword).toHaveBeenCalledWith({
				email: "other@example.com",
				otp: "654321",
				password: "anotherPass",
			});
		});
	});
});
