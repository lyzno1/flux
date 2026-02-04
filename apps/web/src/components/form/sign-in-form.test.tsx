import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderAuthRoute } from "@/test/auth-test-utils";

import { SignInForm } from "./sign-in-form";

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		signIn: { email: vi.fn(), username: vi.fn(), social: vi.fn() },
		emailOtp: { sendVerificationOtp: vi.fn() },
	},
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

beforeEach(() => {
	vi.mocked(authClient.signIn.email).mockReset();
	vi.mocked(authClient.signIn.username).mockReset();
	vi.mocked(authClient.signIn.social).mockReset();
	vi.mocked(authClient.emailOtp.sendVerificationOtp).mockReset();
	vi.mocked(toast.success).mockReset();
	vi.mocked(toast.error).mockReset();
});

afterEach(() => {
	cleanup();
});

async function fillAndSubmit(
	user: ReturnType<typeof import("@testing-library/user-event")["default"]["setup"]>,
	identifier: string,
	password: string,
) {
	const identifierInput = await screen.findByRole("textbox", {
		name: /signIn\.email/,
	});
	const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]');
	if (!passwordInput) throw new Error("password input not found");
	const [submitButton] = screen.getAllByRole("button", {
		name: /signIn\.submit/,
	});
	if (!submitButton) throw new Error("submit button not found");

	await user.type(identifierInput, identifier);
	await user.type(passwordInput, password);
	await user.click(submitButton);
}

describe("SignInForm", () => {
	describe("identifier routing", () => {
		it("calls signIn.email when identifier contains @", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: null,
			});
			const { user } = renderAuthRoute(SignInForm, { path: "/login" });

			await fillAndSubmit(user, "user@example.com", "password123");

			await waitFor(() => {
				expect(authClient.signIn.email).toHaveBeenCalledWith({
					email: "user@example.com",
					password: "password123",
				});
			});
			expect(authClient.signIn.username).not.toHaveBeenCalled();
		});

		it("calls signIn.username when identifier does not contain @", async () => {
			vi.mocked(authClient.signIn.username).mockResolvedValue({
				error: null,
			});
			const { user } = renderAuthRoute(SignInForm, { path: "/login" });

			await fillAndSubmit(user, "myusername", "password123");

			await waitFor(() => {
				expect(authClient.signIn.username).toHaveBeenCalledWith({
					username: "myusername",
					password: "password123",
				});
			});
			expect(authClient.signIn.email).not.toHaveBeenCalled();
		});
	});

	describe("error path", () => {
		it("shows toast error and does not navigate on API error", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: {
					message: "Invalid credentials",
					statusText: "Unauthorized",
				},
			});
			const { user, router } = renderAuthRoute(SignInForm, {
				path: "/login",
			});

			await fillAndSubmit(user, "user@example.com", "wrong");

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
			});
			expect(toast.success).not.toHaveBeenCalled();
			expect(router.state.location.pathname).toBe("/login");
		});

		it("redirects to verify-email and sends OTP on 403 for email identifier", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: { message: "", statusText: "Forbidden", status: 403 },
			});
			vi.mocked(authClient.emailOtp.sendVerificationOtp).mockResolvedValue({
				error: null,
			});
			const { user, router } = renderAuthRoute(SignInForm, {
				path: "/login",
			});

			await fillAndSubmit(user, "user@example.com", "password123");

			await waitFor(() => {
				expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledWith({
					email: "user@example.com",
					type: "email-verification",
				});
			});
			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("signIn.verifyEmailRequired");
			});
			await waitFor(() => {
				expect(router.state.location.pathname).toBe("/verify-email");
			});
		});

		it("shows username-specific message on 403 for username identifier", async () => {
			vi.mocked(authClient.signIn.username).mockResolvedValue({
				error: { message: "", statusText: "Forbidden", status: 403 },
			});
			const { user, router } = renderAuthRoute(SignInForm, {
				path: "/login",
			});

			await fillAndSubmit(user, "myusername", "password123");

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("signIn.verifyEmailRequiredUsername");
			});
			expect(router.state.location.pathname).toBe("/login");
		});

		it("falls back to statusText when message is empty", async () => {
			vi.mocked(authClient.signIn.username).mockResolvedValue({
				error: { message: "", statusText: "Bad Request" },
			});
			const { user } = renderAuthRoute(SignInForm, { path: "/login" });

			await fillAndSubmit(user, "myuser", "wrong");

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Bad Request");
			});
		});
	});

	describe("success path", () => {
		it("navigates to default redirect and shows success toast", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: null,
			});
			const { user, router } = renderAuthRoute(SignInForm, {
				path: "/login",
			});

			await fillAndSubmit(user, "user@example.com", "password123");

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
			});
			await waitFor(
				() => {
					expect(router.state.location.pathname).toBe("/dashboard");
				},
				{ timeout: 3000 },
			);
		});

		it("navigates to custom redirect from search params", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: null,
			});
			const { user, router } = renderAuthRoute(SignInForm, {
				path: "/login",
				initialSearch: { redirect: "/settings" },
			});

			await fillAndSubmit(user, "user@example.com", "password123");

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalled();
			});
			await waitFor(
				() => {
					expect(router.state.location.pathname).toBe("/settings");
				},
				{ timeout: 3000 },
			);
		});
	});

	describe("search param preservation", () => {
		it("preserves redirect param in navigation links", async () => {
			renderAuthRoute(SignInForm, {
				path: "/login",
				initialSearch: { redirect: "/dify" },
			});

			const links = await screen.findAllByRole("link");
			for (const link of links) {
				const href = link.getAttribute("href");
				if (href && !href.startsWith("http")) {
					expect(href).toContain("redirect");
				}
			}
		});
	});
});
