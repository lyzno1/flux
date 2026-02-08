import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarContent } from "./sidebar-content";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "./sidebar-group";
import { SidebarHeader } from "./sidebar-header";
import { SidebarInset } from "./sidebar-inset";
import { SidebarMenu, SidebarMenuItem } from "./sidebar-menu";
import { SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "./sidebar-menu-sub";
import { SidebarSeparator } from "./sidebar-separator";

describe("Sidebar structural components", () => {
	afterEach(() => {
		cleanup();
	});

	it("creates a semantic sidebar layout with menu and submenu structures", () => {
		render(
			<SidebarInset>
				<SidebarHeader>Header</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Navigation</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu aria-label="Main menu">
								<SidebarMenuItem>
									<button type="button">Home</button>
								</SidebarMenuItem>
							</SidebarMenu>
							<SidebarMenuSub aria-label="Sub menu">
								<SidebarMenuSubItem>
									<SidebarMenuSubButton isActive>Settings</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							</SidebarMenuSub>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarSeparator orientation="vertical" />
				<SidebarFooter>Footer</SidebarFooter>
			</SidebarInset>,
		);

		const main = screen.getByRole("main");
		const mainScope = within(main);

		expect(main).toHaveAttribute("data-sidebar", "inset");
		expect(mainScope.getByText("Header")).toBeInTheDocument();
		expect(mainScope.getByText("Footer")).toBeInTheDocument();
		expect(document.querySelector('[data-sidebar="content"]')).toBeInTheDocument();
		expect(document.querySelector('[data-sidebar="group"]')).toBeInTheDocument();
		expect(document.querySelector('[data-sidebar="group-label"]')).toHaveTextContent("Navigation");
		expect(document.querySelector('[data-sidebar="group-content"]')).toBeInTheDocument();

		const mainMenu = screen.getByRole("list", { name: "Main menu" });
		expect(mainMenu).toHaveAttribute("data-sidebar", "menu");
		expect(within(mainMenu).getByRole("listitem")).toHaveAttribute("data-sidebar", "menu-item");
		expect(screen.getByRole("list", { name: "Sub menu" })).toHaveAttribute("data-sidebar", "menu-sub");
		expect(document.querySelector('[data-sidebar="menu-sub-item"]')).toBeInTheDocument();

		const subButton = screen.getByRole("button", { name: "Settings" });
		expect(subButton).toHaveAttribute("type", "button");
		expect(subButton).toHaveAttribute("data-sidebar", "menu-sub-button");
		expect(subButton).toHaveAttribute("data-active", "true");

		const separator = screen.getByRole("separator");
		expect(separator).toHaveAttribute("data-sidebar", "separator");
		expect(separator).toHaveAttribute("aria-orientation", "vertical");
	});

	it("forwards native props and event handlers to the rendered elements", () => {
		const onContentScroll = vi.fn();
		const onGroupLabelClick = vi.fn();
		const onSubButtonClick = vi.fn();

		render(
			<SidebarContent aria-label="Scrollable content" onScroll={onContentScroll}>
				<SidebarGroupLabel onClick={onGroupLabelClick}>Clickable group</SidebarGroupLabel>
				<SidebarMenuSubButton aria-label="Nested action" onClick={onSubButtonClick}>
					Nested action
				</SidebarMenuSubButton>
			</SidebarContent>,
		);

		fireEvent.scroll(screen.getByLabelText("Scrollable content"));
		fireEvent.click(screen.getByText("Clickable group"));
		fireEvent.click(screen.getByRole("button", { name: "Nested action" }));

		expect(onContentScroll).toHaveBeenCalledOnce();
		expect(onGroupLabelClick).toHaveBeenCalledOnce();
		expect(onSubButtonClick).toHaveBeenCalledOnce();
	});
});
