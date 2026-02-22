import { createFileRoute, redirect } from "@tanstack/react-router";

import { VerifyEmailForm } from "@/components/form/verify-email-form";
import { emailSearchSchema } from "@/lib/auth/search-schema";

export const Route = createFileRoute("/_auth/verify-email")({
	validateSearch: emailSearchSchema,
	beforeLoad: ({ search }) => {
		if (!search.email) {
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { email } = Route.useSearch();
	return <VerifyEmailForm email={email} />;
}
