import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import "./i18n";
import { authClient } from "./lib/auth-client";
import { router } from "./router";

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

function InnerApp() {
	const auth = authClient.useSession();
	return <RouterProvider router={router} context={{ auth }} />;
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<InnerApp />);
}
