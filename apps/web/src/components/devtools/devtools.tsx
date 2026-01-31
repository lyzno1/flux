import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export function Devtools() {
	return (
		<>
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}
