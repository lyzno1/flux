import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth-client";
import { renderAuthRoute } from "@/test/auth-test-utils";
import { SignUpForm } from "./sign-up-form";

const mockNavigate = vi.fn();

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		signUp: { email: vi.fn() },
		signIn: { social: vi.fn() },
	},
}));

vi.mock("sonner", async () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

function setInputValue(input: HTMLInputElement, value: string) {
	const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
	if (!descriptor?.set) throw new Error("Cannot find value setter");
	descriptor.set.call(input, value);
	fireEvent.input(input, { target: { value } });
	fireEvent.change(input, { target: { value } });
}

function getForm() {
	const form = document.querySelector("form");
	if (!form) throw new Error("form not found");
	return form;
}

function getInput(form: HTMLFormElement, id: string) {
	const input = form.querySelector<HTMLInputElement>(`#${id}`);
	if (!input) throw new Error(`input #${id} not found`);
	return input;
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
	await screen.findByRole("textbox", { name: /signUp\.name/i });
	const form = getForm();
	const scope = within(form);

	setInputValue(getInput(form, "name"), "Test User");
	setInputValue(getInput(form, "username"), "testuser");
	setInputValue(getInput(form, "email"), "test@example.com");
	setInputValue(getInput(form, "password"), "SecurePass123");

	await user.click(scope.getByRole("button", { name: /signUp\.submit/i }));
}

describe("SignUpForm", () => {
	it("renders all form fields and submit button", async () => {
		renderAuthRoute(SignUpForm, { path: "/sign-up" });

		await screen.findByRole("textbox", { name: /signUp\.name/i });
		const form = getForm();
		const scope = within(form);

		expect(form.querySelector("#name")).toBeInTheDocument();
		expect(form.querySelector("#username")).toBeInTheDocument();
		expect(form.querySelector("#email")).toBeInTheDocument();
		expect(form.querySelector("#password")).toBeInTheDocument();
		expect(scope.getByRole("button", { name: /signUp\.submit/i })).toBeInTheDocument();
	});

	it("calls authClient.signUp.email with form values on submit", async () => {
		vi.mocked(authClient.signUp.email).mockImplementation((_data, callbacks) => {
			callbacks?.onSuccess?.(undefined as never);
			return Promise.resolve(undefined as never);
		});

		const { user } = renderAuthRoute(SignUpForm, { path: "/sign-up" });

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(authClient.signUp.email).toHaveBeenCalledWith(
				{
					name: "Test User",
					username: "testuser",
					email: "test@example.com",
					password: "SecurePass123",
				},
				expect.objectContaining({
					onSuccess: expect.any(Function),
					onError: expect.any(Function),
				}),
			);
		});
	});

	it("shows success toast and navigates to /verify-email on success", async () => {
		const { toast } = await import("sonner");

		vi.mocked(authClient.signUp.email).mockImplementation((_data, callbacks) => {
			callbacks?.onSuccess?.(undefined as never);
			return Promise.resolve(undefined as never);
		});

		const { user } = renderAuthRoute(SignUpForm, {
			path: "/sign-up",
			initialSearch: { redirect: "/dify" },
		});

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith(
				expect.objectContaining({
					to: "/verify-email",
					search: expect.any(Function),
				}),
			);
		});

		const searchFn = (
			mockNavigate.mock.calls[0] as [{ search: (prev: Record<string, string>) => Record<string, string> }]
		)[0].search;
		expect(searchFn({ redirect: "/dify" })).toMatchObject({
			redirect: "/dify",
			email: "test@example.com",
		});
	});

	it("shows error toast with error message on failure", async () => {
		const { toast } = await import("sonner");

		vi.mocked(authClient.signUp.email).mockImplementation((_data, callbacks) => {
			callbacks?.onError?.({ error: { message: "Email already taken", statusText: "Conflict" } } as never);
			return Promise.resolve(undefined as never);
		});

		const { user } = renderAuthRoute(SignUpForm, { path: "/sign-up" });

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Email already taken");
		});
	});

	it("falls back to statusText when error message is empty", async () => {
		const { toast } = await import("sonner");

		vi.mocked(authClient.signUp.email).mockImplementation((_data, callbacks) => {
			callbacks?.onError?.({ error: { message: "", statusText: "Conflict" } } as never);
			return Promise.resolve(undefined as never);
		});

		const { user } = renderAuthRoute(SignUpForm, { path: "/sign-up" });

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Conflict");
		});
	});

	it("preserves redirect search param when navigating to /verify-email", async () => {
		vi.mocked(authClient.signUp.email).mockImplementation((_data, callbacks) => {
			callbacks?.onSuccess?.(undefined as never);
			return Promise.resolve(undefined as never);
		});

		const { user } = renderAuthRoute(SignUpForm, {
			path: "/sign-up",
			initialSearch: { redirect: "/dify" },
		});

		await fillAndSubmit(user);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/verify-email" }));
		});

		const searchFn = (
			mockNavigate.mock.calls[0] as [{ search: (prev: Record<string, string>) => Record<string, string> }]
		)[0].search;
		expect(searchFn({ redirect: "/dify" })).toMatchObject({
			redirect: "/dify",
			email: "test@example.com",
		});
	});
});
