import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { PageLoading } from "./components/page-loading";
import { authClient } from "./lib/auth/client";
import { router } from "./router";

export function App() {
	const auth = authClient.useSession();
	const authStatus = auth.data ? "authenticated" : "anonymous";
	const previousAuthStatus = useRef(authStatus);

	useEffect(() => {
		if (auth.isPending) {
			return;
		}
		if (previousAuthStatus.current === authStatus) {
			return;
		}
		previousAuthStatus.current = authStatus;
		void router.invalidate();
	}, [auth.isPending, authStatus]);

	if (auth.isPending && !auth.data) {
		return <PageLoading />;
	}

	return <RouterProvider router={router} context={{ auth }} />;
}
