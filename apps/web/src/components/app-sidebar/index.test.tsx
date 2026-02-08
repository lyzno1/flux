import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/stores/app/store";
import { AppSidebar } from ".";

const routerState = { pathname: "/dify" };
const toggleSidebarMock = vi.fn();

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
			<a href={to} {...props}>
				{children}
			</a>
		),
		useRouter: () => ({
			state: {
				location: {
					pathname: routerState.pathname,
				},
			},
		}),
	};
});

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

vi.mock("@/components/app-sidebar/sidebar-user-menu", () => ({
	SidebarUserMenu: () => <div data-testid="sidebar-user-menu">User Menu</div>,
}));

describe("AppSidebar", () => {
	beforeEach(() => {
		routerState.pathname = "/dify";
		toggleSidebarMock.mockReset();
		act(() => {
			useAppStore.setState((state) => ({
				...state,
				sidebarOpen: true,
				toggleSidebar: toggleSidebarMock,
			}));
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders app sections with navigation and user menu", () => {
		render(<AppSidebar />);

		expect(screen.getByRole("button", { name: "Toggle sidebar" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
		expect(screen.getByTestId("sidebar-user-menu")).toBeInTheDocument();
	});

	it("calls store toggle action when header toggle button is clicked", () => {
		render(<AppSidebar />);

		fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));

		expect(toggleSidebarMock).toHaveBeenCalledOnce();
	});

	it("marks home link active based on current route path", () => {
		const { rerender } = render(<AppSidebar />);
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("data-active", "true");

		routerState.pathname = "/settings";
		rerender(<AppSidebar />);
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("data-active", "false");
	});

	it("shows open tooltip on right when sidebar is collapsed", () => {
		act(() => {
			useAppStore.setState((state) => ({
				...state,
				sidebarOpen: false,
				toggleSidebar: toggleSidebarMock,
			}));
		});

		render(<AppSidebar />);

		const tooltip = screen.getByTestId("tooltip-content");
		expect(tooltip).toHaveAttribute("data-side", "right");
		expect(tooltip).toHaveTextContent("sidebar.open");
	});

	it("shows close tooltip on bottom when sidebar is expanded", () => {
		render(<AppSidebar />);

		const tooltip = screen.getByTestId("tooltip-content");
		expect(tooltip).toHaveAttribute("data-side", "bottom");
		expect(tooltip).toHaveTextContent("sidebar.close");
	});
});
