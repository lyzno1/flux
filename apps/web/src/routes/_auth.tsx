import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as z from "zod";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

const authSearchSchema = z.object({
	redirect: z
		.string()
		.default("/dashboard")
		.catch("/dashboard")
		.transform((v) => (v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

function AuthLayout() {
	return (
		<div className="flex h-screen">
			<AuthBrandPanel />
			<div className="hidden w-px bg-border lg:block" />
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}

export const Route = createFileRoute("/_auth")({
	validateSearch: authSearchSchema,
	beforeLoad: ({ context, search }) => {
		if (context.auth.data) {
			throw redirect({ to: search.redirect });
		}
	},
	component: AuthLayout,
});
