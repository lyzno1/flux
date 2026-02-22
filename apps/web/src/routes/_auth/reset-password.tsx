import { createFileRoute, redirect } from "@tanstack/react-router";

import { ResetPasswordForm } from "@/components/form/reset-password-form";
import { emailSearchSchema } from "@/lib/auth/search-schema";

export const Route = createFileRoute("/_auth/reset-password")({
	validateSearch: emailSearchSchema,
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
