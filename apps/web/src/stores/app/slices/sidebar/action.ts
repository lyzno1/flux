import type { StateCreator } from "zustand";
import type { AppStore } from "../../store";

export type SidebarAction = {
	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;
	setSidebarIsMobile: (isMobile: boolean) => void;
};

export const createSidebarSlice: StateCreator<
	AppStore,
	[["zustand/devtools", never], ["zustand/persist", unknown]],
	[],
	SidebarAction
> = (set) => ({
	toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "toggleSidebar"),

	setSidebarOpen: (open) => set({ sidebarOpen: open }, false, "setSidebarOpen"),

	setSidebarIsMobile: (isMobile) => set({ sidebarIsMobile: isMobile }, false, "setSidebarIsMobile"),
});
