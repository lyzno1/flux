import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/stores/app/store";
import { SidebarUserMenu } from "./sidebar-user-menu";

const { i18nState, mockChangeLanguage, mockInvalidate, mockNavigate, mockSetTheme, mockSignOut, mockUseSession } =
	vi.hoisted(() => ({
		i18nState: {
			language: "en-US",
		},
		mockChangeLanguage: vi.fn(),
		mockInvalidate: vi.fn(),
		mockNavigate: vi.fn(),
		mockSetTheme: vi.fn(),
		mockSignOut: vi.fn(),
		mockUseSession: vi.fn(),
	}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		useRouter: () => ({
			invalidate: mockInvalidate,
			navigate: mockNavigate,
		}),
	};
});

vi.mock("react-i18next", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-i18next")>();
	return {
		...actual,
		useTranslation: () => ({
			t: (key: string) => key,
			i18n: {
				language: i18nState.language,
				changeLanguage: mockChangeLanguage,
			},
		}),
	};
});

vi.mock("@/components/theme-provider", () => ({
	useTheme: () => ({
		setTheme: mockSetTheme,
	}),
}));

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		useSession: mockUseSession,
		signOut: mockSignOut,
	},
}));

vi.mock("@/components/ui/tooltip", async () => {
	const React = await import("react");
	return {
		Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
		TooltipTrigger: ({ children, render }: { children?: React.ReactNode; render?: React.ReactElement }) => {
			if (render && React.isValidElement(render)) {
				return React.cloneElement(render as React.ReactElement, {}, children);
			}
			return <div>{children}</div>;
		},
		TooltipContent: ({ children, side }: { children: React.ReactNode; side?: string }) => (
			<div data-testid="tooltip-content" data-side={side}>
				{children}
			</div>
		),
	};
});

vi.mock("@/components/ui/dropdown-menu", async () => {
	const React = await import("react");
	return {
		DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-root">{children}</div>,
		DropdownMenuTrigger: ({ children, render }: { children?: React.ReactNode; render?: React.ReactElement }) => {
			if (render && React.isValidElement(render)) {
				return React.cloneElement(
					render as React.ReactElement<{
						"data-testid"?: string;
					}>,
					{ "data-testid": "dropdown-trigger" },
					children,
				);
			}
			return (
				<button type="button" data-testid="dropdown-trigger">
					{children}
				</button>
			);
		},
		DropdownMenuContent: ({ children, side, align }: { children: React.ReactNode; side?: string; align?: string }) => (
			<div data-testid="dropdown-content" data-side={side} data-align={align}>
				{children}
			</div>
		),
		DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		DropdownMenuSeparator: () => <hr />,
		DropdownMenuSub: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		DropdownMenuSubContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		DropdownMenuSubTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		DropdownMenuItem: ({
			children,
			disabled,
			onClick,
			variant,
		}: {
			children: React.ReactNode;
			disabled?: boolean;
			onClick?: () => void;
			variant?: "default" | "destructive";
		}) => (
			<button type="button" data-variant={variant} disabled={disabled} onClick={onClick}>
				{children}
			</button>
		),
	};
});

type TestSession = {
	user: {
		name: string;
		email: string;
		image?: string | null;
	};
};

function setSessionState(session: TestSession | null, isPending = false) {
	const refetch = vi.fn().mockResolvedValue(undefined);
	mockUseSession.mockReturnValue({
		data: session,
		isPending,
		refetch,
	});
	return { refetch };
}

describe("SidebarUserMenu", () => {
	beforeEach(() => {
		act(() => {
			useAppStore.setState({ sidebarOpen: true });
		});
		mockNavigate.mockReset();
		mockInvalidate.mockReset();
		mockSetTheme.mockReset();
		mockChangeLanguage.mockReset();
		mockUseSession.mockReset();
		mockSignOut.mockReset();
		i18nState.language = "en-US";
	});

	afterEach(() => {
		cleanup();
	});

	it("renders a skeleton while session is pending", () => {
		setSessionState(null, true);

		render(<SidebarUserMenu />);

		expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
	});

	it("renders nothing when there is no active session", () => {
		setSessionState(null, false);

		const { container } = render(<SidebarUserMenu />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders user identity with avatar fallback when image is missing", () => {
		setSessionState({
			user: {
				name: "alice",
				email: "alice@example.com",
				image: null,
			},
		});

		render(<SidebarUserMenu />);

		expect(screen.getAllByText("alice")).toHaveLength(2);
		expect(screen.getAllByText("alice@example.com")).toHaveLength(2);
		expect(document.querySelector('[data-slot="avatar-fallback"]')).toHaveTextContent("A");
		expect(document.querySelector('[data-slot="avatar-image"]')).not.toBeInTheDocument();
	});

	it("always positions dropdown above with start alignment", () => {
		setSessionState({
			user: { name: "Alice", email: "alice@example.com" },
		});

		const { rerender } = render(<SidebarUserMenu />);
		expect(screen.getByTestId("dropdown-content")).toHaveAttribute("data-side", "top");
		expect(screen.getByTestId("dropdown-content")).toHaveAttribute("data-align", "start");

		act(() => {
			useAppStore.setState({ sidebarOpen: false });
		});
		rerender(<SidebarUserMenu />);

		expect(screen.getByTestId("dropdown-content")).toHaveAttribute("data-side", "top");
		expect(screen.getByTestId("dropdown-content")).toHaveAttribute("data-align", "start");
	});

	it("shows tooltip with username when sidebar is collapsed", () => {
		setSessionState({
			user: { name: "Alice", email: "alice@example.com" },
		});

		const { rerender } = render(<SidebarUserMenu />);
		expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();

		act(() => {
			useAppStore.setState({ sidebarOpen: false });
		});
		rerender(<SidebarUserMenu />);

		expect(screen.getByTestId("tooltip-content")).toHaveTextContent("Alice");
	});

	it("changes language from language submenu items", () => {
		setSessionState({
			user: { name: "Alice", email: "alice@example.com" },
		});

		render(<SidebarUserMenu />);

		expect(screen.getByRole("button", { name: "English" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "中文" }));

		expect(mockChangeLanguage).toHaveBeenCalledWith("zh-CN");
	});

	it("applies selected theme option", () => {
		setSessionState({
			user: { name: "Alice", email: "alice@example.com" },
		});

		render(<SidebarUserMenu />);

		fireEvent.click(screen.getByRole("button", { name: "theme.light" }));
		fireEvent.click(screen.getByRole("button", { name: "theme.dark" }));
		fireEvent.click(screen.getByRole("button", { name: "theme.system" }));

		expect(mockSetTheme).toHaveBeenNthCalledWith(1, "light");
		expect(mockSetTheme).toHaveBeenNthCalledWith(2, "dark");
		expect(mockSetTheme).toHaveBeenNthCalledWith(3, "system");
	});

	it("signs out, refetches session and navigates to login on success", async () => {
		const { refetch } = setSessionState({
			user: { name: "Alice", email: "alice@example.com" },
		});
		mockSignOut.mockResolvedValue(undefined);
		mockInvalidate.mockResolvedValue(undefined);
		mockNavigate.mockResolvedValue(undefined);

		render(<SidebarUserMenu />);

		fireEvent.click(screen.getByRole("button", { name: "user.signOut" }));

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalledOnce();
		});
		expect(refetch).toHaveBeenCalledOnce();
		expect(mockInvalidate).toHaveBeenCalledWith({ sync: true });
		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/login",
			search: { redirect: "/dify" },
			replace: true,
		});
	});

	it("falls back to hard navigation when router invalidation fails", async () => {
		setSessionState({
			user: { name: "Alice", email: "alice@example.com" },
		});
		mockSignOut.mockResolvedValue(undefined);
		mockInvalidate.mockRejectedValue(new Error("invalidate failed"));

		render(<SidebarUserMenu />);

		fireEvent.click(screen.getByRole("button", { name: "user.signOut" }));

		await waitFor(() => {
			expect(mockInvalidate).toHaveBeenCalledWith({ sync: true });
		});
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});
