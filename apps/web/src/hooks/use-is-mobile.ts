import { useEffect, useSyncExternalStore } from "react";
import { getAppStoreState } from "@/stores/app/store";

const MOBILE_BREAKPOINT = 1024;

function subscribe(callback: () => void) {
	const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
	mql.addEventListener("change", callback);
	return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
	return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function getServerSnapshot() {
	return false;
}

export function useIsMobile() {
	const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	useEffect(() => {
		getAppStoreState().setSidebarIsMobile(isMobile);
	}, [isMobile]);

	return isMobile;
}
