import { isClient } from "@flux/utils/runtime";
import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 1024;

const mobileQuery = isClient ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`) : null;

export { MOBILE_BREAKPOINT };

export function useIsMobile() {
	return useSyncExternalStore(
		(cb) => {
			mobileQuery?.addEventListener("change", cb);
			return () => mobileQuery?.removeEventListener("change", cb);
		},
		() => mobileQuery?.matches ?? false,
		() => false,
	);
}
