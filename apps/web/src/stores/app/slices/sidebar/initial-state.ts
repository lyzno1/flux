export interface SidebarState {
	sidebarOpen: boolean;
	sidebarIsMobile: boolean;
}

export const initialSidebarState: SidebarState = {
	sidebarOpen: true,
	sidebarIsMobile: false,
};
