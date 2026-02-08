import type { AppStore } from "../../store";

const isSidebarOpen = (s: AppStore) => s.sidebarOpen;
const isSidebarMobile = (s: AppStore) => s.sidebarIsMobile;
const isSidebarCollapsed = (s: AppStore) => !s.sidebarOpen;
const sidebarState = (s: AppStore): "expanded" | "collapsed" => (s.sidebarOpen ? "expanded" : "collapsed");

export const sidebarSelectors = {
	isSidebarOpen,
	isSidebarMobile,
	isSidebarCollapsed,
	sidebarState,
};
