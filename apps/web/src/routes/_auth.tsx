import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as z from "zod";

const authSearchSchema = z.object({
	redirect: z
		.string()
		.default("/dashboard")
		.catch("/dashboard")
		.transform((v) => (v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

export const Route = createFileRoute("/_auth")({
	validateSearch: authSearchSchema,
	beforeLoad: ({ context, search }) => {
		if (context.auth.data) {
			throw redirect({ to: search.redirect });
		}
	},
	component: () => <Outlet />,
});
