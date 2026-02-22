import { getRouteApi } from "@tanstack/react-router";

const authRoute = getRouteApi("/_auth");

export function useAuthRedirect() {
	const { redirect } = authRoute.useSearch();
	return redirect;
}
