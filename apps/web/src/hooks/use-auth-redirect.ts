import { getRouteApi } from "@tanstack/react-router";
import { AUTH_DEFAULT_REDIRECT, normalizeAuthRedirect } from "@/lib/auth-redirect";

const authRoute = getRouteApi("/_auth");

export function useAuthRedirect() {
	const { redirect } = authRoute.useSearch();
	return normalizeAuthRedirect(redirect, AUTH_DEFAULT_REDIRECT);
}
