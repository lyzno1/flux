import { createFileRoute, Outlet, redirect, useMatches } from "@tanstack/react-router";
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
	const matches = useMatches();
	const leafId = matches[matches.length - 1]?.id;

	return (
		<div className="flex h-full">
			<AuthBrandPanel />
			<div
				key={leafId}
				className="fade-in slide-in-from-bottom-2 h-full flex-1 animate-in overflow-y-auto duration-300 motion-reduce:animate-none lg:border-border lg:border-l"
			>
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
