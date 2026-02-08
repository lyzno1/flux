import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/stores/app/store";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, Sidebar } from "./sidebar";

const mockUseIsMobile = vi.fn(() => false);

vi.mock("@/hooks/use-is-mobile", () => ({
	useIsMobile: () => mockUseIsMobile(),
}));

function setupCollapsedSidebar(setSidebarOpen = vi.fn()) {
	act(() => {
		useAppStore.setState((state) => ({
			...state,
			sidebarOpen: false,
			setSidebarOpen,
		}));
	});
	return setSidebarOpen;
}

describe("Sidebar", () => {
	beforeEach(() => {
		mockUseIsMobile.mockReturnValue(false);
		act(() => {
			useAppStore.setState({ sidebarOpen: true });
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders expanded desktop sidebar by default", () => {
		render(
			<Sidebar>
				<div>Content</div>
			</Sidebar>,
		);

		const wrapper = document.querySelector<HTMLElement>('[data-sidebar="sidebar-wrapper"]');
		const aside = document.querySelector<HTMLElement>('aside[data-sidebar="sidebar"]');

		expect(wrapper).toBeInTheDocument();
		expect(wrapper).toHaveAttribute("data-state", "expanded");
		expect(wrapper).toHaveStyle({ width: SIDEBAR_WIDTH });
		expect(aside).toHaveAttribute("data-state", "expanded");
		expect(aside).toHaveStyle({ width: SIDEBAR_WIDTH });
		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("renders collapsed desktop sidebar width when store state is closed", () => {
		act(() => {
			useAppStore.setState({ sidebarOpen: false });
		});

		render(
			<Sidebar>
				<div>Content</div>
			</Sidebar>,
		);

		const wrapper = document.querySelector<HTMLElement>('[data-sidebar="sidebar-wrapper"]');
		const aside = document.querySelector<HTMLElement>('aside[data-sidebar="sidebar"]');

		expect(wrapper).toHaveAttribute("data-state", "collapsed");
		expect(wrapper).toHaveStyle({ width: SIDEBAR_WIDTH_ICON });
		expect(aside).toHaveAttribute("data-state", "collapsed");
		expect(aside).toHaveStyle({ width: SIDEBAR_WIDTH_ICON });
	});

	it("expands when clicking empty area in collapsed desktop mode", () => {
		const setSidebarOpen = setupCollapsedSidebar();

		render(
			<Sidebar>
				<div>Content</div>
			</Sidebar>,
		);

		const aside = document.querySelector<HTMLElement>('aside[data-sidebar="sidebar"]');
		if (!aside) throw new Error("sidebar aside not found");

		fireEvent.click(aside);

		expect(setSidebarOpen).toHaveBeenCalledWith(true);
	});

	it("does not expand when click target is interactive", () => {
		const setSidebarOpen = setupCollapsedSidebar();

		render(
			<Sidebar>
				<button type="button">Action</button>
			</Sidebar>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Action" }));

		expect(setSidebarOpen).not.toHaveBeenCalled();
	});

	it("expands on Enter keydown from non-interactive target and prevents default", () => {
		const setSidebarOpen = setupCollapsedSidebar();

		render(
			<Sidebar>
				<div>Content</div>
			</Sidebar>,
		);

		const aside = document.querySelector<HTMLElement>('aside[data-sidebar="sidebar"]');
		if (!aside) throw new Error("sidebar aside not found");

		const keyEvent = new KeyboardEvent("keydown", {
			key: "Enter",
			bubbles: true,
			cancelable: true,
		});
		aside.dispatchEvent(keyEvent);

		expect(keyEvent.defaultPrevented).toBe(true);
		expect(setSidebarOpen).toHaveBeenCalledWith(true);
	});

	it("does not expand on Enter keydown from interactive target", () => {
		const setSidebarOpen = setupCollapsedSidebar();

		render(
			<Sidebar>
				<a href="/target">Target</a>
			</Sidebar>,
		);

		fireEvent.keyDown(screen.getByRole("link", { name: "Target" }), {
			key: "Enter",
		});

		expect(setSidebarOpen).not.toHaveBeenCalled();
	});

	it("renders mobile sidebar popup when on mobile", () => {
		mockUseIsMobile.mockReturnValue(true);
		act(() => {
			useAppStore.setState({ sidebarOpen: true });
		});

		render(
			<Sidebar>
				<div>Mobile Content</div>
			</Sidebar>,
		);

		expect(document.querySelector('[data-sidebar="sidebar-wrapper"]')).not.toBeInTheDocument();

		const popup = document.querySelector<HTMLElement>('[data-sidebar="sidebar"][data-mobile="true"]');
		expect(popup).toBeInTheDocument();
		expect(popup).toHaveStyle({ width: "18rem" });
		expect(screen.getByText("Mobile Content")).toBeInTheDocument();
	});
});
