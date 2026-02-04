import { act, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { renderAuthRoute } from "@/test/auth-test-utils";

import { OtpLoginForm } from "./otp-login-form";

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		emailOtp: { sendVerificationOtp: vi.fn() },
		signIn: { emailOtp: vi.fn() },
	},
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

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

const sendOtp = vi.mocked(authClient.emailOtp.sendVerificationOtp);
const signInOtp = vi.mocked(authClient.signIn.emailOtp);

const otpSearchSchema = z.object({
	email: z.string().email().optional().catch(undefined),
});

function getLastForm() {
	const forms = document.querySelectorAll("form");
	const form = forms[forms.length - 1];
	if (!form) throw new Error("form not found");
	return form;
}

function lastForm() {
	return within(getLastForm());
}

function getOtpInput() {
	const input = getLastForm().querySelector<HTMLInputElement>("input[data-input-otp]");
	expect(input).toBeTruthy();
	return input as HTMLInputElement;
}

function otpForm() {
	const form = getOtpInput().closest("form");
	expect(form).toBeTruthy();
	return within(form as HTMLFormElement);
}

function renderEmail(options?: { initialSearch?: Record<string, string> }) {
	return renderAuthRoute(() => <OtpLoginForm />, {
		path: "/otp",
		routeSearch: otpSearchSchema,
		...options,
	});
}

function renderOtp(email: string, options?: { initialSearch?: Record<string, string> }) {
	return renderAuthRoute(() => <OtpLoginForm email={email} />, {
		path: "/otp",
		routeSearch: otpSearchSchema,
		...options,
	});
}

async function waitForEmailForm() {
	await screen.findByLabelText(/otpLogin\.email/i);
}

async function waitForOtpForm() {
	await waitFor(() => {
		const input = getLastForm().querySelector("input[data-input-otp]");
		expect(input).toBeTruthy();
	});
}

function getResendButton() {
	return screen.getByRole("button", { name: /otpLogin\.resend|otpLogin\.cooldown/ });
}

describe("OtpLoginForm", () => {
	afterEach(() => {
		cleanup();
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("email phase (no email prop)", () => {
		it("renders email input and submit button", async () => {
			renderEmail();
			await waitForEmailForm();

			expect(lastForm().getByRole("textbox")).toBeInTheDocument();
			expect(lastForm().getByRole("button", { name: "otpLogin.sendCode" })).toBeInTheDocument();
		});

		it("calls sendVerificationOtp on submit and shows success toast", async () => {
			sendOtp.mockResolvedValue({ error: null });
			const { user } = renderEmail();
			await waitForEmailForm();

			fireEvent.change(lastForm().getByRole("textbox"), { target: { value: "user@test.com" } });
			await user.click(lastForm().getByRole("button", { name: "otpLogin.sendCode" }));

			await waitFor(() => {
				expect(sendOtp).toHaveBeenCalledWith({
					email: "user@test.com",
					type: "sign-in",
				});
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
			});
		});

		it("shows error toast when sendVerificationOtp fails", async () => {
			sendOtp.mockResolvedValue({ error: { message: "Rate limited" } });
			const { user } = renderEmail();
			await waitForEmailForm();

			fireEvent.change(lastForm().getByRole("textbox"), { target: { value: "user@test.com" } });
			await user.click(lastForm().getByRole("button", { name: "otpLogin.sendCode" }));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Rate limited");
			});
		});

		it("uses statusText when error message is empty", async () => {
			sendOtp.mockResolvedValue({ error: { message: "", statusText: "Too Many Requests" } });
			const { user } = renderEmail();
			await waitForEmailForm();

			fireEvent.change(lastForm().getByRole("textbox"), { target: { value: "user@test.com" } });
			await user.click(lastForm().getByRole("button", { name: "otpLogin.sendCode" }));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Too Many Requests");
			});
		});
	});

	describe("OTP phase (with email prop)", () => {
		it("renders OTP input instead of email input", async () => {
			renderOtp("user@test.com");
			await waitForOtpForm();

			expect(getOtpInput()).toBeInTheDocument();
			expect(otpForm().getByRole("button", { name: "otpLogin.submit" })).toBeInTheDocument();
		});

		it("displays the target email address", async () => {
			renderOtp("user@test.com");
			await waitForOtpForm();

			expect(screen.getByText(/otpLogin\.sendingTo/)).toBeInTheDocument();
		});

		it("calls signIn.emailOtp and shows success toast on success", async () => {
			signInOtp.mockResolvedValue({ error: null });
			const { user } = renderOtp("user@test.com", {
				initialSearch: { redirect: "/settings" },
			});
			await waitForOtpForm();

			fireEvent.change(getOtpInput(), { target: { value: "123456" } });
			await user.click(otpForm().getByRole("button", { name: "otpLogin.submit" }));

			await waitFor(() => {
				expect(signInOtp).toHaveBeenCalledWith({
					email: "user@test.com",
					otp: "123456",
				});
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
			});
		});

		it("calls signIn.emailOtp with default redirect", async () => {
			signInOtp.mockResolvedValue({ error: null });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			fireEvent.change(getOtpInput(), { target: { value: "123456" } });
			await user.click(otpForm().getByRole("button", { name: "otpLogin.submit" }));

			await waitFor(() => {
				expect(signInOtp).toHaveBeenCalledWith({
					email: "user@test.com",
					otp: "123456",
				});
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
			});
		});

		it("shows error toast when signIn.emailOtp fails", async () => {
			signInOtp.mockResolvedValue({ error: { message: "Invalid OTP" } });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			fireEvent.change(getOtpInput(), { target: { value: "123456" } });
			await user.click(otpForm().getByRole("button", { name: "otpLogin.submit" }));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Invalid OTP");
			});
		});

		it("uses statusText when OTP error message is empty", async () => {
			signInOtp.mockResolvedValue({ error: { message: "", statusText: "Unauthorized" } });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			fireEvent.change(getOtpInput(), { target: { value: "123456" } });
			await user.click(otpForm().getByRole("button", { name: "otpLogin.submit" }));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Unauthorized");
			});
		});
	});

	describe("resend button", () => {
		it("calls sendVerificationOtp on resend click", async () => {
			sendOtp.mockResolvedValue({ error: null });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			await user.click(getResendButton());

			await waitFor(() => {
				expect(sendOtp).toHaveBeenCalledWith({
					email: "user@test.com",
					type: "sign-in",
				});
			});
		});

		it("shows success toast on resend success", async () => {
			sendOtp.mockResolvedValue({ error: null });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			await user.click(getResendButton());

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
			});
		});

		it("disables resend button after successful resend", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			sendOtp.mockResolvedValue({ error: null });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			await user.click(getResendButton());

			await waitFor(() => {
				expect(getResendButton()).toBeDisabled();
			});

			vi.useRealTimers();
		});

		it("re-enables resend button after cooldown expires", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			sendOtp.mockResolvedValue({ error: null });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			await user.click(getResendButton());
			await waitFor(() => {
				expect(getResendButton()).toBeDisabled();
			});

			for (let i = 0; i < 60; i++) {
				await act(() => vi.advanceTimersByTime(1000));
			}

			expect(getResendButton()).toBeEnabled();

			vi.useRealTimers();
		});

		it("shows error toast and stays enabled on resend failure", async () => {
			sendOtp.mockResolvedValue({ error: { message: "Error", statusText: "Error" } });
			const { user } = renderOtp("user@test.com");
			await waitForOtpForm();

			await user.click(getResendButton());

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Error");
			});
			expect(getResendButton()).toBeEnabled();
		});
	});

	describe("change email", () => {
		it("renders change email button in OTP phase", async () => {
			renderOtp("user@test.com");
			await waitForOtpForm();

			expect(screen.getByRole("button", { name: /otpLogin\.changeEmail/ })).toBeInTheDocument();
		});

		it("navigates back to email phase when change email is clicked", async () => {
			const { user, router } = renderOtp("user@test.com", {
				initialSearch: { email: "user@test.com" },
			});
			await waitForOtpForm();

			await user.click(screen.getByRole("button", { name: /otpLogin\.changeEmail/ }));

			await waitFor(() => {
				const search = router.state.location.search;
				expect(search).not.toContain("email");
			});
		});
	});
});
