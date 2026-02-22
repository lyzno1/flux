import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as z from "zod";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import i18n from "@/i18n";
import { AUTH_DEFAULT_REDIRECT, normalizeAuthRedirect } from "@/lib/auth-redirect";

const authSearchSchema = z.object({
	redirect: z
		.string()
		.default(AUTH_DEFAULT_REDIRECT)
		.catch(AUTH_DEFAULT_REDIRECT)
		.transform((v) => normalizeAuthRedirect(v)),
});

function AuthLayout() {
	return (
		<div className="flex h-full">
			<AuthBrandPanel />
			<div className="h-full flex-1 overflow-y-auto lg:border-border lg:border-l">
				<Outlet />
			</div>
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
	loader: () => i18n.loadNamespaces("auth"),
	component: AuthLayout,
});
