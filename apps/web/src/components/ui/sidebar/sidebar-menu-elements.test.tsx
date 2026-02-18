import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarMenuAction } from "./sidebar-menu-action";
import { SidebarMenuBadge } from "./sidebar-menu-badge";
import { SidebarMenuSkeleton } from "./sidebar-menu-skeleton";

vi.mock("@/components/ui/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-root">{children}</div>,
	TooltipTrigger: ({ children, render }: { children?: React.ReactNode; render?: React.ReactNode }) => (
		<div data-testid="tooltip-trigger">{render ?? children}</div>
	),
	TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));

afterEach(() => {
	cleanup();
});

describe("SidebarMenuAction", () => {
	it("renders as a plain action button when tooltip is not provided", () => {
		const onClick = vi.fn();

		render(
			<SidebarMenuAction aria-label="Pin item" onClick={onClick}>
				Pin
			</SidebarMenuAction>,
		);

		const button = screen.getByRole("button", { name: "Pin item" });
		fireEvent.click(button);

		expect(button).toHaveAttribute("type", "button");
		expect(button).toHaveAttribute("data-sidebar", "menu-action");
		expect(onClick).toHaveBeenCalledOnce();
		expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
	});

	it("renders tooltip wrapper and content when tooltip text is provided", () => {
		render(
			<SidebarMenuAction aria-label="Delete item" tooltip="Delete">
				Delete
			</SidebarMenuAction>,
		);

		expect(screen.getByTestId("tooltip-root")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Delete item" })).toBeInTheDocument();
		expect(screen.getByTestId("tooltip-content")).toHaveTextContent("Delete");
	});
});

describe("SidebarMenuBadge", () => {
	it("renders badge content and forwards accessibility props", () => {
		render(
			<SidebarMenuBadge aria-label="Unread count" title="Unread notifications">
				12
			</SidebarMenuBadge>,
		);

		const badge = screen.getByLabelText("Unread count");
		expect(badge).toHaveAttribute("data-sidebar", "menu-badge");
		expect(badge).toHaveAttribute("title", "Unread notifications");
		expect(badge).toHaveTextContent("12");
	});
});

describe("SidebarMenuSkeleton", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("generates a bounded width once and keeps it stable across rerenders", () => {
		const { container, rerender } = render(<SidebarMenuSkeleton />);
		let skeletons = container.querySelectorAll<HTMLElement>('[data-slot="skeleton"]');
		const firstWidth = skeletons[0]?.style.getPropertyValue("--skeleton-width");

		expect(skeletons).toHaveLength(1);
		expect(firstWidth).toMatch(/^\d+%$/);
		expect(Number.parseInt(firstWidth ?? "", 10)).toBeGreaterThanOrEqual(50);
		expect(Number.parseInt(firstWidth ?? "", 10)).toBeLessThan(90);
		rerender(<SidebarMenuSkeleton />);

		skeletons = container.querySelectorAll<HTMLElement>('[data-slot="skeleton"]');
		expect(skeletons[0]?.style.getPropertyValue("--skeleton-width")).toBe(firstWidth);
	});

	it("renders icon placeholder when showIcon is enabled", () => {
		const { container } = render(<SidebarMenuSkeleton showIcon />);
		const skeletons = container.querySelectorAll<HTMLElement>('[data-slot="skeleton"]');

		expect(skeletons).toHaveLength(2);
	});
});
