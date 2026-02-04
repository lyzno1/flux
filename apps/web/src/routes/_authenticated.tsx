import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context, location }) => {
		if (!context.auth.data) {
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}
		return { session: context.auth.data };
	},
	component: () => <Outlet />,
});
