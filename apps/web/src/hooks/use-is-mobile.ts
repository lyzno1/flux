import { useEffect, useSyncExternalStore } from "react";
import { getAppStoreState } from "@/stores/app/store";

const MOBILE_BREAKPOINT = 1024;

let mql: MediaQueryList | null = null;

function getMql() {
	if (!mql) mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
	return mql;
}

function subscribe(callback: () => void) {
	const q = getMql();
	q.addEventListener("change", callback);
	return () => q.removeEventListener("change", callback);
}

function getSnapshot() {
	return getMql().matches;
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
