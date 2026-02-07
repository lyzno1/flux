import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { useAppForm } from "./use-app-form";

class MockResizeObserver {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}
vi.stubGlobal("ResizeObserver", MockResizeObserver);

afterEach(cleanup);

describe("TextField", () => {
	function TextFieldForm({ defaultValue = "" }: { defaultValue?: string }) {
		const form = useAppForm({
			defaultValues: { name: defaultValue },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="name">
				{(field) => <field.TextField label="Name" placeholder="Enter name" autoComplete="given-name" />}
			</form.AppField>
		);
	}

	it("renders label and input with placeholder", () => {
		render(<TextFieldForm />);
		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
	});

	it("passes autoComplete to input", () => {
		render(<TextFieldForm />);
		expect(screen.getByPlaceholderText("Enter name")).toHaveAttribute("autocomplete", "given-name");
	});

	it("updates value on user input", async () => {
		const user = userEvent.setup();
		render(<TextFieldForm />);
		const input = screen.getByPlaceholderText("Enter name");
		await user.type(input, "John");
		expect(input).toHaveValue("John");
	});

	it("renders with default value", () => {
		render(<TextFieldForm defaultValue="Jane" />);
		expect(screen.getByPlaceholderText("Enter name")).toHaveValue("Jane");
	});
});

describe("EmailField", () => {
	function EmailFieldForm() {
		const form = useAppForm({
			defaultValues: { email: "" },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="email">
				{(field) => <field.EmailField label="Email" placeholder="you@example.com" />}
			</form.AppField>
		);
	}

	it("renders input with email type", () => {
		render(<EmailFieldForm />);
		expect(screen.getByPlaceholderText("you@example.com")).toHaveAttribute("type", "email");
	});

	it("defaults autoComplete to email", () => {
		render(<EmailFieldForm />);
		expect(screen.getByPlaceholderText("you@example.com")).toHaveAttribute("autocomplete", "email");
	});
});

describe("PasswordField", () => {
	function PasswordFieldForm() {
		const form = useAppForm({
			defaultValues: { password: "" },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="password">
				{(field) => <field.PasswordField label="Password" placeholder="Enter password" />}
			</form.AppField>
		);
	}

	it("renders input with password type", () => {
		render(<PasswordFieldForm />);
		expect(screen.getByPlaceholderText("Enter password")).toHaveAttribute("type", "password");
	});

	it("disables spellCheck", () => {
		render(<PasswordFieldForm />);
		expect(screen.getByPlaceholderText("Enter password")).toHaveAttribute("spellcheck", "false");
	});
});

describe("IconEmailField", () => {
	function IconEmailFieldForm({ labelExtra }: { labelExtra?: React.ReactNode }) {
		const form = useAppForm({
			defaultValues: { email: "" },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="email">
				{(field) => <field.IconEmailField label="Email" labelExtra={labelExtra} placeholder="you@example.com" />}
			</form.AppField>
		);
	}

	it("renders input with email type and default autoComplete", () => {
		render(<IconEmailFieldForm />);
		const input = screen.getByPlaceholderText("you@example.com");
		expect(input).toHaveAttribute("type", "email");
		expect(input).toHaveAttribute("autocomplete", "email");
	});

	it("renders labelExtra when provided", () => {
		render(<IconEmailFieldForm labelExtra={<span data-testid="extra">Hint</span>} />);
		expect(screen.getByTestId("extra")).toBeInTheDocument();
	});
});

describe("IconPasswordField", () => {
	function IconPasswordFieldForm({
		toggleLabels,
		labelExtra,
	}: {
		toggleLabels?: { show: string; hide: string };
		labelExtra?: React.ReactNode;
	}) {
		const form = useAppForm({
			defaultValues: { password: "" },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="password">
				{(field) => (
					<field.IconPasswordField
						label="Password"
						labelExtra={labelExtra}
						placeholder="Enter password"
						toggleLabels={toggleLabels}
					/>
				)}
			</form.AppField>
		);
	}

	it("initially renders with password type", () => {
		render(<IconPasswordFieldForm />);
		expect(screen.getByPlaceholderText("Enter password")).toHaveAttribute("type", "password");
	});

	it("toggles password visibility on button click", async () => {
		const user = userEvent.setup();
		render(<IconPasswordFieldForm />);
		const input = screen.getByPlaceholderText("Enter password");

		await user.click(screen.getByRole("button", { name: "Show password" }));
		expect(input).toHaveAttribute("type", "text");
		expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Hide password" }));
		expect(input).toHaveAttribute("type", "password");
		expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
	});

	it("uses custom toggle labels", () => {
		render(<IconPasswordFieldForm toggleLabels={{ show: "Reveal", hide: "Conceal" }} />);
		expect(screen.getByRole("button", { name: "Reveal" })).toBeInTheDocument();
	});

	it("renders labelExtra", () => {
		render(<IconPasswordFieldForm labelExtra={<a href="/forgot">Forgot?</a>} />);
		expect(screen.getByRole("link", { name: "Forgot?" })).toBeInTheDocument();
	});
});

describe("IconTextField", () => {
	function IconTextFieldForm() {
		const form = useAppForm({
			defaultValues: { search: "" },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="search">
				{(field) => (
					<field.IconTextField label="Search" placeholder="Search..." icon={<span data-testid="search-icon">S</span>} />
				)}
			</form.AppField>
		);
	}

	it("renders with custom icon", () => {
		render(<IconTextFieldForm />);
		expect(screen.getByTestId("search-icon")).toBeInTheDocument();
	});

	it("renders input with text type", () => {
		render(<IconTextFieldForm />);
		expect(screen.getByPlaceholderText("Search...")).toHaveAttribute("type", "text");
	});
});

describe("OTPField", () => {
	function OTPFieldForm({ length }: { length?: number }) {
		const form = useAppForm({
			defaultValues: { otp: "" },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="otp">
				{(field) => <field.OTPField label="Verification Code" length={length} />}
			</form.AppField>
		);
	}

	it("renders label", () => {
		render(<OTPFieldForm />);
		expect(screen.getByText("Verification Code")).toBeInTheDocument();
	});

	it("renders without errors with default length", () => {
		expect(() => render(<OTPFieldForm />)).not.toThrow();
	});

	it("renders without errors with custom length", () => {
		expect(() => render(<OTPFieldForm length={4} />)).not.toThrow();
	});
});

describe("SubmitButton", () => {
	function SubmitForm({ onSubmit, children }: { onSubmit?: () => Promise<void>; children?: React.ReactNode }) {
		const form = useAppForm({
			defaultValues: { name: "" },
			onSubmit: onSubmit ? () => onSubmit() : vi.fn(),
		});
		return (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					<form.SubmitButton label="Submit" submittingLabel="Submitting...">
						{children}
					</form.SubmitButton>
				</form.AppForm>
			</form>
		);
	}

	it("renders with label text", () => {
		render(<SubmitForm />);
		expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
	});

	it("renders children alongside label", () => {
		render(
			<SubmitForm>
				<span data-testid="arrow">→</span>
			</SubmitForm>,
		);
		expect(screen.getByTestId("arrow")).toBeInTheDocument();
		expect(screen.getByRole("button")).toHaveTextContent("Submit");
	});

	it("shows submitting state and hides children during submission", async () => {
		let resolveSubmit!: () => void;
		const onSubmit = vi.fn(
			() =>
				new Promise<void>((r) => {
					resolveSubmit = r;
				}),
		);

		const user = userEvent.setup();
		render(
			<SubmitForm onSubmit={onSubmit}>
				<span data-testid="arrow">→</span>
			</SubmitForm>,
		);

		await user.click(screen.getByRole("button", { name: /Submit/ }));

		await waitFor(() => {
			const btn = screen.getByRole("button");
			expect(btn).toHaveTextContent("Submitting...");
			expect(btn).toBeDisabled();
		});
		expect(screen.queryByTestId("arrow")).not.toBeInTheDocument();

		resolveSubmit();

		await waitFor(() => {
			const btn = screen.getByRole("button");
			expect(btn).toHaveTextContent("Submit");
			expect(btn).not.toBeDisabled();
		});
		expect(screen.getByTestId("arrow")).toBeInTheDocument();
	});
});

describe("validation errors", () => {
	const nameSchema = z.string().min(1, "Name is required");

	function ValidatedForm() {
		const form = useAppForm({
			defaultValues: { name: "" },
			onSubmit: vi.fn(),
		});
		return (
			<form.AppField name="name" validators={{ onChange: nameSchema }}>
				{(field) => <field.TextField label="Name" placeholder="Enter name" />}
			</form.AppField>
		);
	}

	it("displays error message after invalid input", async () => {
		const user = userEvent.setup();
		render(<ValidatedForm />);
		const input = screen.getByPlaceholderText("Enter name");

		await user.type(input, "a");
		await user.clear(input);

		await waitFor(() => {
			expect(screen.getByText("Name is required")).toBeInTheDocument();
		});
	});

	it("sets aria-invalid when field has errors", async () => {
		const user = userEvent.setup();
		render(<ValidatedForm />);
		const input = screen.getByPlaceholderText("Enter name");

		await user.type(input, "a");
		await user.clear(input);

		await waitFor(() => {
			expect(input).toHaveAttribute("aria-invalid", "true");
		});
	});

	it("clears error when value becomes valid", async () => {
		const user = userEvent.setup();
		render(<ValidatedForm />);
		const input = screen.getByPlaceholderText("Enter name");

		await user.type(input, "a");
		await user.clear(input);

		await waitFor(() => {
			expect(screen.getByText("Name is required")).toBeInTheDocument();
		});

		await user.type(input, "valid");

		await waitFor(() => {
			expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
		});
	});
});
