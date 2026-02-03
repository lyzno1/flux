import { createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";

import { VerifyEmailForm } from "@/components/form/verify-email-form";

const searchSchema = z.object({
	email: z.string().email().catch(""),
});

export const Route = createFileRoute("/_auth/verify-email")({
	validateSearch: searchSchema,
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
