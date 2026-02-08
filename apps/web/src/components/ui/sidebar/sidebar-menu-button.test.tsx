import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/stores/app/store";
import { SidebarMenuButton } from "./sidebar-menu-button";

const mockUseIsMobile = vi.fn(() => false);

vi.mock("@/hooks/use-is-mobile", () => ({
	useIsMobile: () => mockUseIsMobile(),
}));

vi.mock("@/components/ui/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-root">{children}</div>,
	TooltipTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<div data-testid="tooltip-trigger" data-classname={className}>
			{children}
		</div>
	),
	TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));

describe("SidebarMenuButton", () => {
	beforeEach(() => {
		act(() => {
			useAppStore.setState({ sidebarOpen: true });
		});
		mockUseIsMobile.mockReturnValue(false);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders as a button with inactive state by default", () => {
		render(<SidebarMenuButton>Dashboard</SidebarMenuButton>);

		const button = screen.getByRole("button", { name: "Dashboard" });
		expect(button).toHaveAttribute("type", "button");
		expect(button).toHaveAttribute("data-sidebar", "menu-button");
		expect(button).toHaveAttribute("data-active", "false");
		expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
	});

	it("uses active state and forwards click handler", () => {
		const onClick = vi.fn();

		render(
			<SidebarMenuButton isActive onClick={onClick}>
				Projects
			</SidebarMenuButton>,
		);

		const button = screen.getByRole("button", { name: "Projects" });
		fireEvent.click(button);

		expect(button).toHaveAttribute("data-active", "true");
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("shows tooltip in collapsed desktop mode using string children as label", () => {
		act(() => {
			useAppStore.setState({ sidebarOpen: false });
		});

		render(<SidebarMenuButton>Inbox</SidebarMenuButton>);

		expect(screen.getByTestId("tooltip-root")).toBeInTheDocument();
		expect(screen.getByTestId("tooltip-trigger")).toBeInTheDocument();
		expect(screen.getByTestId("tooltip-content")).toHaveTextContent("Inbox");
	});

	it("does not show tooltip in collapsed mobile mode", () => {
		act(() => {
			useAppStore.setState({ sidebarOpen: false });
		});
		mockUseIsMobile.mockReturnValue(true);

		render(<SidebarMenuButton>Inbox</SidebarMenuButton>);

		expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
	});

	it("uses explicit tooltip text when provided", () => {
		act(() => {
			useAppStore.setState({ sidebarOpen: false });
		});

		render(
			<SidebarMenuButton tooltip="Open projects">
				<span>Projects</span>
			</SidebarMenuButton>,
		);

		expect(screen.getByTestId("tooltip-content")).toHaveTextContent("Open projects");
	});
});
