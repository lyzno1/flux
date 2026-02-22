import { createFileRoute, Outlet, redirect, useMatches } from "@tanstack/react-router";
import * as z from "zod";
import i18n from "@/i18n";
import { AUTH_DEFAULT_REDIRECT, normalizeAuthRedirect } from "@/lib/auth-redirect";

const authSearchSchema = z.object({
	redirect: z
		.string()
		.default(AUTH_DEFAULT_REDIRECT)
		.catch(AUTH_DEFAULT_REDIRECT)
		.transform((v) => normalizeAuthRedirect(v, AUTH_DEFAULT_REDIRECT)),
});

function AuthLayout() {
	const matches = useMatches();
	const leafId = matches[matches.length - 1]?.id;

	return (
		<div
			key={leafId}
			className="fade-in slide-in-from-bottom-2 h-full animate-in duration-300 motion-reduce:animate-none"
		>
			<Outlet />
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
