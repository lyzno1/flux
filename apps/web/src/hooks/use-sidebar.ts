import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { getAppStoreState, useAppStore } from "@/stores/app/store";
import { useIsMobile } from "./use-is-mobile";

export function useSidebar() {
	const open = useAppStore(sidebarSelectors.isSidebarOpen);
	const state = useAppStore(sidebarSelectors.sidebarState);
	const isMobile = useIsMobile();

	return {
		open,
		state,
		isMobile,
		toggleSidebar: getAppStoreState().toggleSidebar,
		setSidebarOpen: getAppStoreState().setSidebarOpen,
	};
}
