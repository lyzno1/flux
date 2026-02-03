import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as z from "zod";

import { PageLoading } from "@/components/page-loading";
import { authClient } from "@/lib/auth-client";

const authSearchSchema = z.object({
	redirect: z
		.string()
		.default("/dashboard")
		.catch("/dashboard")
		.transform((v) => (v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

export const Route = createFileRoute("/_auth")({
	validateSearch: authSearchSchema,
	beforeLoad: async ({ context, search }) => {
		const session = context.auth.data ?? (await authClient.getSession().catch(() => ({ data: null }))).data;
		if (session) {
			throw redirect({ to: search.redirect });
		}
	},
	component: AuthLayout,
});

function AuthLayout() {
	const { isPending } = authClient.useSession();

	if (isPending) {
		return <PageLoading />;
	}

	return <Outlet />;
}
