import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context, location }) => {
		try {
			const session = context.auth.data ?? (await authClient.getSession()).data;
			if (!session) {
				throw redirect({
					to: "/login",
					search: { redirect: location.href },
				});
			}
			return { session };
		} catch (error) {
			if (isRedirect(error)) throw error;
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}
	},
	component: () => <Outlet />,
});
