import { act, cleanup, screen, waitFor } from "@testing-library/react";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderAuthRoute } from "@/test/auth-test-utils";

import { VerifyEmailForm } from "./verify-email-form";

vi.mock("@/components/ui/input-otp", () => {
	function InputOTP({
		value,
		onChange,
		maxLength,
		children,
		id,
	}: {
		value?: string;
		onChange?: (val: string) => void;
		maxLength?: number;
		children?: React.ReactNode;
		id?: string;
		[key: string]: unknown;
	}) {
		return (
			<div>
				<input
					data-testid="otp-input"
					id={id}
					value={value ?? ""}
					maxLength={maxLength}
					onChange={(e) => onChange?.(e.target.value)}
				/>
				{children}
			</div>
		);
	}
	function InputOTPGroup({ children }: { children?: React.ReactNode }) {
		return <div>{children}</div>;
	}
	function InputOTPSlot() {
		return null;
	}
	return { InputOTP, InputOTPGroup, InputOTPSlot };
});

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		emailOtp: { verifyEmail: vi.fn(), sendVerificationOtp: vi.fn() },
	},
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const mockVerifyEmail = vi.mocked(authClient.emailOtp.verifyEmail);
const mockSendOtp = vi.mocked(authClient.emailOtp.sendVerificationOtp);

const TEST_EMAIL = "test@example.com";

function renderForm(initialSearch?: Record<string, string>) {
	return renderAuthRoute(() => <VerifyEmailForm email={TEST_EMAIL} />, {
		path: "/verify-email",
		initialSearch,
	});
}

async function fillOtpAndSubmit(
	user: ReturnType<typeof import("@testing-library/user-event")["default"]["setup"]>,
	otp: string,
) {
	const otpInput = await screen.findByTestId("otp-input");
	await user.clear(otpInput);
	await user.type(otpInput, otp);

	const submitButton = screen.getAllByRole("button").find((btn) => btn.getAttribute("type") === "submit");
	if (!submitButton) throw new Error("submit button not found");
	await user.click(submitButton);
}

function getResendButton() {
	return screen.getAllByRole("button").find((btn) => btn.getAttribute("type") !== "submit");
}

async function clickResendButton(user: ReturnType<typeof import("@testing-library/user-event")["default"]["setup"]>) {
	await screen.findByTestId("otp-input");
	const resendButton = getResendButton();
	if (!resendButton) throw new Error("resend button not found");
	await user.click(resendButton);
}

describe("VerifyEmailForm", () => {
	afterEach(() => {
		cleanup();
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("verify submit", () => {
		it("calls verifyEmail with correct email and otp", async () => {
			mockVerifyEmail.mockResolvedValue({ error: null } as never);
			const { user } = renderForm({ redirect: "/dify" });

			await fillOtpAndSubmit(user, "123456");

			await waitFor(() => {
				expect(mockVerifyEmail).toHaveBeenCalledWith({
					email: TEST_EMAIL,
					otp: "123456",
				});
			});
		});

		it("shows success toast and navigates to redirect on success", async () => {
			mockVerifyEmail.mockResolvedValue({ error: null } as never);
			const { user, router } = renderForm({ redirect: "/dify" });

			await fillOtpAndSubmit(user, "123456");

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
				expect(router.state.location.pathname).toBe("/dify");
			});
		});

		it("navigates to default redirect when no redirect param", async () => {
			mockVerifyEmail.mockResolvedValue({ error: null } as never);
			const { user, router } = renderForm();

			await fillOtpAndSubmit(user, "123456");

			await waitFor(() => {
				expect(router.state.location.pathname).toBe("/dify");
			});
		});

		it("shows error toast and does not navigate on API error", async () => {
			mockVerifyEmail.mockResolvedValue({
				error: { message: "Invalid OTP", statusText: "Bad Request" },
			} as never);
			const { user, router } = renderForm({ redirect: "/dify" });

			await fillOtpAndSubmit(user, "000000");

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Invalid OTP");
			});
			expect(toast.success).not.toHaveBeenCalled();
			expect(router.state.location.pathname).toBe("/verify-email");
		});

		it("falls back to statusText when error message is empty", async () => {
			mockVerifyEmail.mockResolvedValue({
				error: { message: "", statusText: "Bad Request" },
			} as never);
			const { user } = renderForm();

			await fillOtpAndSubmit(user, "000000");

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Bad Request");
			});
		});
	});

	describe("resend button", () => {
		it("calls sendVerificationOtp with correct params", async () => {
			mockSendOtp.mockResolvedValue({ error: null } as never);
			const { user } = renderForm();

			await clickResendButton(user);

			await waitFor(() => {
				expect(mockSendOtp).toHaveBeenCalledWith({
					email: TEST_EMAIL,
					type: "email-verification",
				});
			});
		});

		it("shows success toast on resend success", async () => {
			mockSendOtp.mockResolvedValue({ error: null } as never);
			const { user } = renderForm();

			await clickResendButton(user);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
			});
		});

		it("shows error toast on resend failure", async () => {
			mockSendOtp.mockResolvedValue({
				error: { message: "Rate limited", statusText: "Too Many Requests" },
			} as never);
			const { user } = renderForm();

			await clickResendButton(user);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Rate limited");
			});
		});

		it("falls back to statusText on resend when message is empty", async () => {
			mockSendOtp.mockResolvedValue({
				error: { message: "", statusText: "Too Many Requests" },
			} as never);
			const { user } = renderForm();

			await clickResendButton(user);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Too Many Requests");
			});
		});

		it("disables resend button after successful resend", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			mockSendOtp.mockResolvedValue({ error: null } as never);
			const { user } = renderForm();

			await clickResendButton(user);

			await waitFor(() => {
				expect(getResendButton()).toBeDisabled();
			});

			vi.useRealTimers();
		});

		it("re-enables resend button after cooldown expires", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			mockSendOtp.mockResolvedValue({ error: null } as never);
			const { user } = renderForm();

			await clickResendButton(user);
			await waitFor(() => {
				expect(getResendButton()).toBeDisabled();
			});

			for (let i = 0; i < 60; i++) {
				await act(() => vi.advanceTimersByTime(1000));
			}

			expect(getResendButton()).toBeEnabled();

			vi.useRealTimers();
		});

		it("does not disable resend button on error", async () => {
			mockSendOtp.mockResolvedValue({
				error: { message: "Error", statusText: "Error" },
			} as never);
			const { user } = renderForm();

			await clickResendButton(user);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});
			expect(getResendButton()).toBeEnabled();
		});
	});

	describe("email display", () => {
		it("shows email address in description", async () => {
			renderForm();

			await waitFor(() => {
				expect(screen.getByText("verifyEmail.description")).toBeInTheDocument();
			});
		});
	});
});
