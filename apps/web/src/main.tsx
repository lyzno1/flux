import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

import { PageLoading } from "./components/page-loading";
import "./i18n";
import { authClient } from "./lib/auth/client";
import { router } from "./router";

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

function InnerApp() {
	const auth = authClient.useSession();
	const hasResolvedInitialSession = useRef(false);
	const authStatus = auth.data ? "authenticated" : "anonymous";
	const previousAuthStatus = useRef(authStatus);

	if (!auth.isPending) {
		hasResolvedInitialSession.current = true;
	}

	useEffect(() => {
		if (!hasResolvedInitialSession.current) {
			return;
		}
		if (previousAuthStatus.current === authStatus) {
			return;
		}
		previousAuthStatus.current = authStatus;
		void router.invalidate();
	}, [authStatus]);

	if (!hasResolvedInitialSession.current && auth.isPending) {
		return <PageLoading />;
	}

	return <RouterProvider router={router} context={{ auth }} />;
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<InnerApp />);
}
