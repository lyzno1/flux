import { createFileRoute, Outlet, redirect, useMatches } from "@tanstack/react-router";
import * as z from "zod";

const authSearchSchema = z.object({
	redirect: z
		.string()
		.default("/dify")
		.catch("/dify")
		.transform((v) => (v.startsWith("/") && !v.startsWith("//") ? v : "/dify")),
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
	component: AuthLayout,
});
