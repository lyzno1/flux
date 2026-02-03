import { createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";

import { ResetPasswordForm } from "@/components/form/reset-password-form";

const searchSchema = z.object({
	email: z.string().email().catch(""),
});

export const Route = createFileRoute("/_auth/reset-password")({
	validateSearch: searchSchema,
	beforeLoad: ({ search }) => {
		if (!search.email) {
			throw redirect({ to: "/forgot-password" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { email } = Route.useSearch();
	return <ResetPasswordForm email={email} />;
}
