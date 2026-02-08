import type { AppStore } from "../../store";

const isSidebarOpen = (s: AppStore) => s.sidebarOpen;
const isSidebarCollapsed = (s: AppStore) => !s.sidebarOpen;
const sidebarState = (s: AppStore): "expanded" | "collapsed" => (s.sidebarOpen ? "expanded" : "collapsed");

export const sidebarSelectors = {
	isSidebarOpen,
	isSidebarCollapsed,
	sidebarState,
};
